# Platform > User Management

**路径**: `/dashboard/users`
**适用门户**: Platform
**访问权限**: 需具备平台权限，路由本身不在主导航菜单中（通过 URL 直接访问）
**菜单位置**: 不在主导航菜单中；可通过其他页面跳转或直接输入 URL 访问

---

## 一、页面概述

User Management 页面供平台管理员查看系统中所有组织下的全部用户，并执行用户禁用/启用和密码重置操作。该页面展示的是跨组织的全局用户视图。

---

## 二、页面内容

### 2.1 用户列表

以组织成员关系（OrgMembership）为单位展示数据，每行对应一个用户在某组织中的成员身份：

| 列名 | 说明 |
|------|------|
| Email | 用户邮箱 |
| user_id | 用户唯一标识符 |
| Status | 用户状态：`Active`（绿色）/ `Disabled`（红色） |
| Org Type | 所属组织类型：`CHANNEL`（蓝色）/ `CUSTOMER`（红色） |
| Org Name | 所属组织名称 |
| org_id | 所属组织的唯一标识符 |
| Last Login | 最近一次登录时间；从未登录显示"—" |
| Actions | 操作按钮区域 |

> **注意**：若一个用户同时属于多个组织，则在列表中会出现多行（每个成员关系对应一行）。

### 2.2 搜索与筛选

| 筛选项 | 说明 |
|--------|------|
| 搜索框 | 支持按 email、用户姓名（name）或 user_id 进行模糊搜索（实时过滤） |
| Organization | 下拉筛选，按所属组织过滤；默认显示"All" |
| Status | 下拉筛选：All / Active / Disabled |

页面加载时支持通过 URL 参数 `?org=<org_id>` 预设组织筛选条件（如从其他页面跳转过来时自动聚焦到特定组织）。

---

## 三、核心操作

### 3.1 禁用/启用用户（Disable / Enable）

**所需权限**: `platform:users:disable`

| 操作 | 触发条件 | 效果 |
|------|---------|------|
| Disable | 当前状态为 `Active` | 将用户状态改为 `Disabled`，用户无法登录 |
| Enable | 当前状态为 `Disabled` | 将用户状态恢复为 `Active` |

### 3.2 重置密码（Reset Password）

**所需权限**: `platform:users:reset_password`

- 点击 **Reset Password** 后系统向该用户邮箱发送密码重置邮件。
- 此操作无需用户旧密码，直接触发密码重置流程。

---

## 四、黑盒规则

### R-PU-01：用户与组织的绑定关系是多对多
一个用户可以属于多个组织（OrgMembership 表），因此同一用户在该列表中可能出现多行。每行代表一条独立的组织成员关系。

### R-PU-02：禁用用户与禁用组织是独立操作
禁用某用户（user.status = Disabled）只影响该用户个人的登录能力，不影响其所属组织的其他用户。禁用组织（org.status = Disabled）则影响该组织下所有用户的访问权限。两者可以独立触发。

### R-PU-03：用户 status 字段归属于用户本身，不归属于成员关系
用户的 `status` 字段记录在 User 对象上，而非 OrgMembership 上。因此，禁用一个用户会影响其在所有组织中的访问权限。
