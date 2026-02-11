# PRD-03: Customer Management

> 平台端 + 渠道端 — 客户管理
> Routes:
> - Platform: `/dashboard/customers` (permission: `platform:customers:view`)
> - Channel: `/dashboard/channel/customers` (permission: `channel:customers:view`)

---

## Code Map

| Item | Path |
|------|------|
| Platform Page | `src/app/dashboard/customers/page.tsx` |
| Channel Page | `src/app/dashboard/channel/customers/page.tsx` |
| Data Source | `src/lib/mock-data.ts` → `organizations` (filter: `org_type === 'CUSTOMER'`) |
| Channel Helper | `src/lib/mock-data.ts` → `getChannelCustomers()` |
| Summary Helper | `src/lib/mock-data.ts` → `getCustomerSummary()` |
| Trial Helper | `src/lib/mock-data.ts` → `getTrialInfo()` |
| Types | `src/lib/types.ts` → `Organization`, `CustomerType`, `TrialStatus` |

---

## Role Visibility

| Role | Platform Page | Channel Page |
|------|:------------:|:------------:|
| PlatformSuperAdmin | Y (all customers) | - |
| ChannelOwner | - | Y (scoped to own channel) |
| HQOwner | - | - |
| HQOps | - | - |

---

## Part A: Platform Customer Management

### Information (I)

#### Page Title

`Customer Management`

#### Filters

| Filter | Type | Options | Default |
|--------|------|---------|---------|
| Customer Type | Select | All / Direct / Reseller | all |
| Account Type | Select | All / Regular / Trial | all (支持 URL param `?accountKind=`) |
| Channel | Select | All / {channel names} | all (支持 URL param `?channel=`) |
| Status | Select | All / Active / Disabled | all |

#### Table: Customer List

| Column | DataIndex | Render |
|--------|-----------|--------|
| Customer Name | `name` | 纯文本 |
| customer_id | `org_id` | `Typography.Text code` |
| Customer Type | `customerType` | Tag: blue="Direct", purple="Reseller" |
| Account Type | computed | 见 Account Type Rendering |
| Channel | `channelName` | 文本（Direct 客户显示 "-"） |
| HQ Admin | `adminEmail` | 纯文本 |
| Members | `memberCount` | 数字 |
| Created At | `created_at` | 纯文本 |
| Status | `status` | Tag: green/red |
| Actions | - | 见 Actions |

#### Account Type Rendering

| Case | Display |
|------|---------|
| Regular | `<Tag color="blue">Regular</Tag>` |
| Trial (active) | `<Tag color="orange">Trial</Tag>` + 剩余配额/天数信息 |
| Trial (expired) | `<Tag color="red">Trial - Expired</Tag>` + 原因（天数到期或配额耗尽） |

Hover Tooltip 显示:
- Trial ends: {end_date}, {remaining_days} days remaining
- Used {used}/{max}, {remaining} remaining

### Mock Data (5 Customers)

| Name | ID | Type | Account | Channel | Status |
|------|----|------|---------|---------|--------|
| Customer X | org_cu_1001 | Direct | Regular | - | Active |
| Customer Y | org_cu_1002 | Reseller | Regular | Channel A | Active |
| Customer Z | org_cu_1003 | Reseller | Regular | Channel A | Active |
| Customer W | org_cu_1004 | Direct | Trial (active) | - | Active |
| Customer V | org_cu_1005 | Reseller | Trial (expired) | Channel C | Active |

### Actions (A)

#### A1: Create Customer (Direct)

| Item | Detail |
|------|--------|
| Button | `Create Customer (Direct)` (Header 右侧, Primary) |
| Permission | `platform:customers:create` |
| Guard | `PermGuard` (hide mode) |
| Modal Title | "Create Customer (Direct)" |

**Modal Form:**

| Field | Type | Validation | Condition |
|-------|------|------------|-----------|
| Customer Name | Input | Required | Always |
| HQ Admin Email | Input | Required + email | Always |
| Trial Account | Switch | - | Always (default off) |
| Trial Days | InputNumber (1-90) | Required | Trial = on |
| Trial Limit (Max Sales) | InputNumber (1-9999) | Required | Trial = on |

#### A2: View Members

| Button | Route |
|--------|-------|
| `View Members` | `/dashboard/users?org={org_id}` |

#### A3: View Assets

| Button | Route |
|--------|-------|
| `View Assets` | `/dashboard/assets/garments?org={org_id}` |

### Exceptions (E)

| # | Scenario | Handling |
|---|----------|----------|
| E1 | 无 `platform:customers:create` 权限 | Create 按钮隐藏 |
| E2 | 表单校验失败 | Ant Form 阻止提交 |
| E3 | URL 带 `?channel=org_ch_001` | 自动筛选该渠道下客户 |

---

## Part B: Channel Customer Management

### Information (I)

#### Page Title

`{channelOrgName} - Customer Management`

#### Data Scope

仅显示当前登录渠道的下属客户 (`parent_org_id === currentUser.org_id`)

#### Filters

| Filter | Type | Options | Default |
|--------|------|---------|---------|
| Account Type | Select | All / Regular / Trial | all |

#### Table: Customer List

| Column | DataIndex | Render |
|--------|-----------|--------|
| Customer Name | `name` | 纯文本 |
| customer_id | `org_id` | `Typography.Text code` |
| Account Type | computed | 同 Platform Account Type Rendering |
| HQ Admin | `adminEmail` | 纯文本 |
| Members | `memberCount` | 数字 |
| Created At | `created_at` | 纯文本 |
| Status | `status` | Tag: green/red |
| Actions | - | View Accounts |

### Actions (A)

#### A1: Create Customer (Reseller)

| Item | Detail |
|------|--------|
| Button | `Create Customer (Reseller)` (Header 右侧, Primary) |
| Permission | `channel:customers:create` |
| Guard | `PermGuard` (hide mode) |
| Modal | 同 Platform 创建表单（含 Trial 开关） |

**Created customer**: 自动 `parent_org_id = currentUser.org_id`

#### A2: View Accounts

| Button | Route |
|--------|-------|
| `View Accounts` | `/dashboard/channel/users?org={org_id}` |

### Exceptions (E)

| # | Scenario | Handling |
|---|----------|----------|
| E1 | 未登录 | 返回 null，RouteGuard 重定向 |
| E2 | 渠道下无客户 | 表格为空 |
