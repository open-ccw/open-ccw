<script lang="ts">
  import DOMPurify from 'dompurify';
  import { systemNoticePurifyConfig } from '#lib/utils/purifyConfig.ts';

  let { text }: { text: string | null | undefined } = $props();

  // 把 ccw 外部链接改写为站内路由，实现站内跳转
  function toInternalUrl(href: string): string {
    const patterns: [RegExp, string][] = [
      [/^https?:\/\/(?:www\.)?ccw\.site\/post\/(.+)$/i, '/article/$1'],
      [/^https?:\/\/(?:www\.)?ccw\.site\/detail\/(.+)$/i, '/detail/$1'],
      [/^https?:\/\/(?:www\.)?ccw\.site\/(?:student|user)\/(.+)$/i, '/user/$1'],
      [/^https?:\/\/(?:www\.)?learn\.ccw\.site\/article\/(.+)$/i, '/article/$1'],
      [/^https?:\/\/(?:www\.)?ccw\.site\/pages\/tags\/(.+)$/i, '/search?search=%23$1'],
    ];
    for (const [re, replacement] of patterns) {
      if (re.test(href)) {
        return href.replace(re, replacement);
      }
    }
    return href;
  }

  // 预处理：把 <a ... href="..."> 中的外部 ccw 链接改为站内路径，
  // 并对已转换的站内链接去掉 target="_blank"，使用当前标签页导航
  const prepared = $derived(
    (text ?? '').replace(
      /<a\b([^>]*)>/gi,
      (tag: string, attrs: string) => {
        const hrefMatch = /(href\s*=\s*)(["'])(.*?)\2/i.exec(attrs);
        if (!hrefMatch) {
          return tag;
        }
        const internal = toInternalUrl(hrefMatch[3]);
        if (internal === hrefMatch[3]) {
          return tag;
        }
        const newAttrs = attrs
          .replace(
            /(href\s*=\s*)(["'])(.*?)\2/i,
            (_match, prefix: string, quote: string) => `${prefix}${quote}${internal}${quote}`,
          )
          .replace(/\s*target\s*=\s*(["'])[^"']*\1/gi, '');
        return `<a${newAttrs}>`;
      },
    ),
  );

  const safeHtml = $derived(DOMPurify.sanitize(prepared, systemNoticePurifyConfig));
</script>

<div
  class="text-text-primary leading-relaxed text-wrap wrap-anywhere whitespace-break-spaces [&_a]:text-primary [&_a]:underline"
>
  {@html safeHtml}
</div>
