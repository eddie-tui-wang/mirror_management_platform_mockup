# Platform > Channels

**路径**: `/dashboard/channels`
**适用门户**: Platform
**访问权限**: `platform:channels:view`
**菜单位置**: 顶级菜单 > Channels

---

## 一、页面概述

Channels 页面用于平台管理员管理所有渠道（Channel）组织，包括查看渠道列表、创建渠道、管理渠道激活码池、以及启用/禁用渠道账号。

---

## 二、页面内容

### 2.1 渠道列表

表格展示所有渠道组织，每行包含以下字段：

| 列名 | 说明 |
|------|------|
| Name | 渠道名称 |
| channel_id | 渠道组织的唯一标识符（org_id） |
| Status | 渠道当前状态：`Active`（绿色）/ `Disabled`（红色） |
| Admin Email | 该渠道首个成员（管理员）的邮箱 |
| Customers | 该渠道下的客户组织数量 |
| Created At | 渠道创建日期 |
| Actions | 操作按钮区域 |

### 2.2 搜索

- 支持按渠道名称（Name）进行实时搜索（大小写不敏感）。
- 搜索框支持清空。

---

## 三、核心操作

### 3.1 创建渠道（Create Channel）

**所需权限**: `platform:channels:create`

点击 **Create Channel** 按钮打开弹窗，填写以下信息：

| 字段 | 是否必填 | 校验规则 |
|------|---------|---------|
| Channel Name | 是 | 最多 50 个字符；不可与已有渠道名称重复（大小写不敏感） |
| Admin Email | 是 | 必须为有效邮箱格式；不可与系统中已存在的任意用户邮箱重复 |

**创建规则：**
- 渠道名称全局唯一，不区分大小写。
- Admin Email 须为系统中未注册的新邮箱；系统自动为该邮箱创建账号并发送邀请邮件。
- 创建成功后，新渠道默认状态为 `Active`。

### 3.2 管理渠道激活码池（Manage Codes）

**所需权限**: `platform:channels:assign_code`

点击某渠道行的 **Manage Codes** 按钮，打开该渠道的激活码池弹窗。

弹窗展示该渠道激活码池（`org_id = null`，`channel_org_id = 当前渠道`）中的激活码列表：

| 列名 | 说明 |
|------|------|
| Code | 激活码字符串 |
| Type | 激活码类型：`Regular`（蓝色）/ `Trial`（橙色） |
| Sessions | 仅 Trial 类型显示最大试用次数；Regular 显示"—" |
| Status | 激活码状态 |
| Created At | 创建时间 |
| Actions | 仅 `Unused` 状态可执行 Revoke 操作 |

**在渠道码池中创建激活码（Create Code）：**

平台只能为渠道池创建 **Regular** 类型激活码，支持批量创建：

| 字段 | 说明 |
|------|------|
| Number of Regular Codes | 每次创建数量，最少 1 个，最多 100 个 |

创建的激活码初始状态为 `Unused`，有效期为创建时间起 **7 天**。

**撤销激活码（Revoke）：**
- 仅限状态为 `Unused` 的激活码可被撤销。
- 撤销后状态变为 `Revoked`，不可恢复，不可用于绑定设备。

### 3.3 查看渠道客户（View Customers）

点击 **View Customers** 跳转至 `/dashboard/customers?channel=<org_id>`，自动筛选显示该渠道下的客户列表。

### 3.4 禁用/启用渠道（Disable / Enable）

**所需权限**: `platform:channels:disable`

| 操作 | 触发条件 | 效果 |
|------|---------|------|
| Disable | 当前状态为 `Active` | 将渠道状态改为 `Disabled`；立即终止该渠道下所有用户的活跃会话 |
| Enable | 当前状态为 `Disabled` | 将渠道状态恢复为 `Active` |

操作前需弹窗二次确认。

---

## 四、黑盒规则

### R-CH-01：禁用渠道会立即注销所有下属用户
将渠道状态改为 `Disabled` 时，该渠道下所有用户（包括渠道自身成员）的所有活跃登录会话立即被强制终止。用户尝试访问系统时将被要求重新登录，但登录时会因组织状态为 Disabled 而被拦截。

### R-CH-02：渠道码池仅包含未分配给任何客户的激活码
渠道码池（Code Pool）中展示的激活码条件为：`channel_org_id = 本渠道` 且 `org_id = null`（即尚未分配给具体客户组织）。已分配给客户的激活码不出现在码池视图中。

### R-CH-03：平台只能为渠道池创建 Regular 类型激活码
通过平台 Channels 页面的 Manage Codes 入口，只能向渠道码池添加 Regular（永久性）激活码。Trial 类型激活码只能在 Customers 层级创建（直接关联具体客户）。

### R-CH-04：激活码有效期固定为 7 天
所有新创建的激活码（无论 Regular 还是 Trial）有效期均为创建时间起 7 天，到期后状态自动变为 `Expired`，不可再用于绑定设备。

### R-CH-05：Admin Email 全局唯一
创建渠道时填写的 Admin Email 不得与系统中任何已注册用户的邮箱重复，否则创建失败并提示 "Email is already registered"。

### R-CH-06：撤销激活码不可恢复
激活码被 Revoke 后状态永久变为 `Revoked`，无法撤销该操作，该码不可再次使用。
