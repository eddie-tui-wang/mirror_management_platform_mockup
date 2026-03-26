# Login Page

**路径**: `/login`
**适用门户**: 全部（Platform / Channel / Customer）
**访问权限**: 公开页面，无需登录

---

## 一、页面概述

登录页为系统统一入口，所有门户（Platform、Channel、Customer）均使用同一登录页完成身份认证。登录成功后系统根据账号所属门户自动跳转至对应默认页面。

---

## 二、登录流程

登录分为两步：

### Step 1：凭证验证

| 字段 | 类型 | 校验规则 |
|------|------|---------|
| Email | 文本输入 | 必填；必须为有效邮箱格式 |
| Password | 密码输入 | 必填 |

点击 **Continue** 后系统执行：

1. 匹配 email + password 组合，验证账号是否存在。
2. 若账号对应的组织（Org）状态为 `Disabled`，则拒绝登录并提示："This account has been disabled. Please contact your administrator."
3. 若凭证匹配且组织状态正常，则进入 Step 2。
4. 若凭证不匹配，提示："Invalid email or password"，停留在 Step 1。

### Step 2：邮件验证码

系统向账号邮箱发送 6 位数字验证码，用户输入后点击 **Sign in** 完成认证。

| 字段 | 类型 | 校验规则 |
|------|------|---------|
| Verification code | 文本输入 | 必填；必须为 6 位纯数字 |

- 用户可点击 **Resend** 重新发送验证码。
- 可点击 **Back** 返回 Step 1，重新输入凭证（已输入的验证码清空）。

---

## 三、登录后跳转规则

登录成功后，系统根据账号门户类型跳转至对应默认页面：

| 门户类型 | 登录后默认跳转页 |
|---------|----------------|
| Platform | `/dashboard/channels` |
| Channel | `/dashboard/channel/customers` |
| Customer | `/dashboard/customer/garments` |

---

## 四、账号规则

### R-LOGIN-01：组织状态检查在凭证验证通过后立即执行
凭证（email + password）验证通过后，系统会检查该账号所属组织的 `status` 字段。若组织状态为 `Disabled`，则即使凭证正确也无法登录，系统提示账号已被禁用。此检查在进入 Step 2 之前完成。

### R-LOGIN-02：验证码与门户无关
同一账号无论属于哪个门户，均通过相同的邮箱验证码流程完成第二步验证。验证码不区分门户。

### R-LOGIN-03：门户类型由账号决定，用户无法手动选择
用户无法在登录时选择门户类型。门户类型由账号在系统中的归属决定，登录后自动路由。

### R-LOGIN-04：一个账号只能属于一个组织
每个账号（email）对应唯一的组织成员身份。同一 email 不可同时属于多个组织。

---

## 五、导航

- 页面提供 **Forgot password?** 链接，跳转至 `/forgot-password`。
- 登录成功后无法通过浏览器后退回到登录页（认证状态持久化）。
