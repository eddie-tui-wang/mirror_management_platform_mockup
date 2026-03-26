# Settings（Personal Settings）

**路径**: `/dashboard/settings`
**适用门户**: 全部（Platform / Channel / Customer）
**访问权限**: 已登录用户均可访问，无额外权限要求
**菜单位置**: 通常在页面右上角头像/用户名下拉菜单中

---

## 一、页面概述

Settings（个人设置）页面供所有登录用户管理个人账号信息，包括查看账号基本资料和修改密码。本页面对三个门户（Platform、Channel、Customer）通用，内容和功能完全一致。

---

## 二、页面内容

### 2.1 Profile Card（基本资料）

展示当前登录用户的账号信息：

| 字段 | 可编辑 | 说明 |
|------|--------|------|
| 头像 | 否 | 系统自动生成的门户色头像，图标为用户图标 |
| Display Name | 是 | 用户显示名称（姓名） |
| Email | 否 | 账号邮箱，不可修改 |
| Organization | 否 | 所属组织名称，不可修改 |
| Organization Type | 否 | 门户类型：Platform / Channel / Customer |

头像颜色根据门户类型不同而不同：
- Platform：深紫色（`#531dab`）
- Channel：深蓝色（`#0958d9`）
- Customer：绿色（`#389e0d`）

### 2.2 Security Card（安全设置）

仅包含密码修改功能。

---

## 三、核心操作

### 3.1 编辑显示名称（Edit Display Name）

点击 Display Name 旁的 **Edit** 按钮进入编辑状态：

| 字段 | 校验规则 |
|------|---------|
| Display Name | 最多 50 个字符；不可为空（空值不会保存） |

- 点击 **Save** 保存，点击 **Cancel** 取消。
- 按 Enter 键可快速保存。
- 保存成功后页面立即更新显示新名称。

### 3.2 修改密码（Change Password）

修改密码采用三步 Wizard 流程：

**Step 1 — 邮箱验证（Verify Email）：**
- 系统向当前账号邮箱发送 6 位数字验证码。
- 用户输入验证码后点击 **Verify code**。

| 字段 | 校验规则 |
|------|---------|
| Verification code | 必填；6 位纯数字 |

- 可点击 **Resend** 重新发送验证码。
- 点击 **Cancel** 退出密码修改流程，返回初始状态。

**Step 2 — 设置新密码（New Password）：**

| 字段 | 校验规则 |
|------|---------|
| New password | 必填；至少 8 个字符 |
| Confirm new password | 必填；必须与新密码一致 |

- 点击 **Reset password** 提交。
- 点击 **Back** 返回 Step 1。

**Step 3 — 成功状态：**
- 展示成功提示和 **Done** 按钮。
- 点击 **Done** 返回初始状态（密码修改流程完全重置）。

---

## 四、步骤进度指示

修改密码过程中，页面顶部展示步骤进度条：
- Step 1：Verify Email
- Step 2：New Password

成功状态不显示进度条。

---

## 五、黑盒规则

### R-SET-01：Settings 页面对三个门户通用，功能完全一致
无论登录的是 Platform、Channel 还是 Customer 账号，Settings 页面展示相同的结构和功能（个人资料 + 修改密码），不因门户类型不同而差异化展示。

### R-SET-02：邮箱字段不可修改
账号邮箱作为唯一登录凭证，在 Settings 页面不提供修改入口。如需变更邮箱，需联系系统管理员操作。

### R-SET-03：修改密码需要邮箱验证，无需旧密码
密码修改流程通过邮箱验证码验证用户身份，而非验证旧密码。这与忘记密码（Forgot Password）流程一致。

### R-SET-04：Display Name 修改不影响登录凭证
Display Name（`name` 字段）是展示用名，与登录邮箱（email）和密码相互独立。修改显示名称不影响任何系统权限或登录凭证。

### R-SET-05：密码最小长度为 8 位
新密码至少需要 8 个字符，短于此长度的提交将被客户端校验拦截并提示错误。

---

## 六、适用范围

本文档描述的设置页面适用于所有门户，无需为每个门户单独编写设置页面文档。三个门户的设置页面共用相同的产品逻辑和 UI 结构。
