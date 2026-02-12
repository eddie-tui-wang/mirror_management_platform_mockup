# PRD-03: Customer Management

> 客户管理（含 Direct/Reseller + Trial 逻辑）
> Version: 2.0 | Updated: 2026-02-12

---

## Business Context (B)

客户（Customer）是使用智能试衣镜的终端品牌方。客户可以是平台直签（Direct）或由渠道代管（Reseller）。客户管理模块在 **平台端** 和 **渠道端** 各提供一个视图：

- **平台端**: 查看和管理所有客户（全局视角），可创建直签客户
- **渠道端**: 仅查看和管理本渠道下属的客户，可创建渠道客户

> **Visual Reference**: See running prototype for visual reference.

---

## Roles & Access (R)

| Capability | Platform Super Admin | Channel Owner | HQ Owner |
|-----------|:-------------------:|:-------------:|:--------:|
| 查看所有客户 | Y | - | - |
| 创建直签客户 (Direct) | Y | - | - |
| 查看本渠道客户 | - | Y | - |
| 创建渠道客户 (Reseller) | - | Y | - |
| 查看客户成员 | Y | Y (own channel) | - |
| 查看客户资产 | Y | - | - |

---

## Actions & Flows (A)

### Entity: Customer

| Attribute | Description | Constraints |
|-----------|------------|-------------|
| Customer Name | 客户组织名称 | Required |
| Customer Type | Direct (直签) or Reseller (渠道代管) | Required |
| Account Type | Regular (正式) or Trial (试用) | Required |
| Channel | 所属渠道 | Reseller 客户必填；Direct 客户无此属性 |
| HQ Admin | 客户管理员邮箱 | Required |
| Member Count | 客户组织的成员数 | System computed |
| Status | Active or Disabled | Required |
| Created At | 创建时间 | System generated |

### Entity: Trial Information

| Attribute | Description | Constraints |
|-----------|------------|-------------|
| Trial End Date | 试用截止日期 | Required for Trial accounts |
| Trial Days | 试用天数 | Required for Trial accounts |
| Max Sales | 销售次数上限 | Required for Trial accounts |
| Used Sales | 已使用的销售次数 | System tracked |

**Trial 到期判定**: 天数到期 OR 销售配额耗尽，任一条件满足即视为到期

---

### Part A: Platform Customer Management

#### View Customer List (Platform)

**Who**: Platform Super Admin
**Goal**: 查看和管理系统中的所有客户
**Available Filters**:
- Customer Type: All / Direct / Reseller
- Account Type: All / Regular / Trial
- Channel: All / specific channel
- Status: All / Active / Disabled

**Information Displayed**: 客户名称、客户类型、账户类型（含 Trial 状态和剩余信息）、所属渠道、管理员邮箱、成员数、创建时间、状态

#### Account Type Display Rules

| Case | Display |
|------|---------|
| Regular | 标记为 "Regular" |
| Trial (active) | 标记为 "Trial"，展示剩余天数和剩余销售配额 |
| Trial (expired) | 标记为 "Trial - Expired"，展示过期原因（天数到期 or 配额耗尽） |

#### Create Customer (Direct)

**Who**: Platform Super Admin
**Goal**: 将新的直签品牌方纳入系统
**Required Information**:
- Customer Name (required)
- HQ Admin Email (required, must be valid email format)
- Trial Account toggle (optional, default off)
- If Trial is on:
  - Trial Days (required, positive integer)
  - Max Sales (required, positive integer)

**Outcome**: 系统创建一个新的直签客户组织，指定管理员成为该客户的第一个成员（HQ Owner 角色）。若开启 Trial，系统自动计算试用截止日期和销售配额。

#### View Customer Members (Platform)

**Who**: Platform Super Admin
**Goal**: 查看某客户下的所有成员
**Steps**:
1. 在客户列表中，点击某客户的"查看成员"操作
2. 系统跳转到用户管理页面，自动筛选该客户的成员

**Outcome**: 用户管理页面显示该客户下的所有成员

#### View Customer Assets (Platform)

**Who**: Platform Super Admin
**Goal**: 查看某客户的服装资产
**Steps**:
1. 在客户列表中，点击某客户的"查看资产"操作
2. 系统跳转到服装管理页面，自动筛选该客户的资产

**Outcome**: 服装管理页面显示该客户的资产

---

### Part B: Channel Customer Management

#### View Customer List (Channel)

**Who**: Channel Owner
**Goal**: 查看和管理本渠道下属的客户
**Data Scope**: 仅显示当前渠道下属的客户（Reseller 客户）
**Available Filters**:
- Account Type: All / Regular / Trial

**Information Displayed**: 客户名称、账户类型（含 Trial 状态）、管理员邮箱、成员数、创建时间、状态

#### Create Customer (Reseller)

**Who**: Channel Owner
**Goal**: 为本渠道添加新的代管客户
**Required Information**:
- Customer Name (required)
- HQ Admin Email (required, must be valid email format)
- Trial Account toggle (optional, default off)
- If Trial is on:
  - Trial Days (required, positive integer)
  - Max Sales (required, positive integer)

**Outcome**: 系统创建一个新的 Reseller 客户组织，自动归属于当前渠道。指定管理员成为该客户的第一个成员。

#### View Customer Accounts (Channel)

**Who**: Channel Owner
**Goal**: 查看某客户下的账号信息
**Steps**:
1. 在客户列表中，点击某客户的"查看账号"操作
2. 系统跳转到渠道端的用户管理页面，自动筛选该客户的账号

**Outcome**: 用户管理页面显示该客户的账号列表

---

## Constraints & Rules (C)

- Direct 客户不隶属于任何渠道；Reseller 客户必定隶属于一个渠道
- 渠道端创建的客户自动标记为 Reseller 类型并归属当前渠道
- Trial 账户的到期条件为：天数到期 OR 销售配额耗尽（任一满足即到期）
- 渠道只能看到自己的客户，不能看到其他渠道的客户或直签客户
- 从渠道列表跳转到客户管理时，系统自动按该渠道筛选

---

## Edge Cases (E)

| Scenario | Expected Behavior |
|----------|------------------|
| 创建客户时名称为空 | 表单校验阻止提交 |
| 创建客户时邮箱格式不合法 | 表单校验提示格式错误 |
| Trial 开启但天数/配额未填 | 表单校验阻止提交 |
| 渠道下无客户 | 列表为空 |
| Trial 账户天数到期 | 标记为 "Trial - Expired"，展示天数到期原因 |
| Trial 账户配额耗尽 | 标记为 "Trial - Expired"，展示配额耗尽原因 |
