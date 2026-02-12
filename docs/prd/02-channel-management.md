# PRD-02: Channel Management

> 渠道生命周期管理
> Version: 2.0 | Updated: 2026-02-12

---

## Business Context (B)

渠道（Channel）是平台与终端客户之间的代理/经销层。平台方通过创建和管理渠道来拓展分销网络，每个渠道有自己的管理员和下属客户。渠道管理模块让平台管理员能够掌控整个渠道网络的状态。

> **Visual Reference**: See running prototype for visual reference.

---

## Roles & Access (R)

| Capability | Platform Super Admin | Channel Owner | HQ Owner | HQ Ops |
|-----------|:-------------------:|:-------------:|:--------:|:------:|
| 查看渠道列表 | Y | - | - | - |
| 创建渠道 | Y | - | - | - |
| 禁用/启用渠道 | Y | - | - | - |
| 查看渠道成员 | Y | - | - | - |
| 查看渠道下属客户 | Y | - | - | - |
| 查看渠道资产 | Y | - | - | - |

> 仅平台超级管理员可访问此模块。其他角色的菜单中不展示渠道管理入口。

---

## Actions & Flows (A)

### Entity: Channel

| Attribute | Description | Constraints |
|-----------|------------|-------------|
| Channel Name | 渠道名称 | Required |
| Status | Active or Disabled | Required |
| Channel Admin | 渠道管理员邮箱 | Required |
| Member Count | 渠道下的用户数 | System computed |
| Customer Count | 渠道下的客户数 | System computed |
| Created At | 创建时间 | System generated |

### Create Channel

**Who**: Platform Super Admin
**Goal**: 将新的代理商/经销商纳入系统
**Required Information**:
- Channel Name (required)
- Channel Admin Email (required, must be valid email format)
- Remarks (optional)

**Outcome**: 系统创建一个新的渠道组织，指定的管理员邮箱成为该渠道的第一个成员（Channel Owner 角色）

### View Channel Members

**Who**: Platform Super Admin
**Goal**: 查看某个渠道下的所有用户
**Steps**:
1. 在渠道列表中，点击某渠道的"查看成员"操作
2. 系统跳转到用户管理页面，自动筛选显示该渠道的用户

**Outcome**: 用户管理页面显示该渠道下的所有成员

### View Channel Customers

**Who**: Platform Super Admin
**Goal**: 查看某个渠道下的所有客户
**Steps**:
1. 在渠道列表中，点击某渠道的"查看客户"操作
2. 系统跳转到客户管理页面，自动筛选显示该渠道的客户

**Outcome**: 客户管理页面显示该渠道下的所有客户

### View Channel Assets

**Who**: Platform Super Admin
**Goal**: 查看某个渠道关联的资产
**Steps**:
1. 在渠道列表中，点击某渠道的"查看资产"操作
2. 系统跳转到服装管理页面，自动筛选显示该渠道关联的资产

**Outcome**: 服装管理页面显示该渠道关联的资产

### Disable / Enable Channel

**Who**: Platform Super Admin
**Goal**: 暂停或恢复某个渠道的运营
**Steps**:
1. 在渠道列表中，点击某渠道的"禁用"或"启用"操作
2. 系统切换该渠道的状态

**Outcome**: 渠道状态在 Active 和 Disabled 之间切换

---

## Constraints & Rules (C)

- 渠道名称为必填项，不能为空
- 渠道管理员邮箱必须是合法的邮箱格式
- 渠道列表展示所有渠道（包括 Active 和 Disabled 状态）

---

## Edge Cases (E)

| Scenario | Expected Behavior |
|----------|------------------|
| 创建渠道时名称为空 | 表单校验阻止提交 |
| 创建渠道时邮箱格式不合法 | 表单校验提示邮箱格式错误 |
| 渠道被禁用后 | 渠道状态变为 Disabled，列表中仍可见 |
