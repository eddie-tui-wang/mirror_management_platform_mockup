# 试衣镜管理系统 - 多账号权限体系 Demo

智能试衣镜多账号管理系统的前端交互原型，用于演示 **多角色、多权限、多模块可见性差异** 与关键交互流程。

## 项目概述

本项目基于《试衣镜多账号体系 PRD》实现，包含三层组织架构（平台 → 渠道 → 客户）和完整的 RBAC 权限模型。所有数据为 Mock 假数据，无需后端服务即可运行。

### 系统架构

```
┌──────────────────────────────────────────────────┐
│                   平台端 (Platform)                │
│  PlatformSuperAdmin - 全局管理                     │
│  模块: 渠道管理 / 客户管理 / 用户与角色 /           │
│        资产(服装库+模板库) / 设备管理 / 会话管理     │
├──────────────────────────────────────────────────┤
│                   渠道端 (Channel)                 │
│  ChannelOwner                                     │
│  模块: 客户管理(名下) / 客户账号 / 设备与会话       │
├──────────────────────────────────────────────────┤
│                   客户端 (Customer)                │
│  HQOwner                                          │
│  模块: 组织成员 / 服装库 / 模板库 / 设备 / 会话     │
└──────────────────────────────────────────────────┘
```

### 角色说明

| 角色 | 所属层级 | 说明 |
|------|---------|------|
| PlatformSuperAdmin | 平台端 | 全局管理员，拥有全部权限 |
| ChannelOwner | 渠道端 | 渠道管理员，可创建客户、管理客户账号 |
| HQOwner | 客户端 | 客户管理员，全权管理本组织资源 |

---

## 快速开始

### 环境要求

- Node.js >= 18
- npm >= 9

### 安装与启动

```bash
# 1. 克隆仓库
git clone https://github.com/eddie-tui-wang/mirror_management_platform_mockup.git
cd mirror_management_platform_mockup

# 2. 安装依赖
npm install

# 3. 启动开发服务器
npm run dev

# 4. 打开浏览器
# 访问 http://localhost:3000
```

### 构建生产版本

```bash
npm run build
npm start
```

---

## 使用指南（Step by Step）

### Step 1: 选择 Demo 账号登录

打开 http://localhost:3000 后，你会看到登录页面，展示三个 Portal（平台端 / 渠道端 / 客户端），每个 Portal 下有对应的 Demo 账号卡片。

**推荐演示顺序：**

1. **先登录 PlatformSuperAdmin**（平台超管）→ 查看全量数据和全部功能按钮
2. **再登录 ChannelOwner**（渠道A - Alice Chen）→ 查看渠道视角
3. **登录 HQOwner**（客户X - David Zhang）→ 查看客户管理视角

使用 Demo Quick Access 下拉或直接输入邮箱/密码登录。

### Step 2: 观察菜单差异

登录后，注意左侧侧边栏的菜单项：
- **平台端**：显示 6 个菜单（渠道管理、客户管理、用户与角色、资产(子菜单)、设备管理、会话管理）
- **渠道端**：仅显示 3 个菜单（客户管理、客户账号、设备与会话）
- **客户端**：显示 5 个菜单（组织成员、服装库、模板库、设备管理、会话管理）

无权限的菜单会自动**隐藏**，不会显示。

### Step 3: 观察按钮级权限差异

进入各页面后，注意操作按钮的状态：
- **有权限**：按钮正常显示，可点击（点击后显示模拟提示）
- **无权限**：按钮显示为**置灰 + 锁定图标**，hover 时出现 tooltip 提示"无权限: xxx"

**关键观察点：**

每个角色只能看到自己 Portal 的菜单和功能。切换不同 Portal 的账号可以观察到菜单项和操作按钮的差异。

### Step 4: 测试路由守卫 (403)

以 ChannelOwner 登录后，在浏览器地址栏手动输入：
```
http://localhost:3000/dashboard/channels
```
将显示 **403 无访问权限** 页面，因为渠道端角色无权访问平台端路由。

### Step 5: 观察数据隔离

- **渠道端**登录后，客户列表只显示该渠道名下的客户（如渠道A只看到客户Y、客户Z）
- **客户端**登录后，服装库、模板库、设备、会话均只显示本组织数据

### Step 6: 切换账号

点击右上角头像 → "切换账号"，返回登录页重新选择不同角色体验。

---

## 技术栈

| 技术 | 用途 |
|------|------|
| Next.js 16 (App Router) | 框架 |
| React 19 | UI 渲染 |
| TypeScript 5 | 类型安全 |
| Ant Design 5 | UI 组件库 |
| @ant-design/icons | 图标库 |
| Zustand | 状态管理（登录态持久化） |
| Tailwind CSS 4 | 辅助样式 |

## 项目结构

```
src/
├── app/
│   ├── layout.tsx                    # 根布局（AntdProvider）
│   ├── page.tsx                      # 登录页（Demo 账号选择）
│   ├── globals.css                   # 全局样式
│   └── dashboard/
│       ├── layout.tsx                # 仪表盘布局（路由守卫 + 侧边栏）
│       ├── page.tsx                  # 自动重定向到对应 Portal 首页
│       ├── forbidden/page.tsx        # 403 页面
│       │
│       ├── channels/page.tsx         # [平台] 渠道管理
│       ├── customers/page.tsx        # [平台] 客户管理
│       ├── users/page.tsx            # [平台] 用户与角色
│       ├── assets/
│       │   ├── garments/page.tsx     # [平台] 服装库（聚合）
│       │   └── templates/page.tsx    # [平台] 模板库（聚合）
│       ├── devices/page.tsx          # [平台] 设备管理
│       ├── sessions/page.tsx         # [平台] 会话管理
│       │
│       ├── channel/
│       │   ├── customers/page.tsx    # [渠道] 客户管理（名下）
│       │   ├── users/page.tsx        # [渠道] 客户账号
│       │   └── sessions/page.tsx     # [渠道] 设备与会话
│       │
│       └── customer/
│           ├── users/page.tsx        # [客户] 组织成员
│           ├── garments/page.tsx     # [客户] 服装库
│           ├── templates/page.tsx    # [客户] 模板库
│           ├── devices/page.tsx      # [客户] 设备管理
│           └── sessions/page.tsx     # [客户] 会话管理
│
├── components/
│   ├── AntdProvider.tsx              # Ant Design 主题配置
│   ├── AppLayout.tsx                 # 主布局（侧边栏 + Header）
│   ├── ForbiddenPage.tsx             # 403 页面组件
│   ├── PermGuard.tsx                 # 权限守卫（按钮级）
│   └── RouteGuard.tsx                # 路由守卫（页面级）
│
└── lib/
    ├── types.ts                      # TypeScript 类型定义
    ├── permissions.ts                # RBAC 权限模型（48 个权限 Key）
    ├── mock-data.ts                  # Mock 数据 + 辅助查询函数
    ├── store.ts                      # Zustand 状态管理
    └── menu-config.ts                # 三端菜单配置
```

## 权限系统设计

### 权限 Key 命名规则

```
{portal}:{resource}:{action}
```

示例：
- `platform:channels:create` → 平台端-渠道-新建
- `channel:customers:view` → 渠道端-客户-查看
- `customer:garments:delete` → 客户端-服装-删除

### 三层权限守卫

1. **菜单级**：无权限的菜单项自动隐藏（`menu-config.ts` + `AppLayout.tsx`）
2. **路由级**：无权限访问的路由显示 403 页面（`RouteGuard.tsx` + `permissions.ts`）
3. **按钮级**：无权限的操作按钮置灰 + tooltip 提示（`PermGuard.tsx`）

### Mock 数据规模

| 数据类型 | 数量 |
|----------|------|
| 组织 | 8（3 渠道 + 5 客户） |
| 用户 | 15 |
| 成员关系 | 15 |
| 服装 | 8 |
| 模板 | 6 |
| 设备 | 6 |
| 会话 | 6 |
| Demo 账号 | 3 |

---

## Demo 账号一览

| 账号 | 邮箱 | 角色 | 所属组织 | 密码 |
|------|------|------|---------|------|
| 平台超管 | super@platform.com | PlatformSuperAdmin | 试衣镜平台 | demo |
| Alice Chen | admin@channel-a.com | ChannelOwner | 渠道A | demo |
| David Zhang | hq.admin@x.com | HQOwner | 客户X | demo |
