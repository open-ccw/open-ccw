import type { Config } from 'dompurify';

export const default_putify_config: Config = {
  // 1. 白名单：仅允许最基础的文本标签，按需添加
  ALLOWED_TAGS: [
    'p',
    'br',
    'strong',
    'em',
    'u',
    'a', // 如需链接，需配合下方 ALLOWED_ATTR 放开 href
    'ul',
    'ol',
    'li',
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    'blockquote',
    'pre',
    'code',
    'font',
    'img',
  ],
  // 2. 属性白名单：仅允许链接必需的 href，不放行 style 和 class
  ALLOWED_ATTR: ['href', 'target', 'title', 'color', 'src'],
  // 3. 禁止的标签（双重保险）：禁止 script、style、iframe 及 SVG 相关标签
  FORBID_TAGS: [
    'script',
    'style',
    'iframe',
    'object',
    'embed',
    'form',
    'svg',
    'math',
    'path',
    'circle',
    'rect',
    'line',
    'polygon',
    'g',
    'defs',
  ],
  // 4. 禁止的属性（双重保险）：禁止所有事件处理器和内联样式
  FORBID_ATTR: [
    'style',
    'class',
    'id',
    'onerror',
    'onload',
    'onclick',
    'onmouseover',
    'onfocus',
    'onblur',
    'onsubmit',
    'onchange',
  ],
  // 5. URI 协议白名单：拦截 javascript:、data: 等危险协议
  ALLOWED_URI_REGEXP:
    /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
  // 6. 禁止使用 <svg> 和 <math> 的命名空间
  FORBID_CONTENTS: ['svg', 'math'],
  // 7. 严格模式：禁止返回任何可能包含脚本的内容
  RETURN_TRUSTED_TYPE: true,
};
