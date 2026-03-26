# Customer > Templates

**路径**: `/dashboard/customer/templates`
**适用门户**: Customer
**访问权限**: `customer:templates:view`
**菜单位置**: 顶级菜单 > Templates

---

## 一、页面概述

客户端 Templates 页面展示平台已分配给本客户的所有模板，供客户管理员查看已分配模板的基本信息和提示词内容。客户不可自行添加模板，模板分配由平台或渠道管理员完成。

---

## 二、页面内容

### 2.1 模板列表

展示 `TemplateAssignment` 中 `org_id = 当前客户 org_id` 的所有分配记录，关联对应的主模板信息：

| 列名 | 说明 |
|------|------|
| Name | 模板名称 |
| Prompts | 该模板的提示词数量；点击可查看详情 |
| Assigned At | 该模板被分配给本客户的时间 |

页面顶部展示模板总数提示："X template(s) assigned to this account"。

---

## 三、核心操作

### 3.1 查看提示词（View Prompts）

点击某行的 Prompts 数量标签，弹窗展示该模板的全部提示词内容（带序号，每条一行，完整文本）。

弹窗点击 Cancel 关闭。

---

## 四、黑盒规则

### R-CT-01：客户端模板列表仅显示已被分配的模板
本页面数据来源为 `TemplateAssignment` 表，只有平台或渠道管理员已执行过"Assign"操作的模板才会出现。未分配的主模板对客户不可见。

### R-CT-02：客户不可在此页面启用/禁用模板
客户端 Templates 页面为纯只读视图（`customer:templates:view` 权限），不提供启用/禁用模板的操作入口。

> 注：`customer:templates:toggle`（启用/禁用已分配模板）权限在系统中已定义，但当前客户端 Templates 页面未实现该操作 UI。如需上线此功能，可在此页面的每行添加 Enable/Disable 切换控件。

### R-CT-03：提示词仅可查阅，不可编辑
客户管理员只能查看提示词内容，无任何编辑权限。提示词由平台管理员在主模板层级维护。
