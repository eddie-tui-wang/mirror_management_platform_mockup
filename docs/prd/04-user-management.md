# PRD-04: User Management

> 三端用户/成员管理
> Routes:
> - Platform: `/dashboard/users` (permission: `platform:users:view`)
> - Channel: `/dashboard/channel/users` (permission: `channel:users:view`)
> - Customer: `/dashboard/customer/users` (permission: `customer:users:view`)

---

## Code Map

| Item | Path |
|------|------|
| Platform Page | `src/app/dashboard/users/page.tsx` |
| Channel Page | `src/app/dashboard/channel/users/page.tsx` |
| Customer Page | `src/app/dashboard/customer/users/page.tsx` |
| Data Source | `src/lib/mock-data.ts` → `users`, `memberships`, `organizations` |
| Permission Defs | `src/lib/permissions.ts` → `ROLE_PERMISSIONS`, `PERMISSIONS` |
| Types | `src/lib/types.ts` → `User`, `OrgMembership`, `RoleKey` |

---

## Role Visibility

| Role | Platform Users | Channel Users | Customer Members |
|------|:--------------:|:-------------:|:----------------:|
| PlatformSuperAdmin | Y | - | - |
| ChannelOwner | - | Y (scoped) | - |
| HQOwner | - | - | Y (scoped) |
| HQOps | - | - | Y (view only) |

---

## Part A: Platform Users & Roles

### Page Structure

双 Tab 页面:
- **Tab 1**: User Management (用户列表)
- **Tab 2**: Role Permissions (角色权限表)

### Tab 1: User Management

#### Information (I)

##### Filters

| Filter | Type | Options | Default |
|--------|------|---------|---------|
| Search | Input | email / name / user_id | 空 (支持模糊搜索) |
| Organization | Select | All / {all orgs} | all (支持 URL param `?org=`) |
| Role | Select | All / {all roles} | all |
| Status | Select | All / Active / Disabled | all |

##### Table: User List (Membership View)

每条 `OrgMembership` 生成一行，与 `users` 和 `organizations` 联合。

| Column | DataIndex | Render |
|--------|-----------|--------|
| Email | `email` | 纯文本 |
| user_id | `user_id` | `Typography.Text code` |
| Status | `status` | Tag: green/red |
| Org Type | `org_type` | Tag: geekblue="CHANNEL", volcano="CUSTOMER" |
| Org Name | `org_name` | 纯文本 |
| org_id | `org_id` | `Typography.Text code` |
| Role | `role_key` | Tag |
| Last Login | `last_login` | 文本 / "-" |
| Actions | - | 见 Actions |

**Row Key**: `{user_id}_{org_id}` (一个用户可在多个组织有成员关系)

#### Actions (A)

##### A1: Disable/Enable User

| Item | Detail |
|------|--------|
| Button | `Disable` / `Enable` |
| Permission | `platform:users:disable` |
| Guard | `PermGuard` (default disable mode) |
| Behavior | `message.info` (simulated) |

##### A2: Reset Password

| Item | Detail |
|------|--------|
| Button | `Reset Password` |
| Permission | `platform:users:reset_password` |
| Behavior | `message.info` (simulated) |

##### A3: Change Role

| Item | Detail |
|------|--------|
| Button | `Change Role` |
| Permission | `platform:users:change_role` |
| Behavior | `message.info` (simulated) |

### Tab 2: Role Permissions

#### Information (I)

展示所有角色及其权限数量，支持展开查看详细权限列表。

| Column | DataIndex | Render |
|--------|-----------|--------|
| Role Name | `role_key` | `Tag color="blue"` |
| Permission Count | `permissionCount` | 数字 |

**Expandable Row**: 展开后显示该角色的全部 Permission Key + 对应描述。

| Role | Permission Count |
|------|:----------------:|
| PlatformSuperAdmin | 34 (全部) |
| ChannelOwner | 4 |
| HQOwner | 11 |
| HQOps | 5 |

#### Exceptions (E)

| # | Scenario | Handling |
|---|----------|----------|
| E1 | URL 带 `?org=org_ch_001` | 自动筛选该组织用户 |
| E2 | 搜索无结果 | 表格为空 |

---

## Part B: Channel Customer Accounts

### Information (I)

#### Page Title

`{channelOrgName} - Customer Account Management`

#### Data Scope

显示当前渠道下属所有客户组织的成员账号。

#### Filters

| Filter | Type | Options | Default |
|--------|------|---------|---------|
| Customer | Select | All / {channel customers} | all (支持 URL param `?org=`) |
| Status | Select | All / Active / Disabled | all |
| Role | Select | All / HQOwner / HQOps | all |

#### Table

| Column | DataIndex | Render |
|--------|-----------|--------|
| Email | `email` | 纯文本 |
| user_id | `user_id` | `Typography.Text code` |
| Customer Name | `org_name` | 纯文本 |
| customer_id | `org_id` | `Typography.Text code` |
| Role | `role_key` | Tag: blue="HQOwner", cyan="HQOps" |
| Status | `status` | Tag: green/red |
| Last Login | `last_login` | 文本 / "-" |
| Actions | - | Resend Invitation |

### Actions (A)

#### A1: Resend Invitation

| Item | Detail |
|------|--------|
| Button | `Resend Invitation` |
| Permission | `channel:users:reinvite` |
| Guard | `PermGuard` (disable mode) |
| Behavior | `message.info` (simulated) |

### Exceptions (E)

| # | Scenario | Handling |
|---|----------|----------|
| E1 | 未登录 | 返回 null |
| E2 | URL 带 `?org=org_cu_1002` | 自动筛选该客户的账号 |

---

## Part C: Customer Members

### Information (I)

#### Page Title

`{orgName} - Members`

#### Data Scope

仅显示当前客户组织的成员。

#### Table: Member List

| Column | DataIndex | Render |
|--------|-----------|--------|
| Email | `email` | 纯文本 |
| Name | `name` | 纯文本 |
| Role | `role_key` | Tag: blue="HQOwner", green="HQOps" |
| Status | `status` | Tag: green/red |
| Last Login | `last_login` | 文本 / "-" |
| Active Device | `current_device` | 文本 / "-" |
| Actions | - | 见 Actions |

### Actions (A)

#### A1: Invite Member

| Item | Detail |
|------|--------|
| Button | `Invite Member` (Header 右侧, Primary) |
| Permission | `customer:users:invite` |
| Guard | `PermGuard` (hide mode) |
| Modal Title | "Invite Member" |

**Modal Form:**

| Field | Type | Validation |
|-------|------|------------|
| Email | Input | Required + email format |
| Role | Select (HQOwner / HQOps) | Required |

#### A2: Disable/Enable Member

| Item | Detail |
|------|--------|
| Button | `Disable` / `Enable` |
| Permission | `customer:users:disable` |
| Guard | `PermGuard` (disable mode) |
| Behavior | `message.info` (simulated) |

#### A3: Reset Password

| Item | Detail |
|------|--------|
| Button | `Reset Password` |
| Permission | `customer:users:reset_password` |
| Guard | `PermGuard` (disable mode) |
| Behavior | `message.info` (simulated) |

### Role-Specific Behavior

| Feature | HQOwner | HQOps |
|---------|:-------:|:-----:|
| View member list | Y | Y |
| Invite Member button | Y (visible) | Hidden |
| Disable/Enable button | Y (active) | Disabled + tooltip |
| Reset Password button | Y (active) | Disabled + tooltip |

### Exceptions (E)

| # | Scenario | Handling |
|---|----------|----------|
| E1 | HQOps 点击 Disable 按钮 | 按钮置灰 + Tooltip "No permission: Disable member" |
| E2 | 邀请表单 Email 为空 | Ant Form required 校验 |
| E3 | 邀请表单 Role 未选 | Ant Form required 校验 |
