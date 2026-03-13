# 激活码完整流程方案

> AI Fitting Mirror 管理平台 · 设备激活码设计文档
> 涵盖平台超管、渠道、客户三端的全生命周期流程

---

## 一、激活码类型

| 类型 | 说明 | 使用场景 |
|---|---|---|
| **Regular（正式码）** | 永久有效，无会话次数上限 | 正式付费客户的设备绑定 |
| **Trial（试用码）** | 有最大试穿次数限制（25 或 50 次） | 试用账号，用于销售演示 |

---

## 二、激活码状态机

```
          生成
  ┌──────────────────────────────┐
  │                              ↓
  │                           Unused
  │                         /        \
  │              设备输入码绑定        被管理员 Revoke
  │                 ↓                      ↓
  │               Bound                 Revoked（终态）
  │                 |
  │        Trial 码达到次数上限 / 有效期到
  │                 ↓
  │              Expired（终态）
  └──────────────────────────────
```

### 状态说明

| 状态 | 颜色标识 | 含义 | 是否终态 |
|---|---|---|---|
| **Unused** | 蓝色 | 已生成，尚未被任何设备使用 | 否 |
| **Bound** | 绿色 | 已被某台设备绑定，正常使用中 | 否（Trial 可转 Expired） |
| **Expired** | 灰色 | Trial 码次数耗尽 | 是 |
| **Revoked** | 红色 | 被管理员主动作废 | 是 |

---

## 三、激活码分配机制

### 3.1 总量限制

- **平台方**：创建激活码无总量上限
- **渠道方**：可用激活码数量取决于平台方已分配的数量，加上自行创建的 Trial 码
- **客户**：每个客户最多持有 **10 个**激活码（Regular + Trial 合计，无论状态）

### 3.2 两种分配路径

```
路径 A（渠道路径）：
  平台方 ──[创建 Regular 码]──→ 渠道方（持有码池）──[分配给客户]──→ 客户

路径 B（直销路径）：
  平台方 ──[直接创建 Regular 或 Trial 码]──→ 客户
```

---

## 四、各端角色职责

### 4.1 平台超管（Platform）

**能做什么：**
- 为**渠道方**批量创建 **Regular 码**，由渠道持有后自行分配（渠道路径）
- 为**直销客户**直接创建 **Regular 码**或 **Trial 码**（直销路径）
- 查看全平台所有激活码（全量视图，可按客户 / 状态过滤）
- 对 **Unused** 状态的码执行 Revoke

**不能做什么：**
- 不直接操作已 Bound 的码（解绑由客户端发起）

**入口：** `平台管理 → Customers → Manage Codes 弹窗`
**权限 Key：** `platform:customers:create_code`、`platform:devices:view`

---

### 4.2 渠道（Channel）

**能做什么：**
- 查看自己持有的所有**可用激活码**（平台分配的 Regular 码 + 自行创建的 Trial 码）
- 将持有的激活码**按需分配给旗下客户**（把码卖给 / 发给客户时操作）
- 自行创建 **Trial 码**（选择 25 或 50 次上限），用于试用销售
- 查看旗下各客户已持有的激活码数量
- 对 **Unused** 状态的 Trial 码执行 Revoke

**不能做什么：**
- 不能自行创建 Regular 码（Regular 码仅由平台超管创建）
- 不能跨渠道查看其他渠道的客户激活码

**渠道需看到的两个视图：**

| 视图 | 内容 |
|---|---|
| **a. 客户激活码汇总** | 旗下每个客户当前已持有多少激活码（含各状态分布） |
| **b. 自身可用码列表** | 平台分配给本渠道但尚未分配出去的 Unused 码，以及自行创建的 Trial 码 |

**入口：** `渠道管理 → Customers → Manage Codes 弹窗`、`渠道管理 → Codes（激活码管理）`
**权限 Key：** `channel:customers:create_code`

---

### 4.3 客户（Customer）

**能做什么：**
- 查看自己账户下所有激活码（Unused / Bound / Expired / Revoked）
- 使用 Unused 码在设备端输入完成绑定（设备侧操作）
- 查看已绑定设备的信息（设备 ID、绑定时间、Nickname）
- 为已绑定设备设置 / 修改 Nickname
- 申请解绑（Bound → Unused，联系渠道 / 平台）

**不能做什么：**
- 不能自行生成激活码
- 不能 Revoke 任何码
- 客户端只读展示，无生成和作废权限

**数量上限：** 每个客户最多持有 **10 个**激活码（Regular + Trial 合计）

**入口：** `设备管理 → Devices（激活码列表）`
**权限 Key：** `customer:devices:view`、`customer:devices:manage`

---

## 五、Revoke 规则详表

| 激活码状态 | 平台超管 | 渠道 | 客户 | 备注 |
|---|---|---|---|---|
| **Unused** | ✅ 可 Revoke | ✅ 可 Revoke（仅自己渠道下） | ❌ | 唯一可操作的状态 |
| **Bound** | ❌ 不可直接 Revoke | ❌ | ❌ | 需先通过解绑流程，再由管理员处理 |
| **Expired** | ❌ | ❌ | ❌ | 自然终态，无需 Revoke |
| **Revoked** | ❌ | ❌ | ❌ | 已是终态 |

> **设计决策**：Bound 状态不支持直接 Revoke，是为了防止误操作导致正在使用的设备突然断连。
> 如需强制解绑，应走「解绑申请 → 管理员确认 → 码回到 Unused → 再 Revoke」的流程（当前 Demo 未实现解绑，待规划）。

---

## 六、完整生命周期时序

### 路径 A：渠道路径

```
平台超管                  渠道方                   客户（管理后台）          设备（硬件端）
  │                        │                           │                        │
  │  1. 为渠道创建          │                           │                        │
  │     Regular 码          │                           │                        │
  │  → 码归属渠道           │                           │                        │
  │ ──────────────────────→ │                           │                        │
  │                         │  2. 渠道查看可用码池       │                        │
  │                         │                           │                        │
  │                         │  3. 客户需要设备 →         │                        │
  │                         │     将码分配给客户         │                        │
  │                         │ ─────────────────────────→ │                        │
  │                         │                           │  4. 客户在设备上输入码  │
  │                         │                           │ ──────────────────────→ │
  │                         │                           │  5. 设备绑定成功        │
  │                         │                           │ ←────────────────────── │
  │                         │                           │  → 状态: Bound          │
```

### 路径 B：直销路径

```
平台超管                  客户（管理后台）          设备（硬件端）
  │                           │                        │
  │  1. 直接为客户创建         │                        │
  │     Regular / Trial 码    │                        │
  │ ─────────────────────────→ │                        │
  │                           │  2. 客户在设备上输入码  │
  │                           │ ──────────────────────→ │
  │                           │  3. 设备绑定成功        │
  │                           │ ←────────────────────── │
  │                           │  → 状态: Bound          │
```

### Trial 码消耗

```
  （Trial 码）设备每次试穿消耗一次次数
  → trial_used_sessions++
  → 次数耗尽后状态变为 Expired
```

---

## 七、当前 Demo 实现状态

| 功能 | 平台超管 | 渠道 | 客户 | 说明 |
|---|---|---|---|---|
| 查看激活码列表 | ✅ 已实现（全量，可过滤） | ✅ 已实现（名下客户） | ✅ 已实现（只读） | |
| 创建 Regular 码（给客户，直销） | ✅ 已实现（模拟） | ❌ | ❌ | |
| 创建 Regular 码（给渠道） | ❌ 待实现 | — | — | 渠道持有池子模式尚未实现 |
| 渠道持有码池视图 | — | ❌ 待实现 | — | 渠道自身可用码列表 |
| 渠道分配码给客户 | — | ❌ 待实现 | — | 从渠道池子中分配给客户 |
| 创建 Trial 码 | ❌ | ✅ 已实现（25/50 次选择） | ❌ | |
| 客户激活码数量上限（10个） | — | — | ❌ 待实现 | 创建时需校验客户已有码数量 |
| Revoke Unused 码 | ✅ UI 已实现（状态未真实更新） | ✅ UI 已实现（状态未真实更新） | ❌ | **缺陷：onOk 仅 message.success，未修改 mock 状态** |
| 设备绑定（输入码） | — | — | ❌ 未实现 | 客户端缺少「绑定设备」交互入口 |
| 设置 Nickname | — | — | ❌ 未实现 | 客户端只读，无编辑入口 |
| 解绑设备 | ❌ 未实现 | ❌ 未实现 | ❌ 未实现 | 全端缺失 |

---

## 八、待实现功能（优先级排序）

### P0 — 核心流程闭环

1. **Revoke 状态真实写入**
   `onOk` 后将对应 `activationCode.status` 改为 `'Revoked'`，UI 刷新列表

2. **平台为渠道创建 Regular 码**
   平台管理 → Channels 页面增加「Create Codes for Channel」入口，生成后码归属渠道

3. **渠道持有码池 + 分配给客户**
   渠道 Codes 页面展示自身可用码列表；Customers 页面支持将渠道持有的码分配给指定客户

4. **客户激活码上限校验（10 个）**
   创建码时检查目标客户现有激活码数量，超过 10 个时阻止并提示

5. **客户端「绑定设备」交互**
   Devices 页面对 Unused 码增加「Bind Device」按钮，输入 Device ID（或从下拉列表选），模拟绑定 → 状态变 Bound

6. **客户端「设置 Nickname」**
   Bound 码行增加编辑 Nickname 的内联操作

### P1 — 体验完善

7. **Bound 码展示设备信息**
   Bound 行展示设备 Nickname、绑定时间，点击可跳转设备详情

8. **Trial 码进度展示**
   客户端展示 `trial_used_sessions / trial_max_sessions` 进度条

9. **渠道客户激活码汇总视图**
   渠道 Customers 列表增加「已持有激活码数」列，一眼看出哪些客户码快用完了

### P2 — 管理功能

10. **强制解绑（Force Unbind）**
    平台超管可将 Bound 码强制解绑（码回到 Unused），用于设备报废 / 转移场景

---

## 九、数据模型参考

```typescript
type ActivationCodeStatus = 'Unused' | 'Bound' | 'Expired' | 'Revoked';
type CodeType = 'Regular' | 'Trial';

interface ActivationCode {
  code_id: string;
  code: string;                          // e.g. "AFMR-A1B2-C3D4"
  org_id: string;                        // 归属客户（分配后写入；未分配时归属渠道）
  created_by_portal: 'platform' | 'channel';
  created_at: string;
  expires_at: string;                    // Unused 码创建后 7 天过期
  status: ActivationCodeStatus;
  bound_device_id: string | null;        // Bound 后写入
  bound_at: string | null;
  nickname: string | null;               // 客户自定义设备名
  code_type: CodeType;
  // Trial 专用字段（Regular 均为 null）
  trial_duration_days: number | null;
  trial_max_sessions: number | null;     // 25 或 50
  trial_used_sessions: number | null;    // 已消耗次数
}

// 客户激活码上限
const CUSTOMER_CODE_LIMIT = 10;         // Regular + Trial 合计不超过 10 个
```
