# PRD-06: Template Management

> 平台端 + 客户端 — 模板管理
> Routes:
> - Platform: `/dashboard/assets/templates` (permission: `platform:templates:view`)
> - Customer: `/dashboard/customer/templates` (permission: `customer:templates:view`)

---

## Code Map

| Item | Path |
|------|------|
| Platform Page | `src/app/dashboard/assets/templates/page.tsx` |
| Customer Page | `src/app/dashboard/customer/templates/page.tsx` |
| Data Source | `src/lib/mock-data.ts` → `masterTemplates`, `templateAssignments` |
| Helpers | `getMasterTemplateById()`, `getCustomerAssignedTemplates()`, `getTemplateAssignedOrgs()`, `getTemplateUnassignedOrgs()` |
| Types | `src/lib/types.ts` → `MasterTemplate`, `TemplateAssignment` |

---

## Data Model

### MasterTemplate (平台统一管理)

```typescript
interface MasterTemplate {
  template_id: string;    // 模板唯一标识
  name: string;           // 模块统称（如 "Daily Life Scene"）
  prompts: string[];      // 提示词列表
  status: Status;         // Active / Disabled
  created_at: string;
  updated_at: string;
}
```

### TemplateAssignment (模板分配记录)

```typescript
interface TemplateAssignment {
  assignment_id: string;  // 分配记录 ID
  template_id: string;    // 引用的主模板
  org_id: string;         // 被分配的客户组织
  enabled: boolean;       // 客户是否启用
  assigned_at: string;    // 分配时间
  assigned_by: string;    // 分配操作人
}
```

### Ownership Model

```
MasterTemplate (平台拥有, 1)
    └── TemplateAssignment (多, 1:N)
            └── Organization (客户, 被分配方)
```

- **平台**: CRUD 主模板 + 分配给客户
- **客户**: 只能看到被分配的模板 + 控制启用/禁用

### Mock Data Summary

**10 Master Templates:**

| Name | ID | Prompts | Status |
|------|----|---------|--------|
| Daily Life Scene | tpl_001 | 3 prompts | Active |
| Brand Showcase | tpl_002 | 3 prompts | Active |
| Fitting Room | tpl_003 | 3 prompts | Active |
| Holiday Promotion | tpl_004 | 4 prompts | Active |
| Store Guide | tpl_005 | 3 prompts | Active |
| Lookbook | tpl_006 | 4 prompts | Active |
| Summer Collection | tpl_007 | 3 prompts | Active |
| VIP Welcome | tpl_008 | 4 prompts | Active |
| Product Comparison | tpl_009 | 2 prompts | Disabled |
| Winter Theme | tpl_010 | 4 prompts | Active |

**14 Template Assignments:**

| Customer | Templates Assigned |
|----------|-------------------|
| Customer X | tpl_001 (on), tpl_003 (on), tpl_004 (off), tpl_006 (on) |
| Customer Y | tpl_002 (on), tpl_003 (on), tpl_008 (off) |
| Customer Z | tpl_005 (on), tpl_006 (on), tpl_010 (on) |
| Customer W | tpl_001 (on), tpl_007 (on) |
| Customer V | tpl_004 (on), tpl_005 (off) |

---

## Role Visibility

| Role | Platform Templates | Customer Templates |
|------|:------------------:|:------------------:|
| PlatformSuperAdmin | Y (full CRUD + assign) | - |
| ChannelOwner | - | - |
| HQOwner | - | Y (view + toggle) |
| HQOps | - | Y (view only) |

---

## Part A: Platform Template Management

### Information (I)

#### Page Title

`Template Management`

#### Filters

| Filter | Type | Options | Default |
|--------|------|---------|---------|
| Search | Input.Search | name or prompt keyword | 空 |
| Status | Select | Active / Disabled | undefined |

**Search 逻辑**: 匹配 `name` 或 `prompts[]` 中的任意一个 prompt（大小写不敏感）

#### Table

| Column | DataIndex | Render |
|--------|-----------|--------|
| Template Name | `name` | 纯文本 |
| template_id | `template_id` | `Typography.Text code` |
| Prompts | `prompts` | `Tag` 显示 count: `{n} prompt(s)` |
| Status | `status` | Tag: green="Active", red="Disabled" |
| Assignments | computed | `Tag` 显示 count: `{n} customer(s)` |
| Updated At | `updated_at` | 纯文本 |
| Actions | - | Edit, Assign, Delete |

**Row Key**: `template_id`

### Actions (A)

#### A1: Create Template

| Item | Detail |
|------|--------|
| Button | `Create Template` (Header 右侧, Primary) |
| Permission | `platform:templates:create` |
| Guard | `PermGuard` (hide mode) |
| Modal Title | "Create Template" |
| Modal Width | 520px |

**Modal Content (Prompt Editor):**

1. **Template Name**:
   - `Input` (required)
   - Placeholder: "e.g. Daily Life Scene"

2. **Prompts**:
   - `Input` + `Add` Button (`Space.Compact`)
   - Enter 键触发添加
   - 去重校验: prompt 已存在时 `message.warning`
   - 已添加的 prompts 以 `List` 组件展示
   - 每项有 Delete 按钮 (红色 trash icon)
   - 空状态: "No prompts added yet."

**Submit Validation**: name 不能为空，否则 `message.error`

#### A2: Edit Template

| Item | Detail |
|------|--------|
| Button | `Edit` (每行 Actions) |
| Permission | `platform:templates:edit` |
| Guard | `PermGuard` (disable mode) |
| Modal Title | "Edit Template" |
| Pre-populate | name = `record.name`, prompts = `[...record.prompts]` |

**Modal Content**: 同 Create Template Prompt Editor

#### A3: Assign Template to Customers

| Item | Detail |
|------|--------|
| Button | `Assign` (每行 Actions) |
| Permission | `platform:templates:assign` |
| Guard | `PermGuard` (disable mode) |
| Modal Title | `Assign "{template.name}" to Customers` |
| Modal Width | 560px |

**Modal Content:**

1. **Currently Assigned** (List):
   - 每项显示: `{org_name}` + enabled/disabled Tag
   - "Remove" 按钮 (danger) → `message.success` (simulated)
   - 空状态: "No customers assigned yet."

2. **Add Customers** (Select):
   - `mode="multiple"`
   - Options: 尚未分配该模板的所有 CUSTOMER 组织
   - Source: `getTemplateUnassignedOrgs(template_id)`

**Submit**: `message.success` — `Assigned "{name}" to {count} customer(s) (simulated)`

#### A4: Delete Template

| Item | Detail |
|------|--------|
| Button | `Delete` (每行 Actions, danger) |
| Permission | `platform:templates:delete` |
| Guard | `PermGuard` (disable mode) |
| Behavior | `Modal.confirm` 二次确认 |
| Confirm Title | `Delete template "{name}"?` |
| Confirm Content (有分配) | `This will also remove {count} customer assignment(s).` |
| Confirm Content (无分配) | `This template has no customer assignments.` |
| Result | `message.success` (simulated) |

### Exceptions (E)

| # | Scenario | Handling |
|---|----------|----------|
| E1 | Create 时 name 为空 | `message.error("Please enter a template name")` |
| E2 | 添加重复 prompt | `message.warning("This prompt already exists")` |
| E3 | 删除有分配的模板 | 确认弹窗提示受影响客户数量 |
| E4 | Search 清空 | `onSearch` + `onChange` 双重监听确保清空时重置 |
| E5 | 无 `platform:templates:create` 权限 | Create 按钮隐藏 |
| E6 | 无 `platform:templates:edit` 权限 | Edit 按钮置灰 |

---

## Part B: Customer Templates (Assigned View)

### Information (I)

#### Page Title

`{orgName} - Templates`

#### Data Scope

仅显示分配给当前客户组织的模板 (`templateAssignments` filtered by `org_id`)。

通过 `getCustomerAssignedTemplates(orgId)` 获取，自动联合主模板信息:
- `template_name`: 主模板名称
- `template_prompts`: 主模板提示词列表
- `template_status`: 主模板状态

#### Table

| Column | DataIndex | Render |
|--------|-----------|--------|
| Template Name | `template_name` | 纯文本 |
| template_id | `template_id` | `Typography.Text code` |
| Prompts | `template_prompts` | Tooltip hover 显示编号列表, Tag 显示 count |
| Assigned At | `assigned_at` | 纯文本 |
| Enabled | computed | Switch toggle |

**Row Key**: `assignment_id`

#### Prompts Column Detail

- 显示: `Tag` 包含 `{n} prompt(s)`
- Hover Tooltip: 编号列表展示所有 prompts
  ```
  1. Casual daily outfit recommendation
  2. Seasonal outfit matching
  3. Accessory pairing suggestion
  ```
- `cursor: pointer` 提示可交互

### Actions (A)

#### A1: Toggle Enabled/Disabled

| Item | Detail |
|------|--------|
| Control | `Switch` |
| Permission | `customer:templates:toggle` |
| Check | `canToggle = hasPermission(role, 'customer:templates:toggle')` |
| Behavior | `message.success` — `Template "{name}" enabled/disabled (simulated)` |

**Disabled Conditions:**

| Condition | Switch State | Tooltip |
|-----------|:----------:|---------|
| 主模板 `status === 'Disabled'` | Disabled + unchecked | "Template disabled by platform" |
| 无 `customer:templates:toggle` 权限 | Disabled | "No permission" |
| 正常 + 有权限 | 可切换 | 无 tooltip |

### Role-Specific Behavior

| Feature | HQOwner | HQOps |
|---------|:-------:|:-----:|
| View template list | Y | Y |
| See prompts (hover) | Y | Y |
| Toggle switch | Y (active) | Disabled + "No permission" tooltip |

### Exceptions (E)

| # | Scenario | Handling |
|---|----------|----------|
| E1 | 主模板被平台禁用 | Switch 置灰 + checked=false + tooltip "Template disabled by platform" |
| E2 | HQOps 无 toggle 权限 | Switch 置灰 + tooltip "No permission" |
| E3 | 模板被平台删除（边界） | 名称显示 "-"，prompts 为空 |
| E4 | 无分配模板 | 表格为空 |
