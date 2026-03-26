# Customer > Garments

**路径**: `/dashboard/customer/garments`
**适用门户**: Customer
**访问权限**: `customer:garments:view`
**菜单位置**: 顶级菜单 > Garments

---

## 一、页面概述

客户端 Garments 页面供客户管理员管理本组织的服装目录，包括上传服装图片、编辑服装信息、删除服装、设置分类，以及将服装分配给具体设备（激活码绑定的设备）。

---

## 二、页面内容

### 2.1 服装列表

| 列名 | 说明 |
|------|------|
| 图片 | 服装缩略图 |
| Name | 服装名称 |
| Category | 所属分类名称；未分类显示"—" |
| Templates | 关联的模板数量（可点击查看） |
| Sex | 适用性别：`male`（男）/ `female`（女）/ `unisex`（通用） |
| Status | `Active`（绿色）/ `Disabled`（红色） |
| Updated At | 最近更新时间 |
| Actions | Edit / Assign to Device / Delete |

### 2.2 筛选

| 筛选项 | 说明 |
|--------|------|
| Category 筛选 | 下拉选择；包含所有已创建的分类及"Uncategorized"选项 |

### 2.3 批量操作

- 支持多选服装（表格行勾选）。
- 多选后可执行**批量设置分类（Bulk Set Category）**：为所有选中服装指定同一分类（或移除分类）。

---

## 三、核心操作

### 3.1 上传服装（Upload Garment）

**所需权限**: `customer:garments:upload`

点击 **Upload** 打开上传弹窗，支持以拖拽或点击方式上传图片文件。

**文件格式限制：**

| 参数 | 说明 |
|------|------|
| 支持格式 | JPEG、PNG、WebP |
| 上传后状态 | 默认 `Active` |

上传完成后，服装以新记录的形式追加至服装列表，初始不含分类（`category_id = null`）且未关联任何模板（`template_ids = []`）。

### 3.2 编辑服装（Edit）

**所需权限**: `customer:garments:edit`

点击 **Edit** 打开编辑弹窗，可修改以下字段：

| 字段 | 说明 |
|------|------|
| Name | 服装名称 |
| Status | Active / Disabled |
| Category | 从已创建的分类中选择；可设为"无分类" |
| Associated Templates | 从客户已分配的启用模板中多选关联 |
| Sex | male / female / unisex |
| Image | 可替换服装图片（格式同上传限制） |

**模板关联规则：**
- 可关联的模板范围：仅限当前客户已被分配且状态为 `Enabled` 的模板。
- 客户端无法关联未被平台分配的模板，也无法关联已被客户禁用（`enabled = false`）的模板。

### 3.3 分配到设备（Assign to Device）

**所需权限**: `customer:garments:assign_device`

将某件服装分配到一个或多个已绑定的设备上。

**触发条件：** 客户名下存在至少一个状态为 `Bound` 的激活码（即已绑定设备）。

操作弹窗列出该客户所有已绑定设备（激活码 `status = Bound` 的列表），用户勾选目标设备后确认。

**分配关系说明（DeviceGarmentAssignment）：**
- 一件服装可以分配给多个设备。
- 同一设备可以分配多件服装。
- 服装分配影响该设备上的智能镜显示内容（AI 试穿场景中可用的服装列表）。

### 3.4 删除服装（Delete）

**所需权限**: `customer:garments:delete`

删除前弹窗二次确认。删除后服装记录从目录中移除，同时删除该服装与所有设备的分配关系（DeviceGarmentAssignment 记录）。

### 3.5 管理分类（Manage Categories）

**所需权限**: `customer:garments:manage_categories`

分类管理入口（通常为独立弹窗或内嵌区域），支持创建、重命名和删除服装分类。

**分类规则：**
- 每个分类隶属于特定客户组织（`org_id` 字段），不同客户的分类相互独立。
- 分类名称在同一客户内不可重复。
- 删除分类时，已归属该分类的服装的 `category_id` 字段会被清空（变为"未分类"）。

---

## 四、黑盒规则

### R-CG-01：服装仅显示本客户名下的数据
客户端服装列表只展示 `org_id = 当前登录客户 org_id` 的服装，跨客户的服装数据完全隔离不可见。

### R-CG-02：服装可关联模板范围受双重限制
服装关联模板时，只能从以下交集中选择：(1) 平台已分配给本客户的模板，且 (2) 客户已启用（`enabled = true`）的模板。若客户禁用了某模板，则该模板从服装编辑的模板关联选项中消失。

### R-CG-03："Assigned to Device"以激活码绑定关系为准
"分配设备"弹窗中展示的设备列表来自客户名下状态为 `Bound` 的激活码记录（每条 Bound 的激活码对应一台设备），而非来自独立的设备管理表。设备以激活码的 `bound_device_id` 为标识。

### R-CG-04：Disabled 服装仍可存在于设备分配中
将服装状态设为 `Disabled` 不会自动解除其与设备的分配关系。Disabled 服装的业务含义为"在 AI 智能镜上不展示/不可选"，需由业务逻辑决定是否显示 Disabled 服装。

### R-CG-05：上传服装时图片格式限于 JPEG/PNG/WebP
非以上格式的文件（如 GIF、TIFF、PDF）不可上传，会被客户端文件类型校验拦截。
