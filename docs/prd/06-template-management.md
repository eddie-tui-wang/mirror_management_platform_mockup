# PRD-06: Template Management

> 模板所有权 + 分配 + 客户激活
> Version: 2.0 | Updated: 2026-02-12

---

## Business Context (B)

模板（Template）是智能试衣镜展示场景的核心内容单元。模板采用 **所有权分离模型**：

- **平台方** 拥有和管理主模板（Master Templates），创建、编辑、删除模板，并决定将哪些模板分配给哪些客户
- **客户方** 只能看到被分配的模板，并控制是否在自己的设备上启用

这种设计确保平台方对模板内容有集中管控能力，同时赋予客户在已授权范围内的自主选择权。

> **Visual Reference**: See running prototype for visual reference.

---

## Roles & Access (R)

| Capability | Platform Super Admin | Channel Owner | HQ Owner | HQ Ops |
|-----------|:-------------------:|:-------------:|:--------:|:------:|
| 查看所有模板 | Y | - | - | - |
| 创建模板 | Y | - | - | - |
| 编辑模板 | Y | - | - | - |
| 删除模板 | Y | - | - | - |
| 分配模板给客户 | Y | - | - | - |
| 查看已分配的模板 | - | - | Y | Y |
| 启用/禁用已分配的模板 | - | - | Y | - |

---

## Actions & Flows (A)

### Entity: Master Template

| Attribute | Description | Constraints |
|-----------|------------|-------------|
| Name | 模板名称 | Required, non-empty |
| Prompts | 提示词列表 | At least one prompt recommended |
| Status | Active or Disabled | Required |
| Created At | 创建时间 | System generated |
| Updated At | 最后更新时间 | System tracked |

### Entity: Template Assignment

| Attribute | Description | Constraints |
|-----------|------------|-------------|
| Template | 引用的主模板 | Required |
| Customer Org | 被分配的客户组织 | Required |
| Enabled | 客户是否启用此模板 | Default: true |
| Assigned At | 分配时间 | System generated |
| Assigned By | 分配操作人 | System tracked |

### Ownership Model

```
Master Template (平台拥有, 1)
    └── Template Assignment (1:N)
            └── Customer Organization (被分配方)
```

- 平台创建和管理主模板，决定分配关系
- 客户只能看到被分配的模板，并控制启用/禁用

---

### Part A: Platform Template Management

#### View Templates (Platform)

**Who**: Platform Super Admin
**Goal**: 查看和管理所有主模板
**Available Filters**:
- Search: 按模板名称或提示词关键字搜索（不区分大小写）
- Status: Active / Disabled

**Information Displayed**: 模板名称、提示词数量、状态、已分配的客户数量、更新时间

#### Create Template

**Who**: Platform Super Admin
**Goal**: 创建新的场景模板
**Required Information**:
- Template Name (required)
- Prompts: 添加一个或多个提示词
  - 每个提示词不能为空
  - 同一模板内提示词不能重复

**Outcome**: 新的主模板创建成功，可供后续分配给客户

#### Edit Template

**Who**: Platform Super Admin
**Goal**: 修改现有模板的名称或提示词
**Required Information**:
- Template Name (required)
- Prompts: 可添加、删除提示词

**Outcome**: 模板信息更新。已分配该模板的客户将看到更新后的内容。

#### Assign Template to Customers

**Who**: Platform Super Admin
**Goal**: 将模板分配给一个或多个客户组织
**Steps**:
1. 点击某模板的"分配"操作
2. 系统显示：
   - **已分配客户列表**: 每个已分配客户显示组织名称和启用/禁用状态，支持移除分配
   - **添加客户**: 从尚未分配该模板的客户列表中选择一个或多个客户
3. 确认添加

**Outcome**: 选定的客户获得该模板的使用权，默认启用状态

#### Delete Template

**Who**: Platform Super Admin
**Goal**: 删除某个主模板
**Steps**:
1. 点击某模板的"删除"操作
2. 系统弹出二次确认：
   - 若该模板有分配记录：提示 "This will also remove {count} customer assignment(s)"
   - 若该模板无分配记录：提示 "This template has no customer assignments"
3. 用户确认后，模板及其所有分配记录一并删除

**Outcome**: 主模板从系统中移除，所有客户不再看到该模板

---

### Part B: Customer Templates (Assigned View)

#### View Assigned Templates

**Who**: HQ Owner, HQ Ops
**Goal**: 查看本组织被分配的模板列表
**Data Scope**: 仅显示分配给当前客户组织的模板

**Information Displayed**: 模板名称、提示词内容（可展开或悬停查看详细列表）、分配时间、启用/禁用状态

#### Toggle Template Enabled / Disabled

**Who**: HQ Owner
**Goal**: 控制某个已分配模板是否在本组织设备上生效
**Steps**:
1. 在模板列表中，切换某模板的启用/禁用开关
2. 系统更新该模板的启用状态

**Outcome**: 模板在本组织设备上生效或停用

**Special Rule**: 如果平台方已将主模板状态设为 Disabled，则客户无法启用该模板——开关被禁用，并提示"Template disabled by platform"

---

### Role-Specific Behavior (Customer Portal)

| Feature | HQ Owner | HQ Ops |
|---------|----------|--------|
| 查看模板列表 | Y | Y |
| 查看提示词内容 | Y | Y |
| 切换启用/禁用 | Y | Not available (开关被禁用并提示无权限) |

---

## Constraints & Rules (C)

- 模板名称为必填，不能为空
- 同一模板内提示词不能重复
- 平台禁用主模板后，所有已分配客户的该模板自动失效，客户无法覆盖启用
- 删除主模板会同时移除所有分配记录——客户端将不再看到该模板
- 客户只能看到被分配的模板，无法自行添加或删除模板
- 搜索功能同时匹配模板名称和提示词内容

---

## Edge Cases (E)

| Scenario | Expected Behavior |
|----------|------------------|
| 创建模板时名称为空 | 提示错误，阻止提交 |
| 添加重复提示词 | 提示 "This prompt already exists"，阻止添加 |
| 删除有分配记录的模板 | 二次确认提示受影响的客户数量；确认后模板和所有分配一并删除 |
| 主模板被平台禁用 | 客户端开关被禁用且强制关闭，显示 "Template disabled by platform" |
| HQ Ops 尝试切换模板开关 | 开关被禁用，显示 "No permission" |
| 主模板被删除后客户端访问 | 模板从客户列表中消失 |
| 客户无任何已分配模板 | 列表为空 |
| 搜索清空 | 恢复显示全部模板 |
