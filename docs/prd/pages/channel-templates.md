# Channel > Templates

**路径**: `/dashboard/channel/templates`
**适用门户**: Channel
**访问权限**: `channel:templates:view`
**菜单位置**: 顶级菜单 > Templates

---

## 一、页面概述

渠道端 Templates 页面供渠道管理员查看平台所有主模板，并将模板分配给其名下的 Reseller 客户。渠道不能创建、编辑或删除模板。

---

## 二、页面内容

### 2.1 模板列表

展示平台全量主模板（MasterTemplates）：

| 列名 | 说明 |
|------|------|
| Name | 模板名称 |
| Prompts | 提示词数量 |
| Assignments | 该模板当前已分配的客户数量 |
| Actions | View Prompts / Assign 操作按钮 |

### 2.2 搜索

- 支持按模板名称（Name）进行模糊搜索（防抖 500ms）。

---

## 三、核心操作

### 3.1 查看提示词（View Prompts）

所有用户均可查看。点击 **View Prompts** 打开弹窗，展示该模板的全部提示词内容（带序号，每条一行）。

### 3.2 分配模板给客户（Assign）

**所需权限**: `channel:templates:assign`

点击 **Assign** 打开分配弹窗，包含两个区域：

**Currently Assigned（当前已分配客户）：**
- 列出该模板已分配的所有客户及其启用状态（`Enabled` / `Disabled`）。
- 每个已分配客户旁有 **Remove** 按钮，可取消该客户与模板的分配。

**Add Customers（添加新分配）：**
- 多选下拉框，列出所有尚未分配该模板的客户（全平台范围，非仅限渠道下属客户）。
- 选中后点击 **Confirm** 完成分配。

---

## 四、黑盒规则

### R-CTL-01：渠道可为全平台所有客户分配模板，不限于自己的下属客户
渠道在 Assign 弹窗中看到的"未分配客户"列表来自全平台所有 CUSTOMER 类型组织，而非仅限于 `parent_org_id = 本渠道` 的客户。这是一种跨渠道的分配能力，需注意不应向非本渠道客户执行分配操作。

### R-CTL-02：渠道只能查看和分配，不能创建/编辑/删除模板
渠道管理员在 Templates 页面的权限仅为 `channel:templates:view` 和 `channel:templates:assign`，没有创建（create）、编辑（edit）或删除（delete）模板的权限。

### R-CTL-03：渠道端模板列表显示的是全平台主模板
渠道端看到的模板列表与平台端相同，为 MasterTemplates 全量数据，包括状态为 Active 和 Disabled 的模板。

### R-CTL-04：View Prompts 在渠道端仅为查阅，不可编辑
渠道管理员点击 View Prompts 只能查看提示词内容，无法修改。
