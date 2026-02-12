# PRD-00: System Overview

> Smart Mirror Management Platform — Multi-Tenant RBAC Demo
> Version: 2.0 | Updated: 2026-02-12

---

## 1. Product Overview

Smart Mirror Management 是一个面向智能试衣镜场景的 B2B SaaS 后台管理平台。系统采用 **三层组织架构** + **四角色 RBAC** 模型，为平台运营方、渠道商、终端客户提供差异化的管理视图。

本系统为 **Demo / Prototype** 性质，使用模拟数据与预设账号，用于验证业务流程和权限模型。

> **Visual Reference**: See running prototype for all UI layout, styling, and interaction details.

---

## 2. Glossary

| Term | Definition |
|------|-----------|
| **Platform** | 系统运营方（平台方），拥有全局管理权限，管理所有渠道和客户 |
| **Channel** | 渠道商 / 代理商 / 经销商，代管其下属客户 |
| **Customer** | 终端品牌方，管理门店镜面设备上的服装和模板 |
| **Direct (Customer)** | 平台直签客户，不隶属于任何渠道 |
| **Reseller (Customer)** | 渠道代管客户，隶属于某个渠道 |
| **Regular (Account)** | 正式付费账户，无使用限制 |
| **Trial (Account)** | 试用账户，有天数限制和销售次数限制，任一条件到达即到期 |

---

## 3. Organization Hierarchy

```
Platform (系统运营方)
├── Channel A — Active
│   ├── Customer Y — Reseller, Regular
│   └── Customer Z — Reseller, Regular
├── Channel B — Disabled
├── Channel C — Active
│   └── Customer V — Reseller, Trial
├── Customer X — Direct, Regular
└── Customer W — Direct, Trial
```

**Customer Types:**
- **Direct**: 平台直签客户，不挂靠任何渠道
- **Reseller**: 渠道代管客户，归属于某个 Channel

**Account Types:**
- **Regular**: 正式付费账户
- **Trial**: 试用账户，受天数限制 + 销售次数限制约束

---

## 4. Role Definitions

| Role | Portal | Description |
|------|--------|-------------|
| Platform Super Admin | Platform Portal | 全权限超级管理员，管理所有渠道、客户、用户及资产 |
| Channel Owner | Channel Portal | 渠道管理者，可管理下属客户及其账号 |
| HQ Owner | Customer Portal | 客户组织管理者（品牌 HQ），可管理成员、服装、模板 |
| HQ Ops | Customer Portal | 客户运营人员，可上传/编辑服装和查看模板，但无删除/邀请/分类管理权限 |

---

## 5. Multi-Tenancy Rules

数据隔离是系统的核心安全原则：

1. **渠道隔离**: 每个渠道只能看到和管理自己下属的客户及其账号，不能看到其他渠道或直签客户的数据
2. **客户隔离**: 每个客户只能看到和管理自己组织内的成员、服装和已分配模板，不能看到其他客户的数据
3. **平台全局**: 平台管理员拥有全局视角，可以查看和管理所有渠道、客户及其下属数据

---

## 6. Permission Enforcement Model

系统通过三个层级实施权限控制：

1. **功能级隐藏**: 用户只能看到自己有权限访问的菜单项和导航入口，无权限的功能模块完全不展示
2. **页面级拦截**: 用户通过直接输入地址等方式访问无权限页面时，系统拦截并展示无权限提示
3. **操作级禁用**: 在有权限查看的页面内，某些操作按钮根据用户角色隐藏或禁用

---

## 7. Permission Matrix

> **Note**: 这是所有 PRD 中唯一保留 permission key 的地方，作为开发参考。其他 PRD 用自然语言描述角色能力。

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

---

## 8. Module Access by Role

| Module | SuperAdmin | ChannelOwner | HQOwner | HQOps |
|--------|:----------:|:------------:|:-------:|:-----:|
| Channel Management | Y | - | - | - |
| Customer Management | Y (all) | Y (own channel) | - | - |
| User Management | Y (all) | Y (channel customers) | Y (own org) | Y (view only) |
| Garment Management | Y (aggregated) | - | Y (own org) | Y (limited) |
| Template Management | Y (full CRUD + assign) | - | Y (view + toggle) | Y (view only) |

---

## 9. Prototype Demo Accounts

| Email | Name | Role | Organization | Password |
|-------|------|------|--------------|----------|
| super@platform.com | Platform Admin | Platform Super Admin | Smart Mirror Platform | demo |
| admin@channel-a.com | Alice Chen | Channel Owner | Channel A | demo |
| hq.admin@x.com | David Zhang | HQ Owner | Customer X | demo |
| ops1@x.com | Eva Liu | HQ Ops | Customer X | demo |

> All demo passwords are `demo`.

---

## 10. PRD Document Index

| # | Document | Module |
|---|----------|--------|
| 00 | [Overview](./00-overview.md) | System overview, glossary, role model, permission matrix |
| 01 | [Auth & Login](./01-auth-login.md) | Demo login, account selection, session management |
| 02 | [Channel Management](./02-channel-management.md) | Channel lifecycle management |
| 03 | [Customer Management](./03-customer-management.md) | Customer management (Direct/Reseller + Trial logic) |
| 04 | [User Management](./04-user-management.md) | Three-layer user/member management |
| 05 | [Garment Management](./05-garment-management.md) | Garment catalog + category system |
| 06 | [Template Management](./06-template-management.md) | Template ownership + assignment + customer activation |
