# Platform > Assets > Garments

**路径**: `/dashboard/assets/garments`
**适用门户**: Platform
**访问权限**: `platform:garments:view`
**菜单位置**: 顶级菜单 > Assets > Garments

---

## 一、页面概述

平台端 Garments 页面是所有客户服装目录的聚合视图，供平台管理员跨组织查看全量服装数据。本页面为只读聚合视图，不提供服装的增删改操作（服装管理由客户在客户端完成）。

---

## 二、页面内容

### 2.1 服装列表

| 列名 | 说明 |
|------|------|
| Image | 服装缩略图（60×60px） |
| Name | 服装名称 |
| Org | 服装所属客户组织名称 |
| Status | 服装状态：`Active`（绿色）/ `Disabled`（红色） |
| Updated At | 最近更新时间 |

### 2.2 筛选

| 筛选项 | 说明 |
|--------|------|
| Filter by Org | 下拉筛选，仅列出 `CUSTOMER` 类型的组织；按客户名称搜索 |
| Filter by Status | Active / Disabled |
| 搜索框 | 按服装名称（Name）进行模糊搜索（防抖 500ms） |

页面支持通过 URL 参数 `?org=<org_id>` 预设组织筛选（例如从 Customers 页面点击"View Assets"跳转时自动传入）。

---

## 三、操作

本页面为只读聚合视图，无增删改操作。

---

## 四、黑盒规则

### R-PGA-01：本页展示数据包含渠道直属服装
服装数据（GarmentCatalog）的 `org_id` 可以指向 CUSTOMER 或 CHANNEL 类型的组织。本页面展示全部 `org_id` 对应的服装，不过滤渠道直属服装，但筛选器中"Filter by Org"只列出客户类型组织。

### R-PGA-02：本页不可编辑服装
服装的增删改（上传、编辑、删除）权限归属于客户门户，平台端仅有聚合查看权限（`platform:garments:view`）。平台管理员如需修改某客户的服装，需切换至对应客户账号登录后操作。
