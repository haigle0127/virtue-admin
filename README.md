<p align="center">
  <img width="320" src="http://haigle.gitee.io/static_resources/virtue/image/title.png">
</p>

## 简介

[virtue-admin](https://gitee.com/haigle/virtue-admin) 是 [virtue](https://gitee.com/haigle/virtue) 后端配套的前端管理框架。

基于 [vue-element-admin](https://gitee.com/panjiachen/vue-element-admin) 开源方案构建，采用 Vue 3 + Element Plus + Vite 技术栈。

## 技术栈

- [Vue 3](https://cn.vuejs.org) — 渐进式 JavaScript 框架
- [Element Plus](https://element-plus.org) — 基于 Vue 3 的桌面端组件库
- [Vite](https://cn.vitejs.dev) — 下一代前端构建工具
- [Vue Router 4](https://router.vuejs.org) — 官方路由管理器
- [Vuex 4](https://vuex.vuejs.org) — 状态管理模式
- [Axios](https://axios-http.com) — HTTP 客户端
- [ECharts](https://echarts.apache.org) — 可视化图表库

## 功能特性

- **登录认证** — 支持视频/图片随机动态背景
- **首页仪表盘** — 数据面板与统计图表
- **系统管理**
  - 用户管理
  - 角色管理
  - 权限管理（菜单权限）
- **主题换肤** — 支持动态切换主题色
- **响应式布局** — 适配多端屏幕尺寸
- **错误页面** — 401 / 404 友好提示

## 快速开始

### 环境要求

- Node.js >= 16
- npm >= 8

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

服务默认运行在 http://localhost:9527

### 生产构建

```bash
npm run build:prod
```

## 项目结构

```
virtue-admin
├── public              # 静态资源
├── src
│   ├── api             # 接口请求
│   ├── assets          # 图片、字体、视频等资源
│   ├── components      # 公共组件
│   ├── icons           # SVG 图标
│   ├── layout          # 页面布局框架
│   ├── router          # 路由配置
│   ├── store           # Vuex 状态管理
│   ├── styles          # 全局样式
│   ├── utils           # 工具函数
│   ├── views           # 页面视图
│   │   ├── dashboard   # 首页仪表盘
│   │   ├── login       # 登录页
│   │   ├── system      # 系统管理
│   │   └── theme       # 主题换肤
│   ├── App.vue
│   └── main.js
├── vite.config.js      # Vite 配置
└── package.json
```

virtue © 2015-2026. [haigletech](https://www.haigle.cn) 监制.
