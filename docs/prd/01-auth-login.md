# PRD-01: Auth & Login

> 登录页与 Demo 账号选择
> Route: `/` (root)

---

## Code Map

| Item | Path |
|------|------|
| Page Component | `src/app/page.tsx` |
| Auth Store | `src/lib/store.ts` |
| Demo Accounts | `src/lib/mock-data.ts` → `demoAccounts` |
| Type | `src/lib/types.ts` → `DemoAccount`, `AuthState` |

---

## Information (I)

### Page Layout

登录页为全屏页面，紫色渐变背景，三列卡片布局。

| Section | Content |
|---------|---------|
| Header | 标题 "Smart Mirror Management"，副标题说明 RBAC Demo |
| Alert | Demo Guide 提示框，说明权限差异体现方式 |
| Cards | 三列（Platform / Channel / Customer），每列包含该 Portal 下的 Demo 账号卡片 |
| Footer | 提示 "All passwords are 'demo'" |

### Portal 配置

| Portal | Color | Icon | Description |
|--------|-------|------|-------------|
| Platform | `#531dab` (紫) | `BankOutlined` | Global admin view: manage channels, customers, users, and assets |
| Channel | `#0958d9` (蓝) | `TeamOutlined` | Channel agent view: manage customers and their accounts |
| Customer | `#389e0d` (绿) | `ShopOutlined` | Customer view: manage members, garments, and templates |

### Account Card Fields

每张 Demo 账号卡片展示：

| Field | Source |
|-------|--------|
| Name | `account.name` |
| Email | `account.email` |
| Role Tag | `account.role`（Portal 主色标签） |
| Org Tag | `account.org_name` |
| Role Description | 静态映射 `ROLE_DESCRIPTION[role]` |
| Permission Count | `ROLE_PERMISSIONS[role].length` |
| Login Button | 右上角，Portal 主色按钮 |

### Available Demo Accounts

| # | Email | Name | Role | Portal | Org |
|---|-------|------|------|--------|-----|
| 1 | `super@platform.com` | Platform Admin | PlatformSuperAdmin | platform | Smart Mirror Platform |
| 2 | `admin@channel-a.com` | Alice Chen | ChannelOwner | channel | Channel A |
| 3 | `hq.admin@x.com` | David Zhang | HQOwner | customer | Customer X |
| 4 | `ops1@x.com` | Eva Liu | HQOps | customer | Customer X |

---

## Actions (A)

### A1: Click Account Card / Login Button

| Step | Detail |
|------|--------|
| Trigger | 点击任意账号卡片或其 Login 按钮 |
| Handler | `handleLogin(account)` |
| Process | 1. 调用 `useAuthStore.login(account)`，写入 Zustand + localStorage |
| | 2. 显示 success message: `Signed in as {name} ({role})` |
| | 3. `router.push(DEFAULT_ROUTES[portal])` 跳转到对应 Portal 的默认页面 |

### Default Routes

| Portal | Route |
|--------|-------|
| platform | `/dashboard/channels` |
| channel | `/dashboard/channel/customers` |
| customer | `/dashboard/customer/users` |

### A2: Session Persistence

| Behavior | Detail |
|----------|--------|
| Store Key | `smart-mirror-auth` (localStorage) |
| Persist | `currentUser` 和 `isAuthenticated` |
| Restore | 刷新页面后自动恢复登录状态 |
| Logout | Sidebar 用户区点击 Logout，清空 state 并跳回 `/` |

---

## Exceptions (E)

| # | Scenario | Handling |
|---|----------|----------|
| E1 | 未登录状态访问 `/dashboard/*` | `RouteGuard` 重定向到 `/` |
| E2 | 已登录用户访问 `/` | 无自动跳转（可手动重新选择账号） |
| E3 | 访问无权限的路由 | `RouteGuard` 跳转到 `/dashboard/forbidden` |
| E4 | LocalStorage 被清空 | Zustand 读不到持久化数据，`isAuthenticated=false`，回到登录页 |
