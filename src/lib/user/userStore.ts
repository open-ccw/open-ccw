import { get, writable } from 'svelte/store';
import { token } from '#lib/auth/tokenStore';
import { communityWeb, setToken } from '#lib/api.ts';

/** 登录态：unknown 表示尚未确定（用户数据仍在加载） */
export type AuthStatus = 'unknown' | 'authenticated' | 'guest';

export const user = writable<SelfUser>({ loggedIn: false });

/** 登录态三值，供界面区分“加载中”与“确实未登录” */
export const authStatus = writable<AuthStatus>('unknown');

/** 进行中的用户数据加载数，用于避免加载期间被误判为游客 */
let pendingUserLoads = 0;

export async function updateUser() {
  pendingUserLoads++;
  try {
    const {
      oid,
      name,
      bio,
      reputationScore: { rank, score },
      studentNumber,
      virtualValue,
      avatar,
    } = await communityWeb.getStudentSelfDetail(true, true, []);
    if (oid) {
      user.set({
        loggedIn: true,
        oid,
        name,
        avatar,
        bio,
        reputationScore: { rank, score },
        studentNumber: parseInt(studentNumber),
        virtualValue,
      });
      authStatus.set('authenticated');
    } else {
      throw 'login failed, oid is not defined';
    }
  } catch (e) {
    user.set({ loggedIn: false });
    authStatus.set('guest');
    throw e;
  } finally {
    pendingUserLoads--;
  }
}

export async function updateToken(tok: string) {
  setToken(tok);
  token.set(tok);
  await updateUser();
}

export async function refreshUser(): Promise<void> {
  await updateUser();
}

export function clearTokenAndUser() {
  setToken('');
  user.set({ loggedIn: false });
  authStatus.set('guest');
  token.set('');
}

/**
 * 客户端启动时确定登录态：若没有正在进行的用户加载且仍未登录，则标记为游客，
 * 避免界面一直停留在“加载中”。
 */
export function resolveAuthStatus(): void {
  if (pendingUserLoads > 0) {
    return;
  }
  authStatus.set(get(user).loggedIn ? 'authenticated' : 'guest');
}
