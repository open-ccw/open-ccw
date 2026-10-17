// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
/// <reference types="vite/client" />
declare global {
  namespace App {
    interface Platform {
      env: Env;
      cf: CfProperties;
      ctx: ExecutionContext;
    }

    interface Platform {
      env: Env;
      ctx: ExecutionContext;
      caches: CacheStorage;
      cf?: IncomingRequestCfProperties;
    }

    // interface Error {}
    // interface Locals {}
    // interface PageData {}
    // interface PageState {}
  }
}

export {};
