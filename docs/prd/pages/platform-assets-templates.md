# Platform > Assets > Templates

**路径**: `/dashboard/assets/templates`
**适用门户**: Platform
**访问权限**: `platform:templates:view`
**菜单位置**: 顶级菜单 > Assets > Templates

---

## 一、页面概述

Templates 页面供平台管理员管理所有主模板（Master Templates）。主模板是平台统一维护的 AI 场景模板，包含名称和一组提示词（Prompts）。平台可将模板分配给客户使用，客户可选择是否启用已分配的模板。

---

## 二、页面内容

### 2.1 模板列表

| 列名 | 说明 |
|------|------|
| Name | 模板名称 |
| Prompts | 该模板包含的提示词数量（如"3 prompt(s)"） |
| Assignments | 该模板当前已分配的客户数量（如"2 customer(s)"） |
| Actions | Edit / Assign / Delete 操作按钮 |

### 2.2 搜索

- 支持按模板名称（Name）或提示词内容（Prompts）进行模糊搜索（防抖 500ms）。

---

## 三、核心操作

### 3.1 创建模板（Create Template）

**所需权限**: `platform:templates:create`

点击 **Create Template** 打开弹窗，填写：

| 字段 | 是否必填 | 校验规则 |
|------|---------|---------|
| Template Name | 是 | 最多 100 个字符；不可为空 |
| Prompts | 否 | 每条提示词最多 200 个字符；同一模板内提示词不可重复 |

**提示词（Prompts）管理：**
- 提示词逐条添加，输入后点击 **Add** 或按 Enter 键确认。
- 已添加的提示词以列表形式展示，每条可单独删除。
- 同一条提示词内容重复添加时，提示 "This prompt already exists" 并拒绝添加。
- 模板可以不包含任何提示词。

### 3.2 编辑模板（Edit）

**所需权限**: `platform:templates:edit`

打开编辑弹窗，可修改模板名称和提示词列表（已有提示词可删除，可新增）。编辑界面与创建界面复用同一组件。

### 3.3 分配模板给客户（Assign）

**所需权限**: `platform:templates:assign`

打开分配弹窗，显示两个区域：

**Currently Assigned（当前已分配客户）：**
- 列出已分配该模板的客户名称及其启用状态（`Enabled` / `Disabled`）。
- 每个已分配客户旁有 **Remove** 按钮，可取消该客户与模板的分配关系。

**Add Customers（添加新分配）：**
- 多选下拉框，列出所有尚未分配该模板的客户。
- 选中后点击 **Confirm** 完成批量分配。

**分配规则：**
- 新分配的模板对客户的默认启用状态为 `enabled`（启用）。
- 注：模板的全局启用状态（`template_status`，即主模板的 `status` 字段）与客户维度的 `enabled` 字段相互独立（见黑盒规则）。

### 3.4 删除模板（Delete）

**所需权限**: `platform:templates:delete`

删除前弹窗二次确认，提示当前已分配的客户数量。

**删除规则：**
- 删除模板时，若该模板已分配给若干客户，删除操作会同时移除所有对应的分配关系（TemplateAssignment 记录）。
- 弹窗会提示将受影响的分配数量（"This will also remove N customer assignment(s)."）。

---

## 四、黑盒规则

### R-TPL-01：主模板状态与客户分配启用状态相互独立
主模板（MasterTemplate）有自身的 `status` 字段（Active / Disabled）。客户层面的模板分配（TemplateAssignment）有独立的 `enabled` 字段。主模板被 Disabled 不会自动取消所有客户的分配，但客户端将无法使用该模板。客户管理员可以独立启用或禁用其被分配的模板。

### R-TPL-02：提示词（Prompts）是模板的核心内容
提示词是发送给 AI 引擎的指令集合，决定 AI 智能镜在对应场景下的行为。每条提示词代表一种场景行为。同一模板内提示词不可重复。

### R-TPL-03：模板分配是平台对客户的授权行为
客户只能使用平台已明确分配给其的模板，无法自行选择全库模板。渠道管理员可以在其权限范围内为其下游客户执行分配操作（见渠道 Templates 页面）。

### R-TPL-04：分配操作中"移除客户"与"Confirm"是两个独立操作
在 Assign 弹窗中：点击已分配列表中的 **Remove** 会立即执行取消分配；点击 **Confirm** 执行的是"为新勾选的客户添加分配"。两者互不依赖。

### R-TPL-05：搜索支持对提示词内容进行匹配
模板列表的搜索框会同时检索模板名称和各条提示词的内容，方便通过业务关键词定位相关模板。
