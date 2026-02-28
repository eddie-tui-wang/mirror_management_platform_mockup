# Smart Mirror Management Platform

智能试衣镜多账号管理系统的前端交互原型，演示三层组织架构（Platform → Channel → Customer）与完整 RBAC 权限模型。**全量 Mock 数据，无需后端。**

---

## Quick Start

```bash
npm install
npm run dev        # http://localhost:3000
```

```bash
npm run build && npm start   # 生产构建
```

**Node.js ≥ 18 / npm ≥ 9**

---

## Demo 账号

| 角色 | 邮箱 | 密码 | 进入后首页 |
|------|------|------|-----------|
| PlatformSuperAdmin | `super@platform.com` | `demo` | `/dashboard/channels` |
| ChannelOwner | `admin@channel-a.com` | `demo` | `/dashboard/channel/customers` |
| HQOwner | `hq.admin@x.com` | `demo` | `/dashboard/customer/users` |

> 登录页有快速切换卡片，无需手动输入。

---

## 权限演示重点

| 要观察的现象 | 操作方式 |
|-------------|---------|
| 菜单随角色变化 | 切换三个账号，比较侧边栏 |
| 按钮级权限（置灰 + 锁图标） | 同一页面，不同角色的操作按钮状态不同 |
| 路由守卫（403） | 以 ChannelOwner 登录后访问 `/dashboard/channels` |
| 数据隔离 | 渠道端只看到本渠道客户；客户端只看到本组织数据 |

---

## 项目结构

```
src/
├── app/
│   ├── page.tsx                      # 登录页
│   ├── forgot-password/              # 重置密码（2 步流程）
│   └── dashboard/
│       ├── layout.tsx                # RouteGuard + AppLayout
│       ├── channels/                 # [平台] 渠道管理
│       ├── customers/                # [平台] 客户管理
│       ├── users/                    # [平台] 用户与角色
│       ├── assets/garments|templates # [平台] 服装库 / 模板库
│       ├── assets/devices            # [平台] 设备聚合视图
│       ├── channel/customers         # [渠道] 客户管理
│       ├── customer/users|garments   # [客户] 成员 / 服装库
│       ├── customer/templates|devices# [客户] 模板库 / 设备
│       └── settings/                 # 个人设置（三端通用）
│
├── components/
│   ├── PermGuard.tsx                 # 按钮级权限守卫
│   ├── RouteGuard.tsx                # 路由级权限守卫
│   └── AppLayout.tsx                 # 侧边栏 + Header
│
└── lib/
    ├── permissions.ts                # RBAC：角色 → 权限 Key 映射
    ├── mock-data.ts                  # Mock 数据 + 查询函数
    ├── store.ts                      # Zustand（登录态持久化）
    └── menu-config.ts                # 三端菜单配置
```

---

## 技术栈

| | |
|--|--|
| Next.js 16 App Router | React 19 |
| TypeScript 5 | Ant Design 5 |
| Zustand | Tailwind CSS 4 |

---

## 文档

| 文件 | 内容 |
|------|------|
| [`docs/PRD-Smart-Mirror-Management-Platform.md`](./docs/PRD-Smart-Mirror-Management-Platform.md) | 开发参考：每个模块的访问角色、操作权限 Key、异常状态 |
