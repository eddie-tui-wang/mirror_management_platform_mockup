# PRD-05: Garment Management

> 平台端 + 客户端 — 服装管理
> Routes:
> - Platform: `/dashboard/assets/garments` (permission: `platform:garments:view`)
> - Customer: `/dashboard/customer/garments` (permission: `customer:garments:view`)

---

## Code Map

| Item | Path |
|------|------|
| Platform Page | `src/app/dashboard/assets/garments/page.tsx` |
| Customer Page | `src/app/dashboard/customer/garments/page.tsx` |
| Data Source | `src/lib/mock-data.ts` → `garments`, `garmentCategories` |
| Helpers | `getOrgGarments()`, `getOrgGarmentCategories()`, `getGarmentCategoryName()` |
| Types | `src/lib/types.ts` → `GarmentCatalog`, `GarmentCategory` |
| Permission Guard | `src/components/PermGuard.tsx` |

---

## Data Model

### GarmentCatalog

```typescript
interface GarmentCatalog {
  catalog_id: string;     // 目录唯一标识
  garment_id: string;     // 服装 ID
  org_id: string;         // 所属组织
  name: string;           // 服装名称
  image_url: string;      // 缩略图 URL
  category_id: string | null;  // 分类 ID（客户自管理）
  status: Status;         // Active / Disabled
  updated_at: string;     // 更新时间
}
```

### GarmentCategory

```typescript
interface GarmentCategory {
  category_id: string;    // 分类唯一标识
  org_id: string;         // 所属客户组织
  name: string;           // 分类名称
  created_at: string;     // 创建时间
}
```

### Mock Data Summary

**Garments (8 items):**

| Name | ID | Org | Category | Status |
|------|----|-----|----------|--------|
| Black Suit Set | g_9001 | Customer X | Tops | Active |
| Summer Dress | g_9002 | Channel A | - | Active |
| Casual Jacket | g_9003 | Customer X | Outerwear | Active |
| Winter Coat | g_9004 | Customer Y | Outerwear | Active |
| Silk Blouse | g_9005 | Customer Z | - | Disabled |
| Denim Series | g_9006 | Channel C | - | Active |
| Evening Gown | g_9007 | Customer X | Dresses | Active |
| Sport Wear | g_9008 | Customer W | - | Active |

**Categories (9 items across 3 customer orgs):**

| Customer X | Customer Y | Customer Z |
|-----------|-----------|-----------|
| Tops | Tops | Formal |
| Dresses | Bottoms | Casual |
| Outerwear | Outerwear | |
| Accessories | | |

---

## Role Visibility

| Role | Platform Garments | Customer Garments |
|------|:-----------------:|:-----------------:|
| PlatformSuperAdmin | Y | - |
| ChannelOwner | - | - |
| HQOwner | - | Y (full) |
| HQOps | - | Y (limited) |

---

## Part A: Platform Garments (Aggregated)

### Information (I)

#### Page Title

`Garments (Aggregated)`

#### Filters

| Filter | Type | Options | Default |
|--------|------|---------|---------|
| Org Type | Select | CHANNEL / CUSTOMER | undefined |
| Organization | Select (searchable) | {filtered orgs} | undefined (支持 URL param `?org=`) |
| Status | Select | Active / Disabled | undefined |

**Organization filter**: 会根据 Org Type 筛选联动更新可选项。

#### Table

| Column | DataIndex | Render |
|--------|-----------|--------|
| Image | `image_url` | `<Image>` 60x60 thumbnail, 圆角 4px, fallback SVG |
| Garment Name | `name` | 纯文本 |
| garment_id | `garment_id` | `Typography.Text code` |
| Org Type | `org_type` | Tag: blue="CHANNEL", orange="CUSTOMER" |
| Org Name | `org_name` | 纯文本 |
| Status | `status` | Tag: green/red |
| Updated At | `updated_at` | 纯文本 |
| Actions | - | View/Edit, Delete |

**Row Key**: `catalog_id`

**Image Fallback**: Base64 编码的 SVG 占位图 (60x60, 灰色背景 + "N/A" 文字)

### Actions (A)

#### A1: View / Edit

| Item | Detail |
|------|--------|
| Button | `View / Edit` |
| Permission | `platform:garments:edit` |
| Guard | `PermGuard` (disable mode) |
| Behavior | `message.info` (simulated) |

#### A2: Delete

| Item | Detail |
|------|--------|
| Button | `Delete` (danger link) |
| Permission | `platform:garments:delete` |
| Guard | `PermGuard` (disable mode) |
| Behavior | `Modal.confirm` 二次确认 |
| Confirm Title | `Delete garment "{name}"?` |
| Confirm Content | `This garment belongs to {org_name}.` |
| Confirm OK | "Delete" (danger) |
| Result | `message.success` (simulated) |

### Exceptions (E)

| # | Scenario | Handling |
|---|----------|----------|
| E1 | 图片加载失败 | 显示 fallback SVG 占位图 |
| E2 | Org Type 切换 | 重置 Organization 筛选 |
| E3 | 无 `platform:garments:delete` 权限 | Delete 按钮置灰 |

---

## Part B: Customer Garments (with Categories)

### Information (I)

#### Page Title

`{orgName} - Garments`

#### Data Scope

仅显示当前客户组织的服装 (`org_id === currentUser.org_id`)

#### Filters

| Filter | Type | Options | Default |
|--------|------|---------|---------|
| Category | Select (allowClear) | {org categories} + "Uncategorized" | undefined (all) |

**Special filter value**: `__none__` → 筛选 `category_id === null` 的服装

#### Table

| Column | DataIndex | Render |
|--------|-----------|--------|
| Image | `image_url` | `<Image>` 60x60, fallback SVG |
| Garment Name | `name` | 纯文本 |
| garment_id | `garment_id` | `Typography.Text code` |
| Category | `category_id` | Tag (blue) via `getGarmentCategoryName()` / "-" |
| Status | `status` | Tag: green/red |
| Updated At | `updated_at` | 纯文本 |
| Actions | - | Set Category, Edit, Remove |

### Actions (A)

#### A1: Upload / Import

| Item | Detail |
|------|--------|
| Button | `Upload / Import` (Header 右侧, Primary) |
| Permission | `customer:garments:upload` |
| Guard | `PermGuard` (hide mode) |
| Behavior | `message.info` (simulated) |

#### A2: Manage Categories

| Item | Detail |
|------|--------|
| Button | `Manage Categories` (Header 右侧, 非 Primary) |
| Permission | `customer:garments:manage_categories` |
| Visibility | 仅当用户有权限时渲染（`canManageCategories` 条件渲染） |
| Modal Title | "Manage Categories" |
| Modal Width | 480px |

**Modal Content:**

1. **Add Category Area**:
   - `Input` + `Add` Button (`Space.Compact`)
   - Enter 键触发添加
   - 去重校验: 名称已存在时 `message.warning`

2. **Category List**:
   - `List` 组件, bordered, small size
   - 每项显示: 分类名称 + Tag 显示关联服装数量
   - Delete 按钮 (每项右侧, danger icon)
   - 空状态: "No categories yet."

3. **Delete Category Confirmation**:
   - `Modal.confirm`
   - Title: `Delete category "{name}"?`
   - Content: 若有关联服装 → `{count} garment(s) will become uncategorized.`
   - Content: 若无关联服装 → `No garments are using this category.`

#### A3: Set Category (Per Row)

| Item | Detail |
|------|--------|
| Button | `Set Category` (每行 Actions) |
| Permission | `customer:garments:edit` |
| Guard | `PermGuard` (disable mode) |
| Modal Title | `Set Category for "{garment.name}"` |

**Modal Content:**
- `Select` (allowClear): 选择分类 / 清除
- Options: 当前组织所有分类
- Pre-selected: 当前 `category_id`

**Submit**: `message.success` (simulated, 显示新分类名称)

#### A4: Edit Garment

| Item | Detail |
|------|--------|
| Button | `Edit` (每行 Actions) |
| Permission | `customer:garments:edit` |
| Guard | `PermGuard` (disable mode) |
| Behavior | `message.info` (simulated) |

#### A5: Remove Garment

| Item | Detail |
|------|--------|
| Button | `Remove` (每行 Actions, danger) |
| Permission | `customer:garments:delete` |
| Guard | `PermGuard` (disable mode) |
| Behavior | `message.info` (simulated) |

### Role-Specific Behavior

| Feature | HQOwner | HQOps |
|---------|:-------:|:-----:|
| View garment list | Y | Y |
| Upload / Import | Y | Y |
| Manage Categories button | Y (visible) | Hidden |
| Set Category | Y (active) | Y (active) |
| Edit | Y (active) | Y (active) |
| Remove | Y (active) | Disabled + tooltip |

### Exceptions (E)

| # | Scenario | Handling |
|---|----------|----------|
| E1 | 图片加载失败 | SVG fallback |
| E2 | 无分类 | Category 列显示 "-"（灰色文本） |
| E3 | 添加重复分类名 | `message.warning("Category already exists")` |
| E4 | 删除有关联服装的分类 | 确认弹窗提示受影响服装数量 |
| E5 | HQOps 无 `manage_categories` 权限 | Manage Categories 按钮不渲染 |
| E6 | HQOps 无 `customer:garments:delete` 权限 | Remove 按钮置灰 + lock icon + tooltip |
| E7 | 筛选 "Uncategorized" | 仅显示 `category_id === null` 的服装 |
