# PRD-01: Auth & Login

> Demo 登录与账号选择
> Version: 2.0 | Updated: 2026-02-12

---

## Business Context (B)

本系统为 Demo 产品，不对接真实后端认证服务。登录页提供预设的 Demo 账号供用户选择，用户点击即可以对应角色身份进入系统。登录机制的核心目的是 **让体验者快速切换不同角色**，感受各角色的权限差异。

> **Visual Reference**: See running prototype for login page layout, styling, and card design.

---

## Roles & Access (R)

登录页对所有用户可见（无需认证）。登录后，系统根据所选账号的角色自动跳转到对应 Portal 的首页。

| Role | Login After Landing |
|------|-------------------|
| Platform Super Admin | 进入 Platform Portal 首页 |
| Channel Owner | 进入 Channel Portal 首页 |
| HQ Owner | 进入 Customer Portal 首页 |

---

## Actions & Flows (A)

### Select Demo Account and Login

**Who**: 任何访问者
**Goal**: 选择一个 Demo 角色进入系统
**Steps**:
1. 用户在登录页看到按 Portal 分组的 Demo 账号卡片（Platform / Channel / Customer）
2. 每张卡片展示账号名称、邮箱、角色、所属组织、角色说明和权限数量
3. 用户点击任意账号卡片或其登录按钮
4. 系统以该账号身份登录，显示成功提示
5. 自动跳转到该角色对应 Portal 的默认首页

**Outcome**: 用户以所选身份进入系统，可以体验该角色的功能和权限

### Available Demo Accounts

| Email | Name | Role | Organization |
|-------|------|------|--------------|
| super@platform.com | Platform Admin | Platform Super Admin | Smart Mirror Platform |
| admin@channel-a.com | Alice Chen | Channel Owner | Channel A |
| hq.admin@x.com | David Zhang | HQ Owner | Customer X |

> All passwords are `demo`.

### Session Persistence

**Who**: 已登录用户
**Goal**: 刷新页面后保持登录状态
**Behavior**:
- 登录状态在浏览器中持久化，刷新页面后自动恢复，无需重新登录
- 关闭标签页后重新打开，仍保持登录状态

### Logout

**Who**: 已登录用户
**Goal**: 退出当前账号并返回登录页
**Steps**:
1. 用户在侧边栏用户区域点击登出
2. 系统清除登录状态
3. 跳转回登录页

**Outcome**: 用户回到登录页，可以选择其他账号重新登录

---

## Constraints & Rules (C)

- 登录页不涉及密码校验逻辑（Demo 模式，所有密码均为 `demo`）
- 一次只能以一个账号身份登录；切换账号需先登出再重新选择
- 已登录用户可以直接回到登录页重新选择账号（无自动跳转拦截）

---

## Edge Cases (E)

| Scenario | Expected Behavior |
|----------|------------------|
| 未登录状态直接访问系统内页 | 系统自动重定向到登录页 |
| 已登录用户直接访问登录页 | 允许访问，可重新选择账号 |
| 已登录用户访问无权限的页面 | 系统跳转到无权限提示页 |
| 浏览器本地存储被清空 | 登录状态丢失，系统回到登录页 |
