# Virtue Admin

基于 Vue 3 + Vite + TypeScript 的后台管理模板。

## 技术栈

- [Vue 3.5](https://vuejs.org/)
- [Vite 7](https://vitejs.dev/)
- [TypeScript 5](https://www.typescriptlang.org/)
- [Element Plus](https://element-plus.org/)
- [Vue Router 4](https://router.vuejs.org/)
- [Pinia 3](https://pinia.vuejs.org/)
- [UnoCSS](https://unocss.dev/)
- [vxe-table](https://vxetable.cn/)
- [Axios](https://axios-http.com/)

## 功能特性

- 基于 Vue 3 Composition API + `<script setup>` 开发
- 使用 TypeScript 进行类型约束，支持严格的类型检查
- 基于 Element Plus 的组件库和主题定制
- 集成 UnoCSS 原子化 CSS 引擎
- 内置多种布局模式（左侧菜单、顶部菜单、混合菜单）
- 内置多主题切换（明亮、暗黑、深蓝）
- 内置权限控制（菜单级、按钮级）
- 路由标签页（TagsView）和面包屑导航
- 全局搜索菜单（Ctrl + K）
- SVG 图标自动注册和雪碧图生成
- 自动按需导入 Vue API 和组件
- 代码规范和 ESLint 校验
- 单元测试（Vitest）

## 快速开始

### 环境要求

- Node.js >= 18
- npm >= 9

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

### 构建

```bash
# 生产环境
npm run build

# 预发布环境
npm run build:staging
```

### 预览构建产物

```bash
npm run preview
```

### 代码检查

```bash
npm run lint
```

### 单元测试

```bash
npm run test
```

## 项目结构

```
virtue-admin
├── public                     # 静态资源
├── src
│   ├── common                 # 通用模块
│   │   ├── apis               # 通用接口
│   │   ├── assets             # 通用静态资源（图标、样式、图片）
│   │   ├── components         # 通用组件
│   │   ├── composables        # 通用组合式函数
│   │   ├── constants          # 常量
│   │   └── utils              # 工具函数
│   ├── http                   # 网络请求封装（Axios）
│   ├── layouts                # 布局系统
│   │   ├── components         # 布局组件
│   │   └── modes              # 布局模式
│   ├── pages                  # 页面
│   ├── pinia                  # 状态管理（Pinia）
│   ├── plugins                # 插件（全局组件、指令等）
│   ├── router                 # 路由配置
│   ├── App.vue                # 根组件
│   └── main.ts                # 入口文件
├── types                      # 类型声明
├── .env                       # 所有环境通用变量
├── .env.development           # 开发环境变量
├── .env.production            # 生产环境变量
├── .env.staging               # 预发布环境变量
├── eslint.config.js           # ESLint 配置
├── tsconfig.json              # TypeScript 配置
├── uno.config.ts              # UnoCSS 配置
└── vite.config.ts             # Vite 配置
```

## 开发规范

- 使用路径别名 `@` 指向 `src` 目录，`@@` 指向 `src/common` 目录
- 同一业务逻辑的代码和资源应当收拢在一起
- 组件使用 PascalCase 命名，页面使用 kebab-case 命名
- 组合式函数使用 camelCase 命名，以 `use` 开头
- 优先使用 `ref` 定义响应式变量
- Props 使用基于类型的声明，默认值使用响应式 Props 解构
- 优先使用 Scoped CSS，多主题场景使用 CSS 变量

## 浏览器兼容性

- Chrome >= 88
- Edge >= 88
- Firefox >= 78
- Safari >= 14

## 开源协议

[Apache-2.0](LICENSE)
