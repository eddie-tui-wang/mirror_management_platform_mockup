# PRD-02: Channel Management

> 平台端 — 渠道管理
> Route: `/dashboard/channels`
> Permission: `platform:channels:view`

---

## Code Map

| Item | Path |
|------|------|
| Page Component | `src/app/dashboard/channels/page.tsx` |
| Data Source | `src/lib/mock-data.ts` → `organizations` (filter: `org_type === 'CHANNEL'`) |
| Summary Helper | `src/lib/mock-data.ts` → `getChannelSummary()` |
| Permission Guard | `src/components/PermGuard.tsx` |

---

## Role Visibility

| Role | Can Access | Note |
|------|:----------:|------|
| PlatformSuperAdmin | Y | 全部功能可用 |
| ChannelOwner | - | 菜单不可见（无 `platform:channels:view`） |
| HQOwner | - | 菜单不可见 |
| HQOps | - | 菜单不可见 |

---

## Information (I)

### Page Title

`Channel Management`

### Table: Channel List

| Column | DataIndex | Type | Render |
|--------|-----------|------|--------|
| Channel Name | `name` | string | 纯文本 |
| channel_id | `org_id` | string | `Typography.Text code` |
| Status | `status` | Status | Tag: green="Active", red="Disabled" |
| Channel Admin | `adminEmail` | string | 纯文本（从 `getChannelSummary` 获取） |
| Members | `memberCount` | number | 纯文本 |
| Customers | `customerCount` | number | 纯文本 |
| Created At | `created_at` | string | 纯文本 |
| Actions | - | - | 见 Actions 节 |

**Data Row Type**: `ChannelRow extends Organization` + `{ adminEmail, memberCount, customerCount }`

### Mock Data (3 Channels)

| Name | ID | Status | Admin | Members | Customers |
|------|----|--------|-------|---------|-----------|
| Channel A | org_ch_001 | Active | admin@channel-a.com | 2 | 2 |
| Channel B | org_ch_002 | Disabled | owner@channel-b.com | 1 | 0 |
| Channel C | org_ch_003 | Active | admin@channel-c.com | 1 | 1 |

---

## Actions (A)

### A1: Create Channel

| Item | Detail |
|------|--------|
| Button | `Create Channel` (Header 右侧, Primary) |
| Permission | `platform:channels:create` |
| Guard | `PermGuard` (hide mode) |
| Modal Title | "Create Channel" |

**Modal Form:**

| Field | Type | Validation |
|-------|------|------------|
| Channel Name | Input | Required |
| Channel Admin Email | Input | Required + email format |
| Remarks | TextArea | Optional |

**Submit**: `message.success` (simulated)

### A2: View Members

| Item | Detail |
|------|--------|
| Button | `View Members` (每行 Actions) |
| Permission | 无额外限制（已在页面级验证） |
| Behavior | `router.push('/dashboard/users?org={org_id}')` |

### A3: View Customers

| Item | Detail |
|------|--------|
| Button | `View Customers` (每行 Actions) |
| Behavior | `router.push('/dashboard/customers?channel={org_id}')` |

### A4: View Assets

| Item | Detail |
|------|--------|
| Button | `View Assets` (每行 Actions) |
| Behavior | `router.push('/dashboard/assets/garments?org={org_id}')` |

### A5: Disable/Enable Channel

| Item | Detail |
|------|--------|
| Button | `Disable` / `Enable`（根据当前状态切换文案） |
| Permission | `platform:channels:disable` |
| Guard | `PermGuard` (hide mode) |
| Style | danger link |
| Behavior | `message.warning` (simulated) |

---

## Exceptions (E)

| # | Scenario | Handling |
|---|----------|----------|
| E1 | 无 `platform:channels:create` 权限 | Create 按钮被 PermGuard 隐藏 |
| E2 | 无 `platform:channels:disable` 权限 | Disable/Enable 按钮被 PermGuard 隐藏 |
| E3 | 创建表单 Channel Name 为空 | Ant Form required 校验阻止提交 |
| E4 | 创建表单 Email 格式不合法 | Ant Form email type 校验 |
