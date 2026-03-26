# 产品文档索引（Information Architecture）

> 本目录按信息架构（IA）层级组织，每个页面对应一份独立的产品文档。

---

## 认证层（Auth）

| 文档 | 路径 | 说明 |
|------|------|------|
| [Login](auth-login.md) | `/login` | 统一登录页，两步验证（凭证 + 邮箱验证码） |
| [Forgot Password](auth-forgot-password.md) | `/forgot-password` | 密码重置页，三步流程 |

---

## Platform 门户

| 文档 | 路径 | 权限 | 说明 |
|------|------|------|------|
| [Channels](platform-channels.md) | `/dashboard/channels` | `platform:channels:view` | 渠道管理，含码池管理 |
| [Customers](platform-customers.md) | `/dashboard/customers` | `platform:customers:view` | 客户管理，含激活码管理 |
| [Assets > Garments](platform-assets-garments.md) | `/dashboard/assets/garments` | `platform:garments:view` | 全量服装聚合视图（只读） |
| [Assets > Templates](platform-assets-templates.md) | `/dashboard/assets/templates` | `platform:templates:view` | 主模板管理 + 分配 |
| [Assets > Device Activity](platform-assets-device-activity.md) | `/dashboard/assets/devices` | `platform:devices:view` | 激活码全局视图（只读） |
| [Email Records](platform-email-records.md) | `/dashboard/email-records` | `platform:email_records:view` | AI 生成结果发送记录 |
| [Website Inquiries](platform-website-inquiries.md) | `/dashboard/website-inquiries` | `platform:website_inquiries:view` | 官网询价表单记录 |

---

## Channel 门户

| 文档 | 路径 | 权限 | 说明 |
|------|------|------|------|
| [Customers](channel-customers.md) | `/dashboard/channel/customers` | `channel:customers:view` | 渠道下属 Reseller 客户管理 |
| [Code Pool](channel-code-pool.md) | `/dashboard/channel/codes` | `channel:codes:view` | 渠道全量激活码视图 |
| [Templates](channel-templates.md) | `/dashboard/channel/templates` | `channel:templates:view` | 模板查阅与分配 |

---

## Customer 门户

| 文档 | 路径 | 权限 | 说明 |
|------|------|------|------|
| [Garments](customer-garments.md) | `/dashboard/customer/garments` | `customer:garments:view` | 服装目录管理，含上传/编辑/设备分配 |
| [Templates](customer-templates.md) | `/dashboard/customer/templates` | `customer:templates:view` | 查看已分配模板 |
| [Devices](customer-devices.md) | `/dashboard/customer/devices` | `customer:devices:view` | 激活码管理与设备绑定 |

---

## 通用页面

| 文档 | 路径 | 权限 | 适用门户 | 说明 |
|------|------|------|---------|------|
| [Settings](common-settings.md) | `/dashboard/settings` | 已登录即可 | 全部 | 个人资料与密码修改，三个门户通用 |

---

## 组织层级关系

```
Platform
├── Channel（渠道）
│   └── Customer（Reseller 客户）
└── Customer（Direct 直客）
```

## 激活码流转路径

```
Platform 创建码
  ├── 直接为 Customer 创建（Regular 或 Trial）
  └── 为 Channel 码池分配（Regular only）
        └── Channel 从池中分配给 Customer（Regular）
              或 Channel 为 Customer 创建 Trial 码

Customer 持有激活码
  └── 客户管理员执行 Bind Device（绑定物理设备）
```
