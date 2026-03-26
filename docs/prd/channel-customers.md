# Channel > Customers

**路径**: `/dashboard/channel/customers`
**适用门户**: Channel
**访问权限**: `channel:customers:view`
**菜单位置**: 顶级菜单 > Customers

---

## 一、页面概述

Channel Customers 页面供渠道管理员管理其名下的所有 Reseller 客户，包括查看客户列表、创建客户、管理激活码（为客户分配或创建 Trial 码），以及禁用/启用客户账号。

---

## 二、页面内容

### 2.1 客户列表

只显示当前登录渠道账号的下属客户（`parent_org_id = 当前渠道 org_id`）：

| 列名 | 说明 |
|------|------|
| Name | 客户名称 |
| Email | 客户管理员邮箱 |
| Status | 客户状态：`Active`（绿色）/ `Disabled`（红色） |
| Created At | 客户创建日期 |
| Actions | 操作按钮区域 |

### 2.2 筛选

| 筛选项 | 选项 | 说明 |
|--------|------|------|
| Status | All / Active / Disabled | 按客户状态筛选 |

---

## 三、核心操作

### 3.1 创建客户（Create Customer - Reseller）

**所需权限**: `channel:customers:create`

点击 **Create Customer (Reseller)** 打开弹窗：

| 字段 | 是否必填 | 校验规则 |
|------|---------|---------|
| Customer Name | 是 | 最多 50 个字符 |
| Admin Email | 是 | 有效邮箱格式 |

- 渠道创建的客户类型固定为 `Reseller`，`parent_org_id` 自动设为当前渠道的 `org_id`。
- 创建成功后自动发送邀请邮件至 Admin Email。

### 3.2 管理激活码（Manage Codes）

**所需权限**: `channel:customers:create_code`

点击客户行的 **Manage Codes** 打开激活码管理弹窗，显示该客户名下所有激活码。

弹窗顶部展示 Trial 码使用量：**Trial codes: X / 10**（X 为当前客户的有效 Trial 码数量，上限为 10）。

**激活码列表字段：**

| 列名 | 说明 |
|------|------|
| Code | 激活码字符串 |
| Type | `Regular`（蓝色）/ `Trial`（橙色） |
| Status | 激活码当前状态 |
| Device ID | 已绑定设备 ID；未绑定显示"—" |
| Nickname | 绑定设备别名；未设置显示"—" |
| Created By | 创建来源：`Platform` / `Channel` |
| Created At | 创建时间 |
| Actions | 仅 `Unused` 状态可 Revoke |

**分配 Regular 码（Assign Regular Codes）：**

从渠道码池中选择一个 `Unused` 的 Regular 类型激活码分配给该客户。

- 触发条件：渠道码池中存在 `Unused` 且 `code_type = Regular` 的激活码（`org_id = null`，`channel_org_id = 当前渠道`）。
- 若渠道码池中没有可用 Regular 码，按钮禁用，提示"No Regular codes available in channel pool."。
- 分配操作将激活码的 `org_id` 更新为目标客户的 `org_id`，码从渠道池转移至客户名下。

**创建 Trial 码（Create Trial Code）：**

| 字段 | 选项 | 说明 |
|------|------|------|
| Max Try-on Sessions | 25 / 50 | 该试用码允许的最大试穿次数（二选一） |

- 每次只能创建 1 个 Trial 码。
- 当客户 Trial 码数量达到上限（10 个）时，"Create Trial Code" 按钮禁用，并展示警告提示。

**限制条件：**
- 当客户状态为 `Disabled` 时，"Assign Regular Codes"和"Create Trial Code"按钮均禁用。

**撤销激活码（Revoke）：**
- 仅 `Unused` 状态的激活码可被撤销。
- 撤销后状态永久变为 `Revoked`，不可恢复。

### 3.3 重新发送邀请（Resend Invitation）

**所需权限**: `channel:users:reinvite`

**触发条件**：客户管理员从未登录过（`last_login = null`）时，该行展示 **Resend Invitation** 按钮。

- 点击后向该管理员邮箱重新发送注册/激活邮件。
- 若管理员已登录过（`last_login` 有值），则不显示此按钮。

### 3.4 禁用/启用客户（Disable / Enable）

操作前需弹窗二次确认。

| 操作 | 效果 |
|------|------|
| Disable | 客户状态变为 `Disabled`；该客户下所有用户立即失去访问权限 |
| Enable | 客户状态恢复为 `Active` |

---

## 四、黑盒规则

### R-CCU-01：Trial 码上限为每客户 10 个（Bound + Unused 合计）
Trail 码上限计数的范围是状态为 `Bound` 或 `Unused` 的 Trial 码之和（即有效 Trial 码数量）。已 `Expired` 或 `Revoked` 的 Trial 码不计入配额。当有效 Trial 码达到 10 个时，创建入口禁用并展示警告横幅。

### R-CCU-02：渠道只能为客户创建 Trial 类型激活码，不能直接创建 Regular 码
渠道端没有为客户直接生成 Regular 激活码的能力。如需为客户配备 Regular 码，必须先通过平台为渠道分配 Regular 码至渠道码池，再由渠道从码池中分配给具体客户。

### R-CCU-03：从码池分配 Regular 码是"转移"操作，非"复制"
将渠道码池中的 Regular 激活码分配给客户后，该码的 `org_id` 被更新为目标客户的 `org_id`，同时该码不再出现在渠道码池视图中。每个激活码只能属于一个客户。

### R-CCU-04：渠道只能看到自己的下属客户
渠道管理员登录后，Customers 页面只展示 `parent_org_id = 当前渠道 org_id` 的客户。跨渠道客户不可见。
