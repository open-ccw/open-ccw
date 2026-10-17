import { writable } from 'svelte/store';
import { decryptWithPassword, encryptWithPassword, isV2Encrypted } from '#lib/utils/aes';
import { browser } from '$app/env';
import { clearTokenAndUser, updateToken } from '#lib/user/userStore.ts';

const ACCOUNTS_KEY = 'oc_accounts';
const TOKEN_PREFIX = 'oc_token_';
const QUICK_TOKEN_PREFIX = 'oc_quick_token_'; // 快捷登录 token密文
const ACTIVE_KEY = 'oc_active_account';
const QUICK_KEY_DB = 'oc_quick_key_db'; // 快捷登录加密密钥存储IndexedDB
const QUICK_KEY_STORE = 'keys';
const QUICK_KEY_RECORD = 'device_key';

let quickKeyCache: CryptoKey | null = null;

function openQuickKeyDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(QUICK_KEY_DB, 1);
    req.onupgradeneeded = () => {
      if (!req.result.objectStoreNames.contains(QUICK_KEY_STORE)) {
        req.result.createObjectStore(QUICK_KEY_STORE);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function idbSet(key: string, value: ArrayBuffer): Promise<void> {
  const db = await openQuickKeyDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(QUICK_KEY_STORE, 'readwrite');
    tx.objectStore(QUICK_KEY_STORE).put(value, key);
    tx.oncomplete = () => {
      db.close();
      resolve();
    };
    tx.onerror = () => {
      db.close();
      reject(tx.error);
    };
  });
}

async function idbGet(key: string): Promise<ArrayBuffer | undefined> {
  const db = await openQuickKeyDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(QUICK_KEY_STORE, 'readonly');
    const req = tx.objectStore(QUICK_KEY_STORE).get(key);
    req.onsuccess = () => {
      db.close();
      resolve(req.result as ArrayBuffer | undefined);
    };
    req.onerror = () => {
      db.close();
      reject(req.error);
    };
  });
}

async function getQuickKey(): Promise<CryptoKey> {
  if (quickKeyCache) return quickKeyCache;
  const raw = await idbGet(QUICK_KEY_RECORD);
  if (raw) {
    quickKeyCache = await crypto.subtle.importKey('raw', raw, { name: 'AES-GCM' }, true, [
      'encrypt',
      'decrypt',
    ]);
    return quickKeyCache;
  }
  const key = await crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, true, [
    'encrypt',
    'decrypt',
  ]);
  const exported = await crypto.subtle.exportKey('raw', key);
  await idbSet(QUICK_KEY_RECORD, exported);
  quickKeyCache = key;
  return key;
}

async function quickEncrypt(value: string): Promise<string> {
  const key = await getQuickKey();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const cipher = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    new TextEncoder().encode(value),
  );
  const combined = new Uint8Array(iv.byteLength + cipher.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(cipher), iv.byteLength);
  return arrayBufferToBase64(combined.buffer);
}

async function quickDecrypt(payload: string): Promise<string | null> {
  try {
    const key = await getQuickKey();
    const combined = base64ToArrayBuffer(payload);
    const iv = combined.slice(0, 12);
    const cipher = combined.slice(12);
    const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, cipher);
    return new TextDecoder().decode(plain);
  } catch {
    return null;
  }
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary);
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}

export const LOCAL_ACCOUNT_SUFFIX = '-local';

export function localAccountName(uid: string): string {
  return uid + LOCAL_ACCOUNT_SUFFIX;
}

export function displayAccountName(name: string): string {
  return name.endsWith(LOCAL_ACCOUNT_SUFFIX) ? name.slice(0, -LOCAL_ACCOUNT_SUFFIX.length) : name;
}

const LEGACY_LOCAL_KEY = 'oc_token';

export interface Account {
  name: string;
  createdAt: number;
  avatar?: string;
  displayName?: string;
}

export const token = writable<string>('');

if (browser) {
  localStorage.removeItem(LEGACY_LOCAL_KEY);
  try {
    indexedDB.deleteDatabase('oc_token_db');
  } catch {}

  const storedToken = sessionStorage.getItem(TOKEN_PREFIX);
  if (storedToken) {
    4;
    updateToken(storedToken).catch(() => {});
  }
}

token.subscribe((tok) => {
  if (tok && browser) {
    sessionStorage.setItem(TOKEN_PREFIX, tok);
  }
});

export function listAccounts(): Account[] {
  const raw = localStorage.getItem(ACCOUNTS_KEY);
  if (!raw) {
    return [];
  }
  try {
    return JSON.parse(raw) as Account[];
  } catch {
    return [];
  }
}

function saveAccounts(accounts: Account[]): void {
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
}

export async function saveAccount(
  name: string,
  tokenValue: string,
  pin: string,
  avatar?: string,
  displayName?: string,
): Promise<void> {
  const accounts = listAccounts();
  const existingIdx = accounts.findIndex((a) => a.name === name);

  if (existingIdx >= 0) {
    throw '该账号已注册';
  } else {
    accounts.push({
      name,
      createdAt: Date.now(),
      avatar: avatar ?? '',
      displayName: displayName ?? '',
    });
  }

  saveAccounts(accounts);

  const encrypted = await encryptWithPassword(tokenValue, pin);
  localStorage.setItem(TOKEN_PREFIX + name, encrypted);
}

export async function updateAccountToken(
  name: string,
  tokenValue: string,
  pin: string,
  avatar?: string,
  displayName?: string,
): Promise<void> {
  if (!listAccounts().some((a) => a.name === name)) {
    throw '账号不存在';
  }
  const encrypted = await encryptWithPassword(tokenValue, pin);
  localStorage.setItem(TOKEN_PREFIX + name, encrypted);
  if (avatar !== undefined || displayName !== undefined) {
    const accounts = listAccounts();
    const account = accounts.find((a) => a.name === name);
    if (account) {
      if (avatar !== undefined) {
        account.avatar = avatar;
      }
      if (displayName !== undefined) {
        account.displayName = displayName;
      }
      saveAccounts(accounts);
    }
  }
}

export function updateAccountInfo(
  name: string,
  info: { avatar?: string; displayName?: string },
): void {
  const accounts = listAccounts();
  const account = accounts.find((a) => a.name === name);
  if (!account) {
    return;
  }
  if (info.avatar !== undefined) {
    account.avatar = info.avatar;
  }
  if (info.displayName !== undefined) {
    account.displayName = info.displayName;
  }
  saveAccounts(accounts);
}

export async function enableQuickLogin(name: string, tokenValue: string): Promise<void> {
  localStorage.setItem(QUICK_TOKEN_PREFIX + name, await quickEncrypt(tokenValue));
}

export function disableQuickLogin(name: string): void {
  localStorage.removeItem(QUICK_TOKEN_PREFIX + name);
}

function isQuickLoginEnabled(name: string): boolean {
  return localStorage.getItem(QUICK_TOKEN_PREFIX + name) !== null;
}

export function listQuickAccounts(): Account[] {
  return listAccounts().filter((a) => isQuickLoginEnabled(a.name));
}

export async function loadQuickToken(name: string): Promise<string | null> {
  const payload = localStorage.getItem(QUICK_TOKEN_PREFIX + name);
  if (!payload) {
    return null;
  }
  return quickDecrypt(payload);
}

export function setActiveAccount(name: string): void {
  localStorage.setItem(ACTIVE_KEY, name);
}

const REFRESH_PREFIX = 'oc_oauth_refresh_';

/** 账号 OAuth refresh token 与过期时间 */
export interface AccountTokenRefresh {
  refreshToken: string;
  /** 过期时间戳（毫秒） */
  expiresAt: number;
}

/** 保存账号的 OAuth refresh token（明文存储，仅本机） */
export function setAccountRefresh(name: string, refreshToken: string, expiresAt: number): void {
  localStorage.setItem(
    REFRESH_PREFIX + name,
    JSON.stringify({ refreshToken, expiresAt } satisfies AccountTokenRefresh),
  );
}

/** 读取账号的 OAuth refresh token */
export function getAccountRefresh(name: string): AccountTokenRefresh | null {
  const raw = localStorage.getItem(REFRESH_PREFIX + name);
  if (!raw) {
    return null;
  }
  try {
    return JSON.parse(raw) as AccountTokenRefresh;
  } catch {
    return null;
  }
}

/** 删除账号的 OAuth refresh token */
export function clearAccountRefresh(name: string): void {
  localStorage.removeItem(REFRESH_PREFIX + name);
}

export async function loadAccount(id: string, pin: string): Promise<string | null> {
  const encrypted = localStorage.getItem(TOKEN_PREFIX + id);
  if (!encrypted) {
    return null;
  }

  try {
    const value = await decryptWithPassword(encrypted, pin);
    if (!value) {
      return null;
    }
    if (!isV2Encrypted(encrypted)) {
      localStorage.setItem(TOKEN_PREFIX + id, await encryptWithPassword(value, pin));
    }
    token.set(value);
    localStorage.setItem(ACTIVE_KEY, id);
    return value;
  } catch {
    return null;
  }
}

export function removeAccount(name: string): void {
  const accounts = listAccounts().filter((a) => a.name !== name);
  saveAccounts(accounts);
  localStorage.removeItem(TOKEN_PREFIX + name);
  localStorage.removeItem(QUICK_TOKEN_PREFIX + name);
  clearAccountRefresh(name);

  if (getActiveAccount() === name) {
    clearToken();
  }
}

export function getActiveAccount(): string | null {
  return localStorage.getItem(ACTIVE_KEY);
}

export function clearToken(): void {
  localStorage.removeItem(ACTIVE_KEY);
  sessionStorage.removeItem(TOKEN_PREFIX);
  clearTokenAndUser();
}

export async function logout() {
  clearToken();
  sessionStorage.removeItem(TOKEN_PREFIX);
  try {
    token.set('');
  } catch (e) {
    return;
  }
}
