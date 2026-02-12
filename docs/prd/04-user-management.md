# PRD-04: User Management

> 三层用户/成员管理
> Version: 2.0 | Updated: 2026-02-12

---

## Business Context (B)

用户管理分为三个层级，分别服务于不同的管理场景：

1. **平台全局用户管理**: 平台管理员查看和管理系统中所有组织的用户，以及查看角色权限定义
2. **渠道客户账号管理**: 渠道管理者查看其下属客户组织的账号信息
3. **客户内部成员管理**: 客户管理者管理自己组织内的成员

每个层级看到的数据范围不同，可执行的操作也不同。

> **Visual Reference**: See running prototype for visual reference.

---

## Roles & Access (R)

| Capability | Platform Super Admin | Channel Owner | HQ Owner |
|-----------|:-------------------:|:-------------:|:--------:|
| 查看所有用户 | Y | - | - |
| 禁用/启用用户 | Y | - | - |
| 重置用户密码 | Y | - | - |
| 变更用户角色 | Y | - | - |
| 查看角色权限定义 | Y | - | - |
| 查看渠道客户账号 | - | Y | - |
| 重发邀请 | - | Y | - |
| 查看组织成员 | - | - | Y |
| 邀请成员 | - | - | Y |
| 禁用/启用成员 | - | - | Y |
| 重置成员密码 | - | - | Y |

---

## Actions & Flows (A)

### Entity: User / Member

| Attribute | Description | Constraints |
|-----------|------------|-------------|
| Email | 用户邮箱 | Required, unique per org |
| Name | 用户姓名 | Required |
| Role | 用户角色 | Required |
| Status | Active or Disabled | Required |
| Organization | 所属组织 | Required |
| Last Login | 最后登录时间 | System tracked; may be empty |
| Active Device | 当前使用设备 | System tracked; Customer members only |

---

### Part A: Platform Users & Roles

平台用户管理包含两个功能区域：用户列表 和 角色权限查看。

#### View User List (Platform)

**Who**: Platform Super Admin
**Goal**: 查看和管理系统中所有组织的用户
**Available Filters**:
- Search: 按邮箱、姓名搜索（模糊匹配）
- Organization: All / specific organization
- Role: All / specific role
- Status: All / Active / Disabled

**Information Displayed**: 邮箱、状态、组织类型（Channel / Customer）、组织名称、角色、最后登录时间

> 注意：一个用户可能在多个组织中有成员关系，列表中按成员关系展示（每个组织一行）

#### Disable / Enable User

**Who**: Platform Super Admin
**Goal**: 暂停或恢复某用户的系统访问
**Steps**:
1. 在用户列表中，点击某用户的"禁用"或"启用"操作
2. 系统切换该用户的状态

**Outcome**: 用户状态在 Active 和 Disabled 之间切换

#### Reset User Password

**Who**: Platform Super Admin
**Goal**: 为某用户重置密码
**Steps**:
1. 在用户列表中，点击某用户的"重置密码"操作
2. 系统重置该用户的密码

**Outcome**: 用户密码被重置

#### Change User Role

**Who**: Platform Super Admin
**Goal**: 变更某用户在其组织中的角色
**Steps**:
1. 在用户列表中，点击某用户的"变更角色"操作
2. 系统变更该用户的角色

**Outcome**: 用户角色被变更

#### View Role Permissions

**Who**: Platform Super Admin
**Goal**: 查看系统中所有角色及其权限定义
**Information Displayed**: 角色名称、该角色拥有的权限数量，可展开查看详细权限列表

| Role | Permission Count |
|------|:----------------:|
| Platform Super Admin | All |
| Channel Owner | 4 |
| HQ Owner | 11 |

---

### Part B: Channel Customer Accounts

#### View Customer Accounts (Channel)

**Who**: Channel Owner
**Goal**: 查看本渠道下属客户的账号信息
**Data Scope**: 显示当前渠道下属所有客户组织的成员账号
**Available Filters**:
- Customer: All / specific customer
- Status: All / Active / Disabled
- Role: All / HQ Owner

**Information Displayed**: 邮箱、所属客户名称、角色、状态、最后登录时间

#### Resend Invitation

**Who**: Channel Owner
**Goal**: 重新发送邀请给某客户账号
**Steps**:
1. 在客户账号列表中，点击某账号的"重发邀请"操作
2. 系统重新发送邀请

**Outcome**: 邀请重新发送给该账号

---

### Part C: Customer Members

#### View Member List (Customer)

**Who**: HQ Owner
**Goal**: 查看本组织的成员列表
**Data Scope**: 仅显示当前客户组织的成员

**Information Displayed**: 邮箱、姓名、角色、状态、最后登录时间、当前使用设备

#### Invite Member

**Who**: HQ Owner
**Goal**: 邀请新成员加入本组织
**Required Information**:
- Email (required, must be valid email format)
- Role: HQ Owner (required)

**Outcome**: 系统向指定邮箱发送邀请，该用户将以选定角色加入当前客户组织

#### Disable / Enable Member

**Who**: HQ Owner
**Goal**: 暂停或恢复某成员的系统访问
**Steps**:
1. 在成员列表中，点击某成员的"禁用"或"启用"操作
2. 系统切换该成员的状态

**Outcome**: 成员状态在 Active 和 Disabled 之间切换

#### Reset Member Password

**Who**: HQ Owner
**Goal**: 为某成员重置密码
**Steps**:
1. 在成员列表中，点击某成员的"重置密码"操作
2. 系统重置该成员的密码

**Outcome**: 成员密码被重置

---

## Constraints & Rules (C)

- 平台用户列表按成员关系展示：一个用户若在多个组织有成员关系，则出现多行
- 渠道端只能看到下属客户组织的成员，不能看到自己渠道的成员（渠道成员由平台管理）
- 客户端只能看到本组织成员
- 邀请成员时，邮箱和角色均为必填
- 从渠道或客户列表跳转到用户管理时，系统自动按对应组织筛选

---

## Edge Cases (E)

| Scenario | Expected Behavior |
|----------|------------------|
| 邀请表单邮箱为空 | 表单校验阻止提交 |
| 邀请表单角色未选择 | 表单校验阻止提交 |
| 搜索无结果 | 列表为空 |
| 渠道下无客户账号 | 列表为空 |
