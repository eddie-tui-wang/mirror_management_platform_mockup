# PRD-00: System Overview

> Smart Mirror Management Platform — Multi-Tenant RBAC Demo
> Version: 1.0 | Updated: 2026-02-11

---

## 1. Product Overview

Smart Mirror Management 是一个面向智能试衣镜场景的 B2B SaaS 后台管理平台。系统采用 **三层组织架构** + **四角色 RBAC** 模型，为平台运营方、渠道商、终端客户提供差异化的管理视图。

### 1.1 Business Context

| 角色层 | 英文 | 描述 |
|--------|------|------|
| 平台方 (Platform) | Platform | 系统运营方，管理所有渠道和客户 |
| 渠道方 (Channel) | Channel | 代理商/经销商，代管下属客户 |
| 客户方 (Customer) | Customer | 终端品牌方，管理门店镜面设备上的服装和模板 |

### 1.2 Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) + React 19 |
| Language | TypeScript (strict) |
| UI Library | Ant Design v6 (enUS locale) |
| State | Zustand (persist to localStorage) |
| Auth | Mock-based demo accounts (no real backend) |

---

## 2. Organization Hierarchy

```
Platform (p1)
├── Channel A (org_ch_001) — Active
│   ├── Customer Y (org_cu_1002) — Reseller
│   └── Customer Z (org_cu_1003) — Reseller
├── Channel B (org_ch_002) — Disabled
├── Channel C (org_ch_003) — Active
│   └── Customer V (org_cu_1005) — Reseller, Trial
├── Customer X (org_cu_1001) — Direct
└── Customer W (org_cu_1004) — Direct, Trial
```

**Customer Types:**
- **Direct**: 平台直签客户，`parent_org_id = null`
- **Reseller**: 渠道代管客户，`parent_org_id` 指向所属 Channel

**Account Types:**
- **Regular**: 正式付费账户
- **Trial**: 试用账户，有天数限制 + 销售次数限制

---

## 3. Role & Permission Model

### 3.1 Four Roles

| Role | Portal | Description |
|------|--------|-------------|
| `PlatformSuperAdmin` | platform | 全权限超级管理员 |
| `ChannelOwner` | channel | 渠道管理者，可管理下属客户及其账号 |
| `HQOwner` | customer | 客户组织管理者（品牌 HQ），可管理成员、服装、模板 |
| `HQOps` | customer | 客户运营人员，可上传/编辑服装和查看模板，但无删除/邀请/分类管理权限 |

### 3.2 Permission Matrix

命名规则: `{portal}:{resource}:{action}`

| Permission Key | Description | SuperAdmin | ChannelOwner | HQOwner | HQOps |
|----------------|-------------|:----------:|:------------:|:-------:|:-----:|
| `platform:channels:view` | View channel list | Y | - | - | - |
| `platform:channels:create` | Create channel | Y | - | - | - |
| `platform:channels:disable` | Disable/Enable channel | Y | - | - | - |
| `platform:customers:view` | View customer list | Y | - | - | - |
| `platform:customers:create` | Create direct customer | Y | - | - | - |
| `platform:customers:transfer` | Transfer customer ownership | Y | - | - | - |
| `platform:users:view` | View all users | Y | - | - | - |
| `platform:users:disable` | Disable/Enable user | Y | - | - | - |
| `platform:users:reset_password` | Reset user password | Y | - | - | - |
| `platform:users:change_role` | Change user role | Y | - | - | - |
| `platform:roles:view` | View role permissions | Y | - | - | - |
| `platform:garments:view` | View garments (aggregated) | Y | - | - | - |
| `platform:garments:edit` | Edit garment (fallback) | Y | - | - | - |
| `platform:garments:delete` | Delete garment | Y | - | - | - |
| `platform:templates:view` | View templates (aggregated) | Y | - | - | - |
| `platform:templates:create` | Create new template | Y | - | - | - |
| `platform:templates:edit` | Edit template | Y | - | - | - |
| `platform:templates:delete` | Delete template | Y | - | - | - |
| `platform:templates:assign` | Assign template to customer | Y | - | - | - |
| `channel:customers:view` | View customers | Y | Y | - | - |
| `channel:customers:create` | Create channel customer | Y | Y | - | - |
| `channel:users:view` | View customer accounts | Y | Y | - | - |
| `channel:users:reinvite` | Resend invitation | Y | Y | - | - |
| `customer:users:view` | View members | Y | - | Y | Y |
| `customer:users:invite` | Invite member | Y | - | Y | - |
| `customer:users:disable` | Disable member | Y | - | Y | - |
| `customer:users:reset_password` | Reset member password | Y | - | Y | - |
| `customer:garments:view` | View garments | Y | - | Y | Y |
| `customer:garments:upload` | Upload/Import garment | Y | - | Y | Y |
| `customer:garments:edit` | Edit garment | Y | - | Y | Y |
| `customer:garments:delete` | Remove/Delete garment | Y | - | Y | - |
| `customer:garments:manage_categories` | Manage garment categories | Y | - | Y | - |
| `customer:templates:view` | View assigned templates | Y | - | Y | Y |
| `customer:templates:toggle` | Enable/Disable assigned template | Y | - | Y | - |

### 3.3 Three-Layer Permission Enforcement

| Layer | Mechanism | Code Location |
|-------|-----------|--------------|
| Menu | 菜单项根据 `permission` 字段过滤 | `src/lib/menu-config.ts` → `AppLayout` |
| Route | 路由访问守卫，无权限跳转 403 | `src/components/RouteGuard.tsx` |
| Button | 按钮级别隐藏/置灰 | `src/components/PermGuard.tsx` |

---

## 4. Navigation Structure

### 4.1 Platform Portal (`PlatformSuperAdmin`)

```
/dashboard
├── /channels              — Channel Management
├── /customers             — Customer Management
├── /users                 — Users & Roles (Tabs: Users / Role Permissions)
└── /assets
    ├── /garments          — Garments (Aggregated)
    └── /templates         — Template Management
```

### 4.2 Channel Portal (`ChannelOwner`)

```
/dashboard
├── /channel/customers     — Customer Management (scoped to channel)
└── /channel/users         — Customer Account Management
```

### 4.3 Customer Portal (`HQOwner` / `HQOps`)

```
/dashboard
├── /customer/users        — Members
├── /customer/garments     — Garments (with categories)
└── /customer/templates    — Templates (assigned only)
```

---

## 5. Demo Accounts

| Email | Name | Role | Org | Password |
|-------|------|------|-----|----------|
| `super@platform.com` | Platform Admin | PlatformSuperAdmin | Smart Mirror Platform | demo |
| `admin@channel-a.com` | Alice Chen | ChannelOwner | Channel A | demo |
| `hq.admin@x.com` | David Zhang | HQOwner | Customer X | demo |
| `ops1@x.com` | Eva Liu | HQOps | Customer X | demo |

---

## 6. Code Map

| Area | File Path |
|------|-----------|
| Types | `src/lib/types.ts` |
| Mock Data | `src/lib/mock-data.ts` |
| Permissions | `src/lib/permissions.ts` |
| Menu Config | `src/lib/menu-config.ts` |
| Auth Store | `src/lib/store.ts` |
| Route Guard | `src/components/RouteGuard.tsx` |
| Perm Guard | `src/components/PermGuard.tsx` |
| App Layout | `src/components/AppLayout.tsx` |
| Login Page | `src/app/page.tsx` |

---

## 7. PRD Document Index

| # | Document | Module |
|---|----------|--------|
| 00 | [Overview](./00-overview.md) | System architecture, role model, navigation |
| 01 | [Auth & Login](./01-auth-login.md) | Demo login, account selection |
| 02 | [Channel Management](./02-channel-management.md) | Platform → Channels |
| 03 | [Customer Management](./03-customer-management.md) | Platform + Channel → Customers |
| 04 | [User Management](./04-user-management.md) | All portals → Users & Members |
| 05 | [Garment Management](./05-garment-management.md) | Platform + Customer → Garments |
| 06 | [Template Management](./06-template-management.md) | Platform + Customer → Templates |
