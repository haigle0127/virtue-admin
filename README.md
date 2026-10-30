# Virtue 管理后台

`virtue-admin` 是 [virtue](../virtue) 后端的管理前端，基于 Nuxt 4 + Nuxt UI 4 构建，覆盖登录、仪表盘、用户、角色、字典与个人设置。

## 技术栈

| 技术 | 版本 | 说明 |
| --- | --- | --- |
| Nuxt | 4.6 | SPA 模式（`ssr: false`） |
| Nuxt UI | 4.12 | 组件库，含 UDashboard、UTable、UModal |
| Tailwind CSS | 4.3 | 样式 |
| Vue | 3.5 | 视图层 |
| TypeScript | 6.0 | 类型 |
| zod | 4.6 | 表单校验 |
| VueUse | 14.4 | 组合式工具 |
| pnpm | 12 | 包管理 |

表格使用 Nuxt UI 的 `UTable`（底层为 TanStack Table），图标使用 Lucide。

## 环境要求

- Node.js 20+（CI 使用 24）
- pnpm
- 已启动的 virtue 后端，默认地址 `http://127.0.0.1:9981`
- 后端数据库已导入 `virtue/sql/virtue.sql`

## 配置

复制 `.env.example` 为 `.env`，按实际后端地址修改：

```bash
NUXT_PUBLIC_API_BASE=http://127.0.0.1:9981
```

未配置时使用 `nuxt.config.ts` 中 `runtimeConfig.public.apiBase` 的默认值。浏览器会直接请求该地址，后端已开启 CORS。

## 启动

```bash
pnpm install
pnpm dev
```

访问 <http://localhost:3000>，默认账号：

- 用户名：`admin`
- 密码：`123456`

> 默认账号仅用于本地开发，请勿用于生产环境。

## 功能

| 页面 | 路径 | 说明 |
| --- | --- | --- |
| 登录 | `/login` | 账号密码登录、显示/隐藏密码、深浅色切换 |
| 仪表盘 | `/` | 用户/角色/字典类型/字典数据统计、最近 5 个用户、快捷入口 |
| 用户管理 | `/system/users` | 按用户名/手机号/状态查询，新增、编辑、分配角色、重置密码、启停、单个与批量删除 |
| 角色管理 | `/system/roles` | 按名称/标识/状态查询，新增、编辑、删除 |
| 字典管理 | `/system/dict` | 字典类型维护；点击进入 `/system/dict/:type` 维护字典数据 |
| 个人设置 | `/settings` | 查看资料、修改密码、外观切换、退出登录 |

当前登录用户不能删除或停用自己；删除用户会同时吊销其登录状态。

## 界面与快捷键

- 侧边栏可折叠、可拖拽调整宽度，移动端以抽屉形式展开。
- 顶部搜索面板可搜索页面，并提供“新建用户 / 新建角色 / 新建字典类型”快捷操作。
- 页面快捷键：`g-h` 仪表盘、`g-u` 用户、`g-r` 角色、`g-d` 字典。
- 深浅色主题可跟随系统，入口在登录页、侧边栏用户菜单和个人设置。
- 危险操作统一使用 `ConfirmModal` 二次确认，不在删除前直接执行。

## 鉴权说明

- 登录成功后，`accessToken`（15 分钟）与 `refreshToken`（7 天）保存在 Cookie（`virtue_access_token`、`virtue_refresh_token`）中，同时用 `useState` 在页面内共享最新值。
- 所有请求自动携带 `Authorization: Bearer <accessToken>`。
- 访问令牌失效（HTTP 401 或响应体 `code === 401`）时自动调用 `/admin-api/auth/refresh-token` 刷新并重试原请求。
- 后端会对刷新令牌做轮换与重放检测，因此前端采用单飞刷新：并发请求只发起一次刷新，其余请求复用结果，避免误触发重放导致会话被吊销。
- 刷新失败会清空本地令牌并跳转 `/login`；未登录访问受保护页面会跳转 `/login?redirect=...`，登录后回到原页面。
- 退出登录、修改密码会吊销当前会话并清理本地令牌。

## 接口约定

- 统一响应：`{ code, msg, data }`，`code === 200` 表示成功；其他 code 由 `useApi` 抛出 `ApiError`，页面用 toast 提示。
- 分页数据：`{ list, total, pageNo }`，列表页使用后端分页，`pageSize` 默认 10。
- 后端 `Long` 类型 ID 以字符串返回，前端按字符串处理。
- 状态字段：用户、角色的 `status` 为数字（`0` 正常、`1` 停用）；字典的 `status` 为字符串 `"0"` / `"1"`。
- 角色字段：后端返回 `mark` / `description` / `state`，前端表单使用 `code` / `description` / `status`。

## 代码结构

```text
app/
├── app.vue                    UApp 外壳、主题色与 SEO
├── app.config.ts              Nuxt UI 配色（primary: green, neutral: zinc）
├── assets/css/main.css        全局样式
├── components/                业务弹窗与通用组件
│   ├── AppLogo.vue
│   ├── AppUserMenu.vue        用户菜单：设置、外观、退出
│   ├── ConfirmModal.vue       统一确认弹窗
│   ├── StatCard.vue           仪表盘统计卡片
│   ├── UserFormModal.vue / UserPasswordModal.vue
│   ├── RoleFormModal.vue
│   └── DictTypeFormModal.vue / DictDataFormModal.vue
├── composables/
│   ├── useApi.ts              请求封装、单飞刷新、401 重试
│   ├── useAuth.ts             登录、当前用户、退出
│   ├── useSession.ts          令牌的 Cookie + useState 存储
│   └── usePagedList.ts        服务端分页列表
├── layouts/default.vue        侧边栏 + 搜索 + 快捷键
├── middleware/auth.global.ts  全局登录守卫
├── pages/                     登录、仪表盘、用户、角色、字典、设置
├── plugins/auth.client.ts     启动时恢复登录态
├── types/api.ts               接口类型定义
└── utils/format.ts            格式化与表格通用样式
```

## 检查

```bash
pnpm lint
pnpm typecheck
```

CI（`.github/workflows/ci.yml`）在 push 时执行 lint 与 typecheck（Node 24）。

## 构建与部署

```bash
# Node 服务方式（产物在 .output）
pnpm build
node .output/server/index.mjs

# 或生成静态站点，部署 .output/public 到 Nginx 等静态服务器
pnpm generate
```

默认监听 `3000` 端口，可通过 `PORT` 环境变量调整。部署时用 `NUXT_PUBLIC_API_BASE` 指定浏览器实际可访问的后端地址，并确保后端允许前端域名跨域；静态托管需要为前端路由配置 `index.html` 回退。

## 已知限制

- 没有菜单、部门与按钮权限管理页面，路由固定，鉴权粒度只有后端角色。
- 未接入验证码；后端验证码获取接口当前未启用。
- 后端导出接口为占位实现，页面未提供导出功能。
