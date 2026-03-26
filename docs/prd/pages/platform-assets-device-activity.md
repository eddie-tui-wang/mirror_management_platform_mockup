# Platform > Assets > Device Activity

**路径**: `/dashboard/assets/devices`
**适用门户**: Platform
**访问权限**: `platform:devices:view`
**菜单位置**: 顶级菜单 > Assets > Device Activity

---

## 一、页面概述

Device Activity 页面是所有激活码的全局聚合视图，供平台管理员跨组织查看每一条激活码及其绑定设备的状态。本页面为只读视图，不提供创建或操作激活码的入口（激活码管理入口在 Channels / Customers 页面）。

> 注：本页面的实质是激活码（Activation Code）全局视图，通过激活码与设备的绑定关系间接反映设备状态。

---

## 二、页面内容

### 2.1 激活码列表（全局视图）

| 列名 | 说明 |
|------|------|
| Activation Code | 激活码字符串 |
| Org | 激活码所属客户组织名称 |
| Type | 激活码类型：`Regular`（蓝色）/ `Trial`（橙色） |
| Status | 激活码状态：`Unused`（蓝色）/ `Bound`（绿色）/ `Expired`（灰色）/ `Revoked`（红色） |
| Bound Device ID | 已绑定的设备 ID；未绑定显示"—" |
| Nickname | 绑定设备的别名；未设置显示"—" |
| Created By | 创建来源：`Platform`（紫色）/ `Channel`（青色） |
| Created At | 创建时间 |

### 2.2 筛选

| 筛选项 | 说明 |
|--------|------|
| Filter by Org | 仅列出 `CUSTOMER` 类型组织；支持搜索 |
| Filter by Status | Unused / Bound / Expired / Revoked |

---

## 三、操作

本页面为只读视图，无任何操作入口。

---

## 四、黑盒规则

### R-DA-01：本页包含渠道码池中未分配的激活码
页面展示所有激活码（包括 `org_id = null` 的渠道码池激活码）。当选择"Filter by Org"时，`org_id = null` 的记录会被过滤掉，因此渠道码池中的码只在"All Orgs"视图下可见。

### R-DA-02：本页不反映设备的实时在线状态
本页展示的是激活码与设备的绑定关系（Bound Device ID），而非设备的实时在线/离线状态。设备的实时状态由设备心跳维护，不通过本页面展示。

### R-DA-03：一个激活码只能绑定一台设备
激活码具有单次使用性：一旦被绑定（状态变为 `Bound`），该码不可再用于绑定其他设备，`bound_device_id` 字段永久记录绑定的设备 ID。
