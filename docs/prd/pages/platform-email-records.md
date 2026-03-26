【二期】# Platform > Email Records

**路径**: `/dashboard/email-records`
**适用门户**: Platform
**访问权限**: `platform:email_records:view`
**菜单位置**: 顶级菜单 > Email Records

---

## 一、页面概述

Email Records 页面供平台管理员查看系统自动发送的邮件记录，主要记录 AI 智能镜生成虚拟试穿结果后向用户发送的邮件历史。

---

## 二、页面内容

### 2.1 邮件记录列表

| 列名 | 说明 |
|------|------|
| Customer Email | 接收邮件的用户邮箱地址 |
| Sent Time | 邮件发送时间 |
| Generation Result | AI 生成结果的预览图（缩略图，64×64px，点击可放大） |

### 2.2 分页

- 默认每页显示 10 条记录。

---

## 三、操作

本页面为只读视图，无操作入口。

---

## 四、黑盒规则

### R-ER-01：邮件记录由系统自动写入
Email Records 由系统在 AI 智能镜完成虚拟试穿并生成结果图后自动记录，记录内容包含接收者邮箱、发送时间和生成结果图 URL。平台管理员只能查看，不可编辑或删除。

### R-ER-02：生成结果以图片形式存储和展示
每条记录对应一张 AI 生成的试穿效果图（`generation_result_url`），在列表中以缩略图形式展示，图片加载失败时显示占位符。
