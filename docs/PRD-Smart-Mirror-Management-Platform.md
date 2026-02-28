# Smart Mirror Management Platform — 开发参考文档

> v3.1 · 2026-02-28

---

## 角色 & 权限 Key 速查

| 角色 | Portal | 标识 |
|------|--------|------|
| `PlatformSuperAdmin` | Platform | 超管 |
| `ChannelOwner` | Channel | 渠道管理员 |
| `HQOwner` | Customer | 客户管理员 |

权限执行三层：**菜单隐藏 → RouteGuard（403） → PermGuard（按钮置灰）**

---

## 登录后跳转

```
PlatformSuperAdmin  →  /dashboard/channels
ChannelOwner        →  /dashboard/channel/customers
HQOwner             →  /dashboard/customer/users
```

---

## F-2 登录 `/`

**访问**：公开

**异常状态**
- 邮箱格式不合法 → 字段内联报错，阻止提交
- 凭据错误 → Toast "邮箱或密码错误"（不区分哪个错）
- 账号被禁用 → Toast "账号已被停用，请联系管理员"
- 未登录访问内页 → 重定向 `/`

---

## F-3 无权限 `/dashboard/forbidden`

**访问**：已登录但越权访问时由 RouteGuard 渲染

**异常状态**
- 未登录用户不触发 403，直接重定向登录页

---

## P-1 渠道管理 `/dashboard/channels`

**访问**：`PlatformSuperAdmin` only

| 操作 | 权限 Key |
|------|---------|
| 创建渠道 | `platform:channels:create` |
| 禁用 / 启用 | `platform:channels:disable` |
| 查看客户（跳转） | — |

**异常状态**
- 渠道名称为空 → 表单阻止
- 邮箱格式不合法 → 内联提示
- 渠道被禁用后，该渠道管理员登录 → 提示"账号所属组织已停用"

---

## P-2 客户管理（超管视图）`/dashboard/customers`

**访问**：`PlatformSuperAdmin` only

| 操作 | 权限 Key |
|------|---------|
| 创建直签客户 | `platform:customers:create` |
| 禁用 / 启用客户 | —（无 PermGuard，直接操作） |

**异常状态**
- 客户名称为空 → 阻止提交
- Trial 开启但天数 / 配额未填 → 阻止提交
- Trial 天数 ≤ 0 → 阻止提交
- Trial 已过期（天数到期 or 配额耗尽）→ 展示"Trial - Expired"，说明原因

---

## P-3 用户与角色 `/dashboard/users`

**访问**：`PlatformSuperAdmin` only

| 操作 | 权限 Key |
|------|---------|
| 禁用 / 启用用户 | `platform:users:disable` |
| 重置密码 | `platform:users:reset_password` |
| 变更角色 | `platform:users:change_role` |

**异常状态**
- 搜索无结果 → 空状态
- 从渠道 / 客户页携带 `orgId` 参数跳转 → 自动筛选对应组织

---

## P-4 服装库（超管聚合视图）`/dashboard/assets/garments`

**访问**：`PlatformSuperAdmin` only

| 操作 | 权限 Key |
|------|---------|
| 编辑服装 | `platform:garments:edit` |
| 删除服装 | `platform:garments:delete` |

**异常状态**
- 图片加载失败 → 展示占位图
- 删除操作 → Modal 二次确认，显示所属组织名称

---

## P-5 模板库（超管视图）`/dashboard/assets/templates`

**访问**：`PlatformSuperAdmin` only

| 操作 | 权限 Key |
|------|---------|
| 创建模板 | `platform:templates:create` |
| 编辑模板 | `platform:templates:edit` |
| 删除模板 | `platform:templates:delete` |
| 分配给客户 | `platform:templates:assign` |

**异常状态**
- 添加重复 Prompt → 提示"该 Prompt 已存在"，阻止添加
- 删除有分配记录的模板 → 确认 Modal 显示"将同时移除 N 个客户的分配记录"
- 平台 Disabled 的模板 → 客户端 Toggle 强制置灰不可操作

---

## P-6 设备管理（超管聚合视图）`/dashboard/assets/devices`

**访问**：`PlatformSuperAdmin` only
**只读**，无编辑 / 删除操作

**异常状态**
- 无异常操作，纯展示

---

## C-1 渠道端·客户管理 `/dashboard/channel/customers`

**访问**：`ChannelOwner` only

| 操作 | 权限 Key |
|------|---------|
| 创建渠道客户 | `channel:customers:create` |
| 重发邀请 | `channel:users:reinvite` |
| 禁用 / 启用客户账号 | — （无 PermGuard，直接操作） |

**异常状态**
- 客户名称为空 → 阻止提交
- 邮箱格式不合法 → 内联提示
- Trial 开启但天数 / 配额未填 → 阻止提交
- 客户管理员从未登录（`last_login_at = null`）→ 操作列显示「重发邀请」
- 客户管理员已登录过 → 不显示「重发邀请」
- 列表为空 → 空状态

---

## K-1 客户端·组织成员 `/dashboard/customer/users`

**访问**：`HQOwner` only

| 操作 | 权限 Key |
|------|---------|
| 邀请成员 | `customer:users:invite` |
| 禁用 / 启用成员 | `customer:users:disable` |
| 重置成员密码 | `customer:users:reset_password` |

**异常状态**
- 邀请表单邮箱为空 / 角色未选 → 阻止提交
- 列表为空 → 空状态

---

## K-2 客户端·服装库 `/dashboard/customer/garments`

**访问**：`HQOwner` only

| 操作 | 权限 Key |
|------|---------|
| 上传 / 导入服装 | `customer:garments:upload` |
| 编辑服装 | `customer:garments:edit` |
| 删除 / 移除服装 | `customer:garments:delete` |
| 管理分类 | `customer:garments:manage_categories` |
| 分配到设备 | `customer:garments:assign_device` |

**异常状态**
- 图片加载失败 → 展示占位图
- 添加重复分类名 → 提示"分类名已存在"，阻止添加
- 删除有服装的分类 → 确认 Modal 显示受影响服装数量；删除后服装变为"未分类"（服装不删除）
- 批量操作时无选中项 → 批量操作栏不显示

---

## K-3 客户端·模板库 `/dashboard/customer/templates`

**访问**：`HQOwner` only
**只读**，客户不能创建 / 删除 / 分配模板

**无 PermGuard 操作**（所有 HQOwner 均可查看，模板默认全部生效）

**异常状态**
- 列表为空（无已分配模板）→ 空状态"暂无已分配模板"
- Prompt 数量标签点击 → 弹出 Modal 展示完整 Prompt 列表

---

## K-4 客户端·设备管理 `/dashboard/customer/devices`

**访问**：`HQOwner` only

| 操作 | 权限 Key |
|------|---------|
| Acknowledge 新设备 | `customer:devices:manage` |
| 编辑昵称 | `customer:devices:manage` |

**异常状态**
- 新设备（未 Acknowledge）→ 行高亮 + Header Bell 角标 +1
- 设备列表为空 → 空状态
- 设备 Offline → 仍可编辑昵称，状态色标为灰色

**Bell 通知**
- 未确认设备数 > 0 → Bell 显示红点数字
- 全部 Acknowledge 后 → 角标归零

---

## X-1 会话管理

| Portal | 路由 | 数据范围 |
|--------|------|---------|
| 超管 | `/dashboard/sessions` | 全系统 |
| 渠道（V2）| `/dashboard/channel/sessions` | 当前渠道下客户 |
| 客户 | `/dashboard/customer/sessions` | 当前组织 |

**只读**，无任何操作按钮

**异常状态**
- `ACTIVE` 状态会话 → 不显示结束时间，时长显示"进行中"

---

## X-2 个人设置 `/dashboard/settings`

**访问**：所有已登录用户

**修改密码流程（2步）**
1. 向账号邮箱发送验证码 → 用户输入验证码
2. 设置新密码 + 确认新密码

**异常状态**
- 验证码格式不符（非6位数字）→ 字段内联提示
- 新密码 < 8 字符 → 阻止提交
- 两次密码不一致 → 内联提示"两次密码不一致"
- Trial 账号 → Profile 卡片内显示剩余天数、到期日、剩余销售次数；已过期显示"Trial Expired"

---

## 忘记密码 `/forgot-password`

**访问**：公开

**流程（2步）**
1. 输入邮箱 → 点击「Send Code」→ 同屏出现验证码输入框 → 验证通过
2. 设置新密码 + 确认新密码

**异常状态**
- 邮箱格式不合法 → 阻止发送验证码
- 验证码未发送就点提交 → 提交按钮禁用（`disabled`）
- 验证码格式不符 → 字段内联提示
- 两次密码不一致 → 内联提示
