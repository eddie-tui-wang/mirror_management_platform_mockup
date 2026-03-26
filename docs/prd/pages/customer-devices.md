# Customer > Devices

**路径**: `/dashboard/customer/devices`
**适用门户**: Customer
**访问权限**: `customer:devices:view`
**菜单位置**: 顶级菜单 > Devices

---

## 一、页面概述

客户端 Devices 页面供客户管理员查看本组织名下的激活码及其绑定的物理设备（AI 智能镜）状态，并可为已绑定设备设置便于识别的别名（Nickname）。设备绑定由设备端直接输入激活码完成，不通过本页面操作。

---

## 二、页面内容

### 2.1 激活码/设备列表

展示 `org_id = 当前客户 org_id` 的所有激活码：

| 列名 | 说明 |
|------|------|
| Activation Code | 激活码字符串（支持一键复制） |
| Type | `Regular`（蓝色）/ `Trial`（橙色） |
| Status | 激活码当前状态 |
| Bound Device | 已绑定的设备 ID；未绑定显示"—" |
| Nickname | 绑定设备的别名；未设置显示"—" |
| Created At | 激活码创建时间 |
| Actions | 状态为 `Bound` 时显示 Set/Edit Nickname 按钮；其他状态无操作 |

页面顶部说明文字："Each activation code is single-use. Enter it on a device to bind it to your account. Contact your account manager to obtain new codes."

### 2.2 分页

- 默认每页显示 10 条记录。

---

## 三、核心操作

> 设备绑定（激活码与设备的关联）由设备端直接输入激活码完成，不在本页面提供操作入口。

### 3.1 设置/编辑设备别名（Set Nickname / Edit Nickname）

**所需权限**: `customer:devices:manage`
**触发条件**: 激活码状态为 `Bound`

点击 **Set Nickname**（未设置时）或 **Edit Nickname**（已设置时）打开弹窗：

| 字段 | 说明 |
|------|------|
| Nickname | 自定义文本，最多 50 个字符 |

- 别名保存后，Actions 列按钮文字变为 **Edit Nickname**。
- 别名可以被覆盖更新，不限次数。

---

## 四、激活码状态说明

| 状态 | 含义 | 可执行操作 |
|------|------|---------|
| Unused | 已创建，未绑定设备（等待设备端输入激活码） | 无 |
| Bound | 已绑定一台设备 | Set/Edit Nickname |
| Revoked | 被管理员手动撤销 | 无 |

---

## 五、黑盒规则

### R-CD-01：客户无法自行获取激活码，只能通过管理员渠道
客户端 Devices 页面没有"创建激活码"的入口。激活码由平台管理员或渠道管理员创建并分配给客户后才会出现在此页面。页面说明文字明确提示"Contact your account manager to obtain new codes."

### R-CD-02：设备绑定由设备端发起，管理后台不提供绑定入口
激活码与设备的绑定动作由智能镜设备端输入激活码后触发，管理后台（本页面）不提供"绑定设备"操作。客户管理员可将激活码提供给现场操作人员，由其在设备上完成绑定。

### R-CD-03：激活码绑定是单向且不可逆的
一旦激活码与设备绑定（状态变为 `Bound`），该绑定关系无法解除，也无法将该码重新绑定到其他设备。若需更换设备，需创建新的激活码并由新设备重新绑定。

### R-CD-04：Trial 码的 Nickname 设置方式与 Regular 码相同
两类激活码绑定后，均可通过本页面的 Set/Edit Nickname 操作设置设备别名。区别在于 Trial 码受最大试穿次数（`trial_max_sessions`）限制。

### R-CD-05：Revoked 状态的激活码无法执行任何操作
`Revoked` 状态的激活码在列表中仍然可见（用于历史追溯），但 Actions 列不显示任何可操作按钮。
