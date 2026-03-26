# Customer > Devices

**路径**: `/dashboard/customer/devices`
**适用门户**: Customer
**访问权限**: `customer:devices:view`
**菜单位置**: 顶级菜单 > Devices

---

## 一、页面概述

客户端 Devices 页面供客户管理员管理本组织名下的激活码及其绑定的物理设备（AI 智能镜）。通过激活码机制，客户将智能镜设备与自身账号绑定，并可为绑定设备设置便于识别的别名（Nickname）。

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
| Actions | 根据状态动态显示操作按钮 |

页面顶部说明文字："Each activation code is single-use. Enter it on a device to bind it to your account. Contact your account manager to obtain new codes."

### 2.2 分页

- 默认每页显示 10 条记录。

---

## 三、核心操作

### 3.1 绑定设备（Bind Device）

**所需权限**: `customer:devices:manage`
**触发条件**: 激活码状态为 `Unused`

点击 **Bind Device** 打开弹窗，手动输入设备 ID：

| 字段 | 说明 |
|------|------|
| Device ID | 手动输入目标智能镜设备的 Device ID（如 `dev_42`） |

- Device ID 不可为空（Bind 按钮在输入为空时禁用）。
- 确认后激活码状态从 `Unused` 变为 `Bound`，`bound_device_id` 记录为输入的设备 ID，`bound_at` 记录绑定时间。
- 一个激活码绑定后不可解绑，也不可再绑定其他设备。

### 3.2 设置/编辑设备别名（Set Nickname / Edit Nickname）

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
| Unused | 已创建，未绑定设备 | Bind Device |
| Bound | 已绑定一台设备 | Set/Edit Nickname |
| Expired | 超过 7 天有效期未使用 | 无 |
| Revoked | 被管理员手动撤销 | 无 |

---

## 五、黑盒规则

### R-CD-01：客户无法自行获取激活码，只能通过管理员渠道
客户端 Devices 页面没有"创建激活码"的入口。激活码由平台管理员或渠道管理员创建并分配给客户后才会出现在此页面。页面说明文字明确提示"Contact your account manager to obtain new codes."

### R-CD-02：绑定操作需要客户知晓设备的物理 Device ID
绑定设备时，客户需手动输入设备 ID（设备出厂时印刷或系统自动分配的唯一标识）。系统不提供设备搜索或扫码绑定，需以人工方式传达 Device ID。

### R-CD-03：激活码绑定是单向且不可逆的
一旦激活码与设备绑定（状态变为 `Bound`），该绑定关系无法解除，也无法将该码重新绑定到其他设备。若需更换设备，需创建新的激活码并用新码绑定新设备。

### R-CD-04：Trial 码在本页同样可执行绑定和设置别名
Trial 类型激活码与 Regular 类型激活码的绑定流程完全一致，都可通过本页面执行 Bind Device 和设置 Nickname 操作。两者的区别在于 Trial 码受最大试穿次数（`trial_max_sessions`）限制。

### R-CD-05：Expired 和 Revoked 状态的激活码无法执行任何操作
`Expired` 和 `Revoked` 状态的激活码在列表中仍然可见（用于历史追溯），但 Actions 列不显示任何可操作按钮。
