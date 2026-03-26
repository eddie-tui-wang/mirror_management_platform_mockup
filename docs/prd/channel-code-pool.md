# Channel > Code Pool

**路径**: `/dashboard/channel/codes`
**适用门户**: Channel
**访问权限**: `channel:codes:view`
**菜单位置**: 顶级菜单 > Code Pool

---

## 一、页面概述

Code Pool 页面供渠道管理员查看平台分配给本渠道的所有激活码，包括已分配给客户的和尚在渠道池中待分配的。渠道不能在此页面直接操作激活码（分配操作在 Customers 页面完成）。

---

## 二、页面内容

### 2.1 激活码列表

展示所有 `channel_org_id = 当前渠道 org_id` 的激活码（无论是否已分配给客户）：

| 列名 | 说明 |
|------|------|
| Code | 激活码字符串（支持复制） |
| Type | `Regular`（蓝色）/ `Trial`（橙色） |
| Status | 激活码状态：`Unused`（蓝色）/ `Bound`（绿色）/ `Expired`（灰色）/ `Revoked`（红色） |
| Assigned To | 已分配给的客户名称；若 `org_id = null`（未分配）则显示"Unassigned (Pool)"（金色标签） |
| Created At | 创建时间 |

### 2.2 筛选

| 筛选项 | 说明 |
|--------|------|
| Filter by Type | Regular / Trial |
| Filter by Status | Unused / Bound / Expired / Revoked |

两个筛选项均支持清空（恢复显示全部）。

### 2.3 分页

- 每页最多显示 15 条记录。

---

## 三、操作

本页面为只读视图，**不提供创建、撤销或分配激活码的操作入口**。

- 将激活码从渠道池分配给客户的操作入口位于 **Channel > Customers > Manage Codes** 弹窗。
- 为客户创建 Trial 码的入口也在 **Channel > Customers > Manage Codes** 弹窗。

---

## 四、黑盒规则

### R-CCP-01：Code Pool 展示渠道所有激活码，包含已分配给客户的
本页面展示的是渠道视角的全量激活码（`channel_org_id = 当前渠道`），包括仍在渠道池中未分配（`org_id = null`）和已分配给各客户（`org_id` 有值）的所有激活码。这与 Platform > Channels 页面的"Manage Codes"弹窗不同（后者只显示尚在码池中未分配的码）。

### R-CCP-02：渠道无法自行创建激活码进入码池
渠道码池中的激活码全部由平台通过 Platform > Channels > Manage Codes 创建并分配进来。渠道无法自行生成新的激活码进入渠道码池。

### R-CCP-03：渠道 Trial 码由渠道直接为客户创建，不经过码池
渠道在 Customers > Manage Codes 中为客户创建的 Trial 激活码，`channel_org_id` 指向渠道，`org_id` 直接指向目标客户，不经过 `org_id = null` 的码池状态。因此这些 Trial 码在 Code Pool 中显示 "Assigned To: [客户名称]"，不会出现 "Unassigned (Pool)" 状态。
