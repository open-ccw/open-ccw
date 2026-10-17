import { writable } from 'svelte/store';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastOptions {
  msg?: string;
  time?: number;
  icon?: ToastType;
}

export interface ToastFn {
  (options?: ToastOptions): { close: () => void };
  success: (msg?: string, time?: number) => { close: () => void };
  error: (msg?: string, time?: number) => { close: () => void };
  warning: (msg?: string, time?: number) => { close: () => void };
  info: (msg?: string, time?: number) => { close: () => void };
}

/** 渲染层消费的 toast 条目 */
export interface ToastItem {
  id: number;
  type: ToastType;
  msg: string;
}

/** 当前显示的 toast 列表（由 ToastHost 组件渲染） */
export const toastItems = writable<ToastItem[]>([]);

let nextId = 0;

/** 按 id 移除 toast */
export function dismissToast(id: number): void {
  toastItems.update((list) => list.filter((item) => item.id !== id));
}

function showToast(options: ToastOptions = {}): { close: () => void } {
  const { msg = 'success', time = 2500, icon = 'success' } = options;
  const id = ++nextId;
  toastItems.update((list) => [...list, { id, type: icon, msg }]);
  let closed = false;
  const close = () => {
    if (closed) return;
    closed = true;
    dismissToast(id);
  };
  if (typeof window !== 'undefined' && time > 0) {
    window.setTimeout(close, time);
  }
  return { close };
}

export const toast = Object.assign(showToast, {
  success: (msg?: string, time?: number) => showToast({ msg, time, icon: 'success' }),
  error: (msg?: string, time?: number) => showToast({ msg, time, icon: 'error' }),
  warning: (msg?: string, time?: number) => showToast({ msg, time, icon: 'warning' }),
  info: (msg?: string, time?: number) => showToast({ msg, time, icon: 'info' }),
}) as ToastFn;
