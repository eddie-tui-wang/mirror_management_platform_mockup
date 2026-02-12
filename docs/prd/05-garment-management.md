# PRD-05: Garment Management

> 服装目录 + 分类体系
> Version: 2.0 | Updated: 2026-02-12

---

## Business Context (B)

服装（Garment）是智能试衣镜的核心业务资产。每个客户组织管理自己的服装目录，并可通过自定义分类体系来组织服装。平台管理员拥有聚合视图，可以跨组织查看所有服装。

- **平台端**: 聚合视图，展示所有组织的服装，支持按组织筛选
- **客户端**: 范围视图，仅展示本组织的服装，支持分类管理

> **Visual Reference**: See running prototype for visual reference.

---

## Roles & Access (R)

| Capability | Platform Super Admin | Channel Owner | HQ Owner | HQ Ops |
|-----------|:-------------------:|:-------------:|:--------:|:------:|
| 查看所有服装（聚合视图） | Y | - | - | - |
| 编辑服装（平台端） | Y | - | - | - |
| 删除服装（平台端） | Y | - | - | - |
| 查看本组织服装 | - | - | Y | Y |
| 上传/导入服装 | - | - | Y | Y |
| 编辑服装 | - | - | Y | Y |
| 删除/移除服装 | - | - | Y | - |
| 管理分类 | - | - | Y | - |
| 设置服装分类 | - | - | Y | Y |

---

## Actions & Flows (A)

### Entity: Garment

| Attribute | Description | Constraints |
|-----------|------------|-------------|
| Name | 服装名称 | Required, non-empty |
| Image | 产品图片 | Required; system gracefully handles missing images |
| Category | 客户自定义分类 | Optional; must belong to same customer organization |
| Status | Active or Disabled | Required |
| Owner Org | 所属组织 | Required |
| Updated At | 最后更新时间 | System tracked |

### Entity: Garment Category

| Attribute | Description | Constraints |
|-----------|------------|-------------|
| Name | 分类名称 | Required, non-empty; unique within same organization |
| Owner Org | 所属客户组织 | Required |
| Created At | 创建时间 | System generated |

---

### Part A: Platform Garments (Aggregated View)

#### View Garments (Platform)

**Who**: Platform Super Admin
**Goal**: 跨组织查看所有服装
**Available Filters**:
- Org Type: Channel / Customer
- Organization: specific organization (searchable; options depend on selected Org Type)
- Status: Active / Disabled

**Information Displayed**: 产品图片、服装名称、组织类型、组织名称、状态、更新时间

#### Edit Garment (Platform)

**Who**: Platform Super Admin
**Goal**: 编辑某服装的信息
**Steps**:
1. 在服装列表中，点击某服装的"编辑"操作
2. 系统提供编辑功能

**Outcome**: 服装信息被更新

#### Delete Garment (Platform)

**Who**: Platform Super Admin
**Goal**: 删除某服装
**Steps**:
1. 在服装列表中，点击某服装的"删除"操作
2. 系统弹出二次确认，提示该服装所属的组织名称
3. 用户确认后，服装被删除

**Outcome**: 服装从系统中移除

---

### Part B: Customer Garments (with Categories)

#### View Garments (Customer)

**Who**: HQ Owner, HQ Ops
**Goal**: 查看和管理本组织的服装
**Data Scope**: 仅显示当前客户组织的服装
**Available Filters**:
- Category: All / specific category / Uncategorized (无分类)

**Information Displayed**: 产品图片、服装名称、分类、状态、更新时间

#### Upload / Import Garment

**Who**: HQ Owner, HQ Ops
**Goal**: 将新服装添加到本组织的目录中
**Steps**:
1. 点击"上传/导入"操作
2. 系统提供上传/导入功能

**Outcome**: 新服装被添加到当前客户组织的目录

#### Manage Categories

**Who**: HQ Owner
**Goal**: 管理本组织的服装分类体系
**Steps**:
1. 点击"管理分类"操作，打开分类管理界面
2. 界面展示当前组织的所有分类，每个分类显示名称和关联的服装数量

**Available Operations**:
- **添加分类**: 输入分类名称并添加；分类名称不能与已有分类重复
- **删除分类**: 点击某分类的删除操作，系统弹出二次确认：
  - 若该分类下有关联服装：提示 "{count} garment(s) will become uncategorized"
  - 若该分类下无关联服装：提示 "No garments are using this category"
  - 确认后，分类被删除，原来属于该分类的服装变为"未分类"（服装本身不删除）

**Outcome**: 分类体系更新

#### Set Category (Per Garment)

**Who**: HQ Owner, HQ Ops
**Goal**: 为某件服装设置或变更分类
**Required Information**:
- Category: 从当前组织的分类列表中选择，或清除分类

**Outcome**: 该服装的分类被更新

#### Edit Garment (Customer)

**Who**: HQ Owner, HQ Ops
**Goal**: 编辑某服装的信息
**Steps**:
1. 在服装列表中，点击某服装的"编辑"操作
2. 系统提供编辑功能

**Outcome**: 服装信息被更新

#### Remove Garment (Customer)

**Who**: HQ Owner
**Goal**: 从本组织的目录中移除某服装
**Steps**:
1. 在服装列表中，点击某服装的"移除"操作
2. 系统执行移除

**Outcome**: 服装从当前组织的目录中移除

---

### Role-Specific Behavior (Customer Portal)

| Feature | HQ Owner | HQ Ops |
|---------|----------|--------|
| 查看服装列表 | Y | Y |
| 上传/导入服装 | Y | Y |
| 管理分类 | Y | Not available (入口不展示) |
| 设置服装分类 | Y | Y |
| 编辑服装 | Y | Y |
| 移除服装 | Y | Not available (操作被禁用并提示无权限) |

---

## Constraints & Rules (C)

- 分类是客户级别的概念，每个客户组织独立管理自己的分类体系
- 服装的分类只能选择同一客户组织下的分类
- 删除分类不会删除服装——原来属于该分类的服装变为"未分类"
- 分类名称在同一组织内不能重复
- 平台端聚合视图中，Org Type 筛选会联动更新可选的 Organization 列表
- 图片加载失败时，系统显示占位图

---

## Edge Cases (E)

| Scenario | Expected Behavior |
|----------|------------------|
| 图片加载失败 | 显示占位图 |
| 服装无分类 | 分类列显示为空或"-" |
| 添加重复分类名 | 提示 "Category already exists"，阻止添加 |
| 删除有关联服装的分类 | 二次确认提示受影响的服装数量；确认后服装变为未分类 |
| HQ Ops 无分类管理权限 | "管理分类"入口不展示 |
| HQ Ops 无删除服装权限 | "移除"操作被禁用，显示无权限提示 |
| 筛选 "Uncategorized" | 仅显示无分类的服装 |
| 平台端切换 Org Type | Organization 筛选重置 |
