# AGENTS.md — Open CCW 编码风格与约束

本文件是本仓库的强制编码规范。任何代码生成、修改、重构都必须遵守。与个人习惯冲突时，以本文件为准。

## 技术栈

- SvelteKit + Svelte 5（runes：`$state` / `$derived` / `$props` / `$effect`）。`vite.config.ts` 中已**强制全项目 runes 模式**（仅 node_modules 豁免），新组件禁止使用 legacy 语法（`export let`、`$:`）。
- TypeScript `strict`，`moduleResolution: "bundler"`
- Tailwind CSS v4（主题 token 在 `src/routes/layout.css` 的 `@theme` 中定义）
- API 层：`@ccw-api/api` + `@ccw-api/request`（业务请求统一走 `communityWeb` 等封装，禁止裸 `fetch` 打业务 API；SSO/OAuth 等特殊端点除外）
- 部署目标：Cloudflare（`@sveltejs/adapter-cloudflare` + `functions/`），注意 SSR 安全

## 模块导入

- 跨模块引用一律使用 `#lib` 别名，禁止深层相对路径（`../../` 超过一层即违规）。
- TypeScript 文件导入保留扩展名：`#lib/api.ts`、`#lib/auth/tokenStore`（既有代码两种并存，新代码保持与同文件现状一致即可，勿无谓改动）。
- SvelteKit 专用模块从 `$app/state`（新代码）或 `$app/env`、`$app/navigation` 导入；`$app/stores` 属于遗留，新代码不要用。
- 组件导入带 `.svelte` 扩展名。
- 高频工具从桶文件导入（`import { toast } from "#lib"`，出口在 `src/lib/index.ts`）；新增通用工具时同步维护该桶文件。

## TypeScript

- `strict` 全开，禁止 `any` 逃逸到导出 API 上。内部确需时用 `unknown` + 收窄。
- WebCrypto 的 `BufferSource` 参数只接受 `Uint8Array<ArrayBuffer>`。涉及二进制的辅助函数显式标注 `Uint8Array<ArrayBuffer>`，不要裸写 `Uint8Array`。
- Svelte 5 动态组件用 `Component<any>`（来自 `svelte`），禁止 `LegacyComponentType`。
- `request.json()` 无泛型，用 `as { ... }` 断言。
- 服务端路由中 `error()` / `redirect()` 会抛出，惯用写法是 `return error(...)`。

## SSR 安全

- 所有模块级代码可能跑在服务端。任何 `localStorage` / `sessionStorage` / `document` / `window` 访问必须满足其一：
  1. 位于 `browser` 守卫（`$app/env` 的 `browser`）之后；
  2. 位于 `onMount` 或事件处理器中；
  3. 组件内用 `browser` 三元给出 SSR 兜底值。
- 禁止在模块顶层执行浏览器专属操作。
- 从 SvelteKit 共享状态（如 `page.url`）取得的对象视为只读。需要变异时先拷贝：`const url = new URL(page.url.toString())`。

## JSDoc 与注释

- 所有导出的函数、类型、常量必须有中文 JSDoc（`/** ... */`），一句话说明用途；复杂参数补充 `@param`。
- 非导出代码不加自明注释。只有逻辑不自明处才写注释，同样用中文。
- 注释描述"为什么"，不复述"做了什么"。

## 命名与结构

- 文件与目录：组件 PascalCase（`LoginModal.svelte`），模块 camelCase（`tokenStore.ts`），路由目录小写（`oauth/callback`、`detail/[id]`）。
- 变量/函数 camelCase，类型/接口 PascalCase，模块级常量 SCREAMING_SNAKE_CASE（`OAUTH_SCOPE`）。遗留命名（如 `default_putify_config`）不迁移、不模仿。
- 存储键（localStorage/sessionStorage）集中定义在对应 config 模块（如 `oauthConfig.ts`），禁止散落字符串字面量。
- 单文件超过约 300 行时考虑拆分；组件只做一件事。

## 组件与路由结构

- 路由文件（`+page.svelte`）是薄壳：只做 SEO head、参数提取、装配 `src/lib` 下的业务组件（参照 `notice/interaction/+page.svelte`）。业务逻辑一律写在 `src/lib` 组件中。
- 新增静态页面必须同步把路径加进 `vite.config.ts` 的 `prerender.entries`。
- 每个 `+page.svelte` 提供 `<svelte:head>`：中文 `description` meta + `rel="canonical"`（生产域名 `https://ccw.kivotos.qzz.io`）；`title` 在有独立语义的页面提供。
- Svelte 5 组件约定：props 用 `let { ... }: { ... } = $props()` 解构并内联类型；回调 props 用 `onxxx` 命名；双向绑定用 `$bindable`。
- 大数组状态用 `$state.raw`（参照 `CommentView.svelte`），整块替换而非逐项 push。
- 本地静态资源从 `#lib/assets` 导入；需要拿到 SVG 原文时用 `?raw` 后缀（`import up from "#lib/assets/xxx.svg?raw"`）。

## 异步与错误处理

- 异步函数一律 `async/await`，禁止混合 `.then` 链与 `await`。
- 网络请求失败必须有用户可见反馈（toast）或明确的状态回退，禁止静默吞错。
- 自定义错误继承 `Error` 并携带 `code` 字段（参照 `OAuthError`）。

## UI / 样式（little-style）

- 简约风格，浅色主题为基准；深色模式通过 `@custom-variant dark` + `.dark` 类实现，颜色一律走 `layout.css` 里的语义 token（`bg-bg`、`text-text-primary`、`border-border` 等），禁止硬编码色值，白名单场景（第三方组件配色）除外。
- 统一小圆角：`rounded` / `rounded-lg`，禁止混用大圆角与异形圆角。
- 不使用渐变色（`bg-gradient-*` 禁用）。
- 交互样式过渡统一 100ms（`duration-100`），超过 300ms 仅限入场/退场动画。
- 布局优先 flex（`flex` + `gap-*`），尽量少用绝对定位；绝对定位仅限浮层、角标、装饰元素。
- 禁止明显的亮色单边框；描边用 `border-border` 这类低对比 token，强调用背景色或阴影表达。
- 图标优先内联 SVG（`size-full` 填充容器），属性动画（keyframes）注册到 `@theme` 的 `--animate-*` token，组件内禁止定义 keyframes。
- 组件的可变外观通过 props/class 传入，不在组件内部硬编码业务色值。

## 状态管理

- 优先 svelte store（`writable` / `derived`）+ 模块级函数，不引入额外状态库。
- 持久化写入集中在对应的 store/工具模块内（如 `tokenStore.ts`），组件不直接读写存储。
- `store.subscribe(fn)()` 是同步取值的临时快照，只能用于取值；需要长期订阅时必须保存取消函数或置于模块级有意持久。

## 安全

- 凭据（token、密码、密钥）禁止写入日志、注释、提交信息。
- URL 拼接必须用 `URL` / `URLSearchParams`，禁止字符串拼接 query。
- 服务端代理路由必须做路径白名单校验，且对上游 URL 用解析后的字段（`pathname` / `host`）做精确匹配，禁止 `includes` / `startsWith` 判断。
- 渲染 HTML 必须经 DOMPurify，配置集中在 `purifyConfig.ts`（标签/属性双白名单 + 禁止清单），禁止绕过白名单直接 `innerHTML`。
- 第三方 iframe/播放器通信走封装好的 RPC 模块（`routes/player/[oid]/rpc.ts`），`postMessage` 目标 origin 必须显式校验。

## 提交与检查

- 交付前必须通过 `npm run check`（0 错误；`@apply` 类 CSS 警告也视为不通过）。
- 提交信息用 Conventional Commits（`feat:` / `fix:` / `refactor:` …），正文中文，说明"为什么"。
- 不提交生成物（`.svelte-kit/`、`node_modules/`）与临时脚本。

## 提交安全

- 禁止入库的内容：`.env*` / `.dev.vars*`（密钥、token、账号密码）、临时与调试文件（`tmp*`、`*.log`、探测/测试脚本、抓包输出）、系统垃圾（`Thumbs.db`、`.DS_Store`）。临时文件放系统临时目录，不进仓库目录。
- 危险信息一律不入库：API key、refresh token、会话 cookie、内网/QA 域名与端点、真实用户数据、服务器地址与端口组合。示例配置用占位符，真实值走环境变量或本地未入库配置。
- 提交前检查 diff：发现疑似密钥、长随机串、Bearer token 立即移除并评估是否需要撤销轮换。
- `.vscode/settings.json` **必须提交**（团队共享 TS 版本、格式化配置）；`.vscode/` 下的个人文件（`launch.json` 内含本机路径等）按需提交，不得包含本机敏感路径之外的凭据。
- 硬编码公钥常量（如 `SERVER_PUB_KEYS`）允许入库；任何私钥、共享密钥不允许。
