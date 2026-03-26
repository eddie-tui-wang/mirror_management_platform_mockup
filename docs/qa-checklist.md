# QA 验收清单 — AI Fitting Mirror 管理平台

> 版本：v1.0 · 2026-03-26
> 使用说明：测试人员按模块顺序逐项执行，每项确认通过后打 ✅，发现问题记录在备注列。

---

## 测试账号速查

| 角色 | 邮箱 | 密码 |
|---|---|---|
| Platform Admin | super@platform.com | demo |
| Channel A Admin | admin@channel-a.com | demo |
| Customer X Admin | hq.admin@x.com | demo |

> 验证码步骤：任意 6 位数字均可通过（Demo 模式）

---

## 一、登录 & 认证

### 1.1 正常登录流程

- [ ] 打开 `/login`，页面背景为**纯白色**，无渐变背景
- [ ] "Project Overview" 链接显示在左上角，颜色为深色文字
- [ ] 输入正确邮箱 + 密码（`super@platform.com / demo`），点击 Continue
- [ ] 跳转到邮箱验证步骤，显示目标邮箱地址
- [ ] 输入任意 6 位数字，点击 Sign in，成功跳转 Platform 首页 `/dashboard/channels`
- [ ] 登录 Channel A 账号（`admin@channel-a.com / demo`），成功跳转 `/dashboard/channel/customers`
- [ ] 登录 Customer X 账号（`hq.admin@x.com / demo`），成功跳转 `/dashboard/customer/garments`
- [ ] 使用 Demo Quick Access 下拉直接选择账号，可直接登录对应 Portal

### 1.2 异常登录

- [ ] 输入错误密码，提示 "Invalid email or password"
- [ ] 输入格式不合法的邮箱（如 `abc`），表单阻止提交并内联提示
- [ ] 登录已禁用账号（Channel B: `owner@channel-b.com / demo`），提示账号被禁用
- [ ] 未登录状态直接访问 `/dashboard/channels`，自动重定向至登录页

### 1.3 忘记密码

- [ ] 点击 "Forgot password?" 跳转 `/forgot-password`
- [ ] 输入邮箱 → 点击 Send Code → 同页出现验证码输入框
- [ ] 输入验证码 → 进入设置新密码步骤
- [ ] 两次密码不一致 → 内联提示错误，阻止提交

---

## 二、Platform Portal

> 登录账号：`super@platform.com / demo`

### 2.1 左侧导航

- [ ] 导航菜单显示：Channels、Customers、Email Records、Website Inquiries、Assets（含子项：Garments / Templates / Device Activity）
- [ ] 所有菜单项名称**不含"Management"字样**
- [ ] 点击各菜单项，路由正确跳转，无报错

### 2.2 Channels 页面

- [ ] 页面标题显示 "Channels"（无 Management 字样）
- [ ] 渠道列表正确显示 Channel A / B / C
- [ ] 按名称搜索渠道有效过滤
- [ ] 点击 "View Customers" 跳转至对应渠道筛选的 Customers 页面
- [ ] 禁用 Channel A：弹出确认 Modal → 确认后状态变为 Disabled
- [ ] 重新启用 Channel A：状态恢复 Active

**Manage Codes（给渠道分配激活码）**

- [ ] 点击 Channel A 的 "Manage Codes"，弹出 Code Pool 弹窗
- [ ] 弹窗内**不显示** "Codes in pool" 统计文字
- [ ] 点击 "Create Code" 按钮，弹出创建弹窗
- [ ] 弹窗内只有 **Regular** 类型，无 Trial 选项
- [ ] 弹窗内有数量选择控件（默认 1，可增减），确认按钮显示 "Create N Code(s)"
- [ ] 输入数量 3，点击创建，弹窗关闭，Code Pool 表格新增 3 条 Regular 码
- [ ] 创建的码状态均为 Unused，Type 为 Regular
- [ ] 对 Unused 码点击 Revoke → 确认后状态变为 Revoked

**渠道创建**

- [ ] 点击 "Create Channel"，填写名称（超过 50 字符时，输入被截止并显示计数）
- [ ] 名称为空时，提交被阻止
- [ ] 邮箱格式不合法时，提交被阻止
- [ ] 填写合法信息，点击 Create，提示创建成功

### 2.3 Customers 页面

- [ ] 页面标题显示 "Customers"
- [ ] 列表正确展示所有客户（Direct + Reseller 类型）
- [ ] Customer Type 筛选（All / Direct / Reseller）有效
- [ ] Channel 筛选下拉正确列出所有渠道，筛选有效
- [ ] Status 筛选有效
- [ ] 按名称搜索有效

**Manage Codes（给客户创建激活码）**

- [ ] 点击某客户的 "Manage Codes"，弹出激活码弹窗
- [ ] 弹窗内**不显示** "Regular codes (Unused):" 统计
- [ ] 目标客户 Disabled 时，Create Code 按钮置灰
- [ ] 点击 "Create Code" → 选择 "Regular Code"，弹出创建弹窗
- [ ] Regular 弹窗内显示数量选择控件，可选 1~100
- [ ] 输入数量 2，确认按钮显示 "Create 2 Codes"，点击后表格新增 2 条 Regular 码
- [ ] 点击 "Create Code" → 选择 "Trial Code"，弹出 Trial 弹窗
- [ ] Trial 弹窗内有 25 sessions / 50 sessions 选择，点击 Create 后新增 1 条 Trial 码
- [ ] 对 Unused 码执行 Revoke，状态变为 Revoked

**客户创建**

- [ ] 名称字段有字符计数显示，最多 50 字符
- [ ] 名称为空 → 阻止提交
- [ ] 邮箱格式不合法 → 阻止提交

**其他操作**

- [ ] 点击 "View Assets" 跳转至对应客户筛选的 Garments 页面
- [ ] 禁用 / 启用客户状态变更有效

### 2.4 Assets - Garments 页面

- [ ] 展示所有客户的服装聚合列表
- [ ] Organization 筛选下拉**只显示 Customer 类型**，不显示 Channel
- [ ] Status 筛选有效
- [ ] 按名称搜索有效

### 2.5 Assets - Templates 页面

- [ ] 页面标题显示 "Templates"（无 Management）
- [ ] 模板列表正确展示

**创建模板**

- [ ] 点击 "Create Template"，弹出编辑弹窗
- [ ] 模板名称字段有字符计数，最多 100 字符
- [ ] Prompt 输入框有字符计数，最多 200 字符
- [ ] 重复添加相同 Prompt → 提示已存在，阻止添加
- [ ] 名称为空 → 阻止提交
- [ ] 无 Prompt 时 → 阻止提交

**编辑 / 删除模板**

- [ ] 点击 Edit，可修改名称和 Prompt 列表，保存后列表更新
- [ ] 点击 Delete，弹出确认 Modal，确认后模板移除

**分配给客户**

- [ ] 点击 "Assign"，弹窗显示当前已分配客户列表
- [ ] 可通过多选下拉新增分配客户
- [ ] 已分配客户有 Remove 按钮

### 2.6 Assets - Device Activity 页面

- [ ] 展示全系统激活码聚合列表
- [ ] 可按客户（仅 Customer 类型）筛选
- [ ] 可按状态（Unused / Bound / Expired / Revoked）筛选
- [ ] 列表为只读，无操作按钮

---

## 三、Channel Portal

> 登录账号：`admin@channel-a.com / demo`

### 3.1 左侧导航

- [ ] 导航菜单显示：Customers、Code Pool、Templates
- [ ] 所有菜单项名称不含 "Management" 字样

### 3.2 Customers 页面

- [ ] 页面标题显示 "[Channel A] - Customers"
- [ ] 只展示本渠道下的客户（Customer Y、Customer Z）
- [ ] Status 筛选有效

**Manage Codes**

- [ ] 点击某客户的 "Manage Codes"，弹出激活码弹窗
- [ ] 弹窗顶部显示 "Trial codes: X / 10"（**不含"(Unused)"字样**）
- [ ] Trial codes 数量 = Bound + Unused 的 Trial 码之和（不含 Expired / Revoked）
- [ ] 到达上限（10条）时，"Create Trial Code" 和 "Assign Regular Codes" 按钮置灰
- [ ] 到达上限时，显示警告 Alert

**创建 Trial 码**

- [ ] 点击 "Create Trial Code"，弹出 Modal
- [ ] 可选 25 sessions 或 50 sessions
- [ ] 创建成功后，新码出现在客户激活码列表中
- [ ] Trial codes 计数 +1

**分配 Regular 码（从渠道 Pool）**

- [ ] 点击 "Assign Regular Codes" 按钮（Pool 无可用码时按钮置灰）
- [ ] 弹出新弹窗，展示渠道 Pool 中可用的 Regular 码列表
- [ ] 点击列表中某条码的 "Assign" 按钮
- [ ] 弹窗关闭，该码出现在客户激活码列表中

**Revoke 码**

- [ ] 对 Unused 状态码执行 Revoke → 确认后状态变为 Revoked
- [ ] Bound / Expired / Revoked 状态码无 Revoke 按钮

**客户创建**

- [ ] 名称最多 50 字符，有计数显示
- [ ] 名称为空 → 阻止提交

### 3.3 Code Pool 页面

- [ ] 展示本渠道所有激活码（含已分配给客户的）
- [ ] Type 筛选（Regular / Trial）有效
- [ ] Status 筛选（Unused / Bound / Expired / Revoked）有效
- [ ] **不显示 Sessions 列**
- [ ] "Assigned To" 列：未分配码显示 "Unassigned (Pool)"，已分配码显示客户名

### 3.4 Templates 页面

- [ ] 页面标题显示 "Templates"（无 Management）
- [ ] Prompts 列显示 "X prompts" 数量 Tag，不展示完整内容
- [ ] 点击 "View Prompts" 按钮，弹出 Modal
- [ ] Modal 展示每条 Prompt 的完整内容（蓝色序号 + 全文自然换行）
- [ ] 较长的 Prompt 文字完整显示，不截断
- [ ] 点击 Close 关闭弹窗
- [ ] 点击 "Assign" 按钮，弹窗展示已分配客户列表，可新增分配

---

## 四、Customer Portal

> 登录账号：`hq.admin@x.com / demo`

### 4.1 左侧导航

- [ ] 导航菜单显示：Garments、Templates、Devices

### 4.2 Garments 页面

- [ ] 展示本客户的服装列表
- [ ] Category 筛选有效
- [ ] 多选 checkbox 有效，选中后显示批量操作栏

**上传服装**

- [ ] 点击 "Upload"，弹出上传弹窗
- [ ] 拖拽或点击上传图片（支持 JPG / PNG / WebP）
- [ ] 不支持的格式（如 .gif）上传时提示错误
- [ ] 确认添加后，服装出现在列表中（状态 Active）

**编辑服装**

- [ ] 点击 "Edit"，弹出编辑弹窗
- [ ] Image 区域显示**当前图片预览**，无 URL 输入框
- [ ] 点击 "Upload New" 按钮，可选择本地图片文件替换
- [ ] 替换后预览图即时更新
- [ ] 名称字段有字符计数，最多 100 字符
- [ ] Category 下拉可选择已有分类
- [ ] Sex 下拉可选择 male / female / unisex
- [ ] Templates 多选下拉列出已分配给本账户的模板
- [ ] Status 开关可切换 Active / Disabled
- [ ] 点击 Save，提示更新成功

**分配设备**

- [ ] 点击 "Assign Devices"，弹出设备选择弹窗
- [ ] 弹窗以表格展示**已绑定的激活码设备**（Bound 状态的激活码）
- [ ] 每行显示：Device ID、Nickname（无则显示 —）、Activation Code、Type（Regular/Trial）
- [ ] 可勾选多个设备进行分配
- [ ] 若无 Bound 设备，显示提示 "No activated devices. Please bind a device first on the Devices page."
- [ ] 点击 Save，提示分配成功

**批量操作**

- [ ] 勾选多个服装，批量操作栏出现
- [ ] 批量 Set Category：选择分类后 Apply，提示成功
- [ ] 批量 Delete：弹出确认 Modal，确认后所选服装从列表移除
- [ ] Clear 取消全部勾选

**删除服装**

- [ ] 点击单行 Delete，服装从列表中移除

### 4.3 Templates 页面

- [ ] 只读展示，已分配给本客户的模板列表
- [ ] 显示模板名称、Enabled/Disabled 状态
- [ ] 无创建 / 编辑 / 删除按钮

### 4.4 Devices 页面

- [ ] 展示本账户下所有激活码列表
- [ ] 列：Activation Code / Type / Status / Bound Device / Nickname / Created At / Actions
- [ ] **不显示 Sessions 列**
- [ ] Unused 码：Actions 显示 "Bind Device" 按钮
- [ ] Bound 码：Actions 显示 "Set Nickname" / "Edit Nickname" 按钮
- [ ] Expired / Revoked 码：无 Actions

**绑定设备**

- [ ] 点击 "Bind Device"，弹出输入 Device ID 的 Modal
- [ ] Device ID 为空时，Bind 按钮禁用
- [ ] 输入设备 ID，点击 Bind，激活码状态变为 Bound，Device ID 填入

**设置昵称**

- [ ] 对 Bound 码点击 "Set Nickname"，弹出输入昵称的 Modal
- [ ] 昵称字段有字符计数，最多 50 字符
- [ ] 输入昵称，保存后 Nickname 列更新
- [ ] 再次点击变为 "Edit Nickname"，可修改

---

## 五、权限 & 越权验证

- [ ] Channel 账号访问 `/dashboard/channels` → 跳转 403 页面
- [ ] Channel 账号访问 `/dashboard/customers` → 跳转 403 页面
- [ ] Customer 账号访问 `/dashboard/channel/customers` → 跳转 403 页面
- [ ] Customer 账号访问 `/dashboard/channels` → 跳转 403 页面
- [ ] Platform 账号访问 `/dashboard/customer/garments` → 跳转 403 页面
- [ ] 未登录访问任意内页 → 跳转登录页

---

## 六、字段长度限制验证

| 字段 | 位置 | 限制 |
|---|---|---|
| Display Name | Settings 页面 | 50 字符，有计数 |
| 商品名 | Garments Edit 弹窗 | 100 字符，有计数 |
| Template 名称 | Templates Create/Edit 弹窗 | 100 字符，有计数 |
| Prompt 内容 | Templates Create/Edit 弹窗 | 200 字符，有计数 |
| 设备昵称 | Devices Set Nickname 弹窗 | 50 字符，有计数 |
| Channel 名称 | Create Channel 弹窗 | 50 字符，有计数 |
| Customer 名称 | Create Customer 弹窗 | 50 字符，有计数 |

- [ ] 以上每个字段：输入至上限时，超出部分无法继续输入
- [ ] 计数器正确显示当前字数 / 上限（如 `45/50`）

---

## 七、Settings 页面

> 各端账号均可测试

- [ ] 显示当前账号邮箱（只读）、所属组织
- [ ] Display Name 可点击编辑，输入框最多 50 字符，有计数
- [ ] 修改 Display Name 后，顶部导航用户名同步更新
- [ ] 修改密码流程（2步）可正常走通（Demo 任意码通过）
- [ ] 点击 Logout，退出并跳转登录页

---

*文档维护：每次功能迭代后同步更新本清单*
