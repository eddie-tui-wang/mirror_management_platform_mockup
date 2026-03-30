# Platform > Customers

**路径**: `/dashboard/customers`
**适用门户**: Platform
**访问权限**: `platform:customers:view`
**菜单位置**: 顶级菜单 > Customers

---

## 一、页面概述

Customers 页面供平台管理员管理所有客户（Customer）组织，包括查看客户列表、创建直客、管理激活码，以及启用/禁用客户账号。

---

## 二、页面内容

### 2.1 客户列表

表格展示所有客户组织，每行包含以下字段：

| 列名 | 说明 |
|------|------|
| Name | 客户名称 |
| customer_id | 客户组织唯一标识符（org_id） |
| Type | 客户类型：`Direct`（蓝色标签）/ `Reseller`（紫色标签） |
| Channel | 所属渠道名称；直客（Direct）此列显示"—" |
| Email | 该客户组织管理员的邮箱 |
| Created At | 客户创建日期 |
| Status | 当前状态：`Active`（绿色）/ `Disabled`（红色） |
| Actions | 操作按钮区域 |

### 2.2 搜索与筛选

| 筛选项 | 选项 | 说明 |
|--------|------|------|
| 搜索框 | 文本输入 | 按客户名称模糊搜索（防抖 500ms） |
| Customer Type | All / Direct / Reseller | 按客户类型筛选 |
| Channel | All / [渠道列表] | 按所属渠道筛选；直客不属于任何渠道 |
| Status | All / Active / Disabled | 按状态筛选 |

---

## 三、核心操作

### 3.1 创建直客（Create Customer - Direct）

**所需权限**: `platform:customers:create`

点击 **Create Customer (Direct)** 按钮打开弹窗，填写以下信息：

| 字段 | 是否必填 | 校验规则 |
|------|---------|---------|
| Customer Name | 是 | 最多 50 个字符；不可与已有客户名称重复（大小写不敏感） |
| Admin Email | 是 | 必须为有效邮箱格式；不可与系统中已存在的任意用户邮箱重复 |

**创建规则：**
- 平台只能创建 Direct 类型客户（无渠道归属），`parent_org_id = null`。
- Reseller 类型客户（属于某渠道）只能由对应渠道创建。
- 创建成功后，新客户默认状态为 `Active`。

### 3.2 管理激活码（Manage Codes）

**所需权限**: `platform:customers:create_code`

点击某客户行的 **Manage Codes** 按钮，打开该客户的激活码管理弹窗。

弹窗展示该客户名下所有激活码（`org_id = 客户 org_id`）：

| 列名 | 说明 |
|------|------|
| Code | 激活码字符串 |
| Type | `Regular`（蓝色）/ `Trial`（橙色） |
| Status | 激活码状态（见状态说明） |
| Device ID | 已绑定的设备 ID；未绑定显示"—" |
| Nickname | 激活码绑定设备的别名；未设置显示"—" |
| Assigned By | 创建来源：`Platform`（紫色）/ `Channel`（青色） |
| Assigned At | 创建时间 |
| Actions | `Unused` 和 `Bound` 状态均可执行 Revoke |

**创建激活码 - Regular 类型：**

| 字段 | 说明 |
|------|------|
| Number of Regular Codes | 每次创建数量，最少 1 个，最多 100 个 |

- Regular 码授予设备永久访问权限，无次数限制。

**创建激活码 - Trial 类型：**

| 字段 | 选项 | 说明 |
|------|------|------|
| Max Try-on Sessions | 25 / 50 | 选择该试用码允许的最大试穿次数（二选一） |

- 每次只能创建 1 个 Trial 码。

**限制条件：**
- 当客户状态为 `Disabled` 时，"Create Code"按钮禁用，不可为被禁用的客户创建激活码。

**撤销激活码（Revoke）：**
- `Unused` 和 `Bound` 状态的激活码均可被撤销。
- 撤销后状态永久变为 `Revoked`，不可恢复。
- 撤销 `Bound` 状态的激活码时，`bound_device_id` 记录保留（用于追溯），但该设备立即失去访问授权，无法继续使用 AI 智能镜功能。

### 3.3 查看资产（View Assets）

点击 **View Assets** 跳转至 `/dashboard/assets/garments?org=<org_id>`，自动筛选显示该客户名下的服装资产。

### 3.4 禁用/启用客户（Disable / Enable）

操作前需弹窗二次确认。

| 操作 | 效果 |
|------|------|
| Disable | 将客户状态改为 `Disabled`；所有该客户下用户立即失去访问权限；所有活跃会话被终止 |
| Enable | 将客户状态恢复为 `Active` |

---

## 四、激活码状态说明

| 状态 | 颜色 | 含义 |
|------|------|------|
| Unused | 蓝色 | 已创建，尚未被用于绑定设备 |
| Bound | 绿色 | 已被用于绑定一台设备 |
| Revoked | 红色 | 被管理员手动撤销 |

---

## 五、黑盒规则

### R-CU-01：Direct 和 Reseller 客户的区别
`Direct` 客户由平台直接创建，`parent_org_id = null`，不归属任何渠道。`Reseller` 客户由渠道创建，`parent_org_id = 渠道的 org_id`。平台只能从本页面创建 Direct 客户。

### R-CU-02：禁用客户会立即终止所有活跃会话
将客户状态改为 `Disabled` 时，该客户下所有用户的活跃登录会话立即被强制终止。用户尝试重新登录时会因组织 Disabled 而被拦截。

### R-CU-03：Disabled 状态下不可为客户创建激活码
当客户组织状态为 `Disabled` 时，激活码管理弹窗中的 "Create Code" 按钮被禁用，无法为其创建任何类型的激活码。

### R-CU-04：Trial 码的 Max Sessions 只有两个可选值
创建 Trial 类型激活码时，最大试穿次数（`trial_max_sessions`）只能选择 **25 次** 或 **50 次**，不支持自定义数值。

### R-CU-05：Regular 码支持批量创建，Trial 码不支持
Regular 激活码每次创建操作可指定数量（1~100），系统批量生成多个独立激活码。Trial 激活码每次只能创建 1 个。

### R-CU-06：撤销 Bound 激活码会立即切断设备访问权限
激活码处于 `Bound` 状态时同样可被 Revoke。撤销后，已绑定的物理设备立即失去对 AI 智能镜系统的访问授权，设备端无法再发起试穿会话。`bound_device_id` 字段在激活码记录中仍然保留，仅作历史追溯使用，不代表绑定关系仍然有效。

### R-CU-07：激活码由哪方创建可追溯
每个激活码记录了 `created_by_portal` 字段，标记为 `Platform`（平台创建）或 `Channel`（渠道创建），用于追溯来源。

### R-CU-08：Channel 筛选器仅筛选 Reseller 客户
在 Channel 筛选器选择某渠道时，结果仅展示 `parent_org_id` 等于该渠道 `org_id` 的客户（即 Reseller 类型）。Direct 客户在任何渠道筛选项下均不显示。
