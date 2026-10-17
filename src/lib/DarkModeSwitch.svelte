<script lang="ts">
  import { browser } from '$app/env';
  import { onMount } from 'svelte';

  let dark = $state(false);

  function syncTheme(nextDark: boolean) {
    if (!browser) return;

    document.documentElement.classList.toggle('dark', nextDark);
    dark = nextDark;
  }

  onMount(() => {
    const cachedTheme = localStorage.getItem('theme');
    syncTheme(cachedTheme ? cachedTheme === 'dark' : true);
    localStorage.setItem('theme', dark ? 'dark' : 'light');
  });

  function toggleTheme() {
    const nextDark = !dark;
    syncTheme(nextDark);
    localStorage.setItem('theme', nextDark ? 'dark' : 'light');
  }
</script>

<label
  class="relative inline-block h-6.5 w-12 cursor-pointer align-middle"
  title={dark ? '切换到浅色模式' : '切换到深色模式'}
>
  <span class="animate-spin-slow absolute top-1 left-6.75 z-1 block size-4.5" aria-hidden="true">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="size-full">
      <g fill="#ffd43b">
        <circle r="5" cy="12" cx="12"></circle>
        <path
          d="m21 13h-1a1 1 0 0 1 0-2h1a1 1 0 0 1 0 2zm-17 0h-1a1 1 0 0 1 0-2h1a1 1 0 0 1 0 2zm13.66-5.66a1 1 0 0 1 -.66-.29 1 1 0 0 1 0-1.41l.71-.71a1 1 0 1 1 1.41 1.41l-.71.71a1 1 0 0 1 -.75.29zm-12.02 12.02a1 1 0 0 1 -.71-.29 1 1 0 0 1 0-1.41l.71-.66a1 1 0 0 1 1.41 1.41l-.71.71a1 1 0 0 1 -.7.24zm6.36-14.36a1 1 0 0 1 -1-1v-1a1 1 0 0 1 2 0v1a1 1 0 0 1 -1 1zm0 17a1 1 0 0 1 -1-1v-1a1 1 0 0 1 2 0v1a1 1 0 0 1 -1 1zm-5.66-14.66a1 1 0 0 1 -.7-.29l-.71-.71a1 1 0 0 1 1.41-1.41l.71.71a1 1 0 0 1 0 1.41 1 1 0 0 1 -.71.29zm12.02 12.02a1 1 0 0 1 -.7-.29l-.66-.71a1 1 0 0 1 1.36-1.36l.71.71a1 1 0 0 1 0 1.41 1 1 0 0 1 -.71.24z"
        ></path>
      </g>
    </svg>
  </span>
  <span class="animate-tilt absolute top-1 left-1 z-1 block size-4.5" aria-hidden="true">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" class="size-full fill-[#73c0fc]">
      <path
        d="m223.5 32c-123.5 0-223.5 100.3-223.5 224s100 224 223.5 224c60.6 0 115.5-24.2 155.8-63.4 5-4.9 6.3-12.5 3.1-18.7s-10.1-9.7-17-8.5c-9.8 1.7-19.8 2.6-30.1 2.6-96.9 0-175.5-78.8-175.5-176 0-65.8 36-123.1 89.3-153.3 6.1-3.5 9.2-10.5 7.7-17.3s-7.3-11.9-14.3-12.5c-6.3-.5-12.6-.8-19-.8z"
      ></path>
    </svg>
  </span>
  <input
    type="checkbox"
    class="peer size-0 opacity-0"
    aria-label={dark ? '切换到浅色模式' : '切换到深色模式'}
    checked={dark}
    onchange={toggleTheme}
  />
  <span
    class="absolute inset-0 cursor-pointer rounded-full bg-[#73c0fc] transition-all duration-400 peer-checked:bg-[#183153] peer-focus-visible:shadow-[0_0_0_2px_rgba(24,49,83,0.4)] before:absolute before:bottom-0.5 before:left-0.5 before:z-2 before:size-5.5 before:rounded-[20px] before:bg-[#e8e8e8] before:shadow-[0_1px_2px_rgba(0,0,0,0.15)] before:transition-transform before:duration-400 before:content-[''] peer-checked:before:translate-x-5.5"
  ></span>
</label>
