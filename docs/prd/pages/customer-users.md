# Customer > Members

**路径**: `/dashboard/customer/users`
**适用门户**: Customer
**访问权限**: `customer:users:view`
**菜单位置**: 顶级菜单 > Members（如有）

---

## 一、页面概述

客户端 Members 页面供客户管理员管理本组织的成员账号，包括查看成员列表、邀请新成员，以及对成员账号进行禁用/启用和密码重置。

---

## 二、页面内容

### 2.1 成员列表

展示当前客户组织（`org_id = 当前客户 org_id`）的所有成员：

| 列名 | 说明 |
|------|------|
| Email | 成员邮箱 |
| Name | 成员姓名 |
| Status | `Active`（绿色）/ `Disabled`（红色） |
| Last Login | 最近一次登录时间；从未登录显示"—" |
| Active Device | 当前正在使用的设备 ID；无活跃设备显示"—" |
| Actions | Disable/Enable、Reset Password 操作按钮 |

### 2.2 分页

- 默认每页显示 10 条记录。

---

## 三、核心操作

### 3.1 邀请成员（Invite Member）

**所需权限**: `customer:users:invite`

点击 **Invite Member** 打开弹窗：

| 字段 | 是否必填 | 校验规则 |
|------|---------|---------|
| Email | 是 | 必须为有效邮箱格式 |

- 系统向该邮箱发送邀请邮件，受邀用户通过邮件链接完成注册并加入本组织。
- 邀请发出后，该用户将以成员身份出现在列表中，`last_login` 为 `null`（从未登录）。

### 3.2 禁用/启用成员（Disable / Enable）

**所需权限**: `customer:users:disable`

| 操作 | 效果 |
|------|------|
| Disable | 成员账号状态变为 `Disabled`，该成员无法登录 |
| Enable | 成员账号状态恢复为 `Active` |

### 3.3 重置密码（Reset Password）

**所需权限**: `customer:users:reset_password`

- 点击 **Reset Password** 后系统向该成员邮箱发送密码重置邮件。
- 此操作无需知晓旧密码，直接触发重置流程。

---

## 四、黑盒规则

### R-CU-01：Members 页面仅显示本客户组织的成员
成员列表通过 OrgMembership 关联关系过滤，只展示 `org_id = 当前客户 org_id` 的成员。其他客户或渠道的成员不可见。

### R-CU-02：Active Device 反映该成员是否有活跃的设备登录会话
`current_device` 字段记录成员当前正在使用的设备 ID（如果有的话）。这反映该成员是否正在设备端（智能镜）进行活跃操作。

### R-CU-03：客户管理员禁用的是成员账号的全局状态
禁用成员操作修改的是 User.status 字段（全局），而非 OrgMembership 关系。因此若一个用户同时属于多个组织，禁用操作会影响其在所有组织中的登录能力。
