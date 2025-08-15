# API使用规范文档

## 📋 目录
- [基础信息](#基础信息)
- [数据库优化说明](#数据库优化说明)
- [认证方式](#认证方式)
- [通用规范](#通用规范)
- [用户认证接口](#用户认证接口)
- [项目分类接口](#项目分类接口)
- [积分使用记录接口](#积分使用记录接口)
- [管理后台接口](#管理后台接口)
- [ID使用最佳实践](#id使用最佳实践)
- [错误码说明](#错误码说明)
- [未完成接口说明](#未完成接口说明)

---

## 基础信息

### 服务器地址
- **开发环境**: `http://localhost:8000`
- **生产环境**: `https://sodesignai.com`

### API前缀
所有API接口都以 `/api/auth` 为前缀

### 版本信息
- **API版本**: v1.1
- **文档版本**: 2025-08-11
- **Django版本**: 5.2.4
- **DRF版本**: 3.15.2
- **新增功能**: 短信验证码系统

### 数据规范
- **数据格式**: JSON
- **字符编码**: UTF-8
- **时区**: UTC
- **ID生成**: 随机ID（非自增），范围1万亿-9万万亿
- **ID类型**: BIGINT UNSIGNED（数字类型）

### 🆕 最新更新 (2025-08-11)
- **短信验证码系统全面实现** ✅:
  - **阿里云短信服务集成** ✅: 集成阿里云短信API，支持验证码发送
    - 配置阿里云AccessKey、签名"孑行"、模板SMS_324431014
    - 实现6位数字验证码生成和发送功能
    - 支持手机号格式验证和发送结果处理
  - **短信验证码数据模型** ✅: 新增SmsVerificationCode模型
    - 支持验证码存储、过期时间（5分钟）、使用状态跟踪
    - 实现尝试次数限制（最多3次）和自动清理机制
    - 添加数据库索引优化查询性能
  - **短信验证码API接口** ✅: 新增完整的短信验证码API
    - `POST /api/auth/sms/send/` - 发送短信验证码
    - `POST /api/auth/sms/verify/` - 验证短信验证码
    - 修改 `POST /api/auth/register/` - 注册时强制验证短信验证码
  - **安全机制和频率限制** ✅: 实现完善的安全控制
    - 同一手机号1分钟内只能发送一次验证码
    - 验证码5分钟有效期，最多尝试3次
    - 验证成功后立即失效，防止重复使用
    - 自动清理过期和已使用的验证码
  - **测试验证完成** ✅: 使用手机号19301366078完成全流程测试
    - 验证码发送成功，收到阿里云短信
    - 验证码验证功能正常工作
    - 注册流程集成验证码验证，安全性提升
    - 修复注册序列化器逻辑问题，用户成功写入数据库
  - **忘记密码功能** ✅: 新增完整的密码重置功能
    - `POST /api/auth/forgot-password/` - 发送忘记密码验证码
    - `POST /api/auth/reset-password/` - 使用验证码重置密码
    - 支持已注册用户通过短信验证码安全重置密码
    - 完整的验证流程和安全机制
  - **安全机制增强** ✅: 修复关键安全漏洞
    - 修复 `attempt_count` 字段逻辑错误，确保用户可以尝试完整的3次
    - 新增验证码类型隔离机制，注册验证码和重置密码验证码完全分离
    - 防止验证码跨用途使用，提升系统安全性

### 历史更新 (2025-08-06)
- **管理后台系统全面修复**:
  - **用户编辑状态功能** ✅: 修复用户状态编辑功能，支持活跃/非活跃状态切换
  - **令牌管理批量清理功能** ✅: 修复URL路由冲突问题
  - **积分管理图表数据** ✅: 实现真实数据图表显示
  - **生图记录积分修改功能** ✅: 实现积分编辑和同步机制
- **数据库大优化**:
  - **移除自增序列**: 所有核心表已移除AUTO_INCREMENT，使用随机ID生成
  - **实现完全乱序**: ID生成完全随机，递增比例降至47-55%，防止信息泄露
  - **零影响兼容**: API接口、前端代码、业务逻辑完全不受影响
  - **安全性提升**: 防止基于ID的遍历攻击和敏感信息推测
  - **优化表结构**:
    - `users`、`project_categories`、`configs`、`generations`、`tokens`、`point_usage_records`
    - 保持BIGINT UNSIGNED类型，确保性能不受影响
    - 所有外键关系完整，数据一致性得到保证
  - **ID生成器**:
    - 支持高并发环境下的唯一性保证
    - ID分布范围：1万亿-9万万亿，完全随机分布
    - 线程安全，内置重复检测和回退机制
    - 已集成到Django项目的`authentication.utils`模块
  - **数据迁移完成**: 66条记录完整迁移，零数据丢失
  - **代码优化**: 移除独立文件，ID生成器完全集成到Django项目结构中

### 历史更新 (2025-08-05)
- **数据库大优化**:
  - **移除自增序列**: 所有核心表已移除AUTO_INCREMENT，使用随机ID生成
  - **实现完全乱序**: ID生成完全随机，递增比例降至47-55%，防止信息泄露
  - **零影响兼容**: API接口、前端代码、业务逻辑完全不受影响
  - **安全性提升**: 防止基于ID的遍历攻击和敏感信息推测

### 历史更新 (2025-08-04)
- **积分管理系统增强**:
  - 实现积分记录的完整CRUD操作
  - 新增查看积分记录详情功能
  - 新增编辑积分记录功能，支持修改消耗积分和描述
  - 自动同步points_after字段和用户积分余额
  - 项目类型与project_categories表正确映射
  - 删除积分记录时自动恢复用户积分
  - 实时更新统计数据和图表
  - **CSV导出功能完善**:
    - 修复导出文件中项目类型显示"未知"的问题
    - 支持全部记录、筛选结果、批量选中三种导出模式
    - 智能文件命名（自动添加筛选标识）
    - 完善的中文编码支持（BOM头防乱码）
    - 项目类型正确映射为中文名称（ComfyUI、WebUI、对话等）
- **令牌管理系统优化**:
  - 实现软删除机制，撤销而非删除令牌
  - 新增`revoked`字段追踪令牌撤销状态
  - 撤销后令牌立即失效，支持安全审计
  - 优化令牌列表分页显示（支持50条/页）
  - 新增撤销状态筛选功能
  - 新增一键清理已撤销令牌功能
- **最后登录时间追踪**:
  - 用户登录时自动更新`last_login`字段
  - 管理员用户列表显示最后登录时间
  - 支持"从未登录"状态显示
- **用户管理优化**:
  - 去除用户查看功能，统一使用编辑功能
  - 管理员不可禁用自身账户
  - 编辑功能支持所有用户字段修改
  - 用户状态切换功能正常工作

---

## 数据库优化说明

### 🎯 优化概述
为了提升系统安全性和防止信息泄露，我们对数据库进行了全面优化，实现了完全随机的ID生成机制。

### 🔧 技术实现

#### ID生成策略
- **移除自增序列**: 所有核心表已移除AUTO_INCREMENT属性
- **随机ID生成**: 使用`RandomIDGenerator`生成1万亿-9万万亿范围内的随机ID
- **保持数据类型**: 继续使用BIGINT UNSIGNED，确保性能和兼容性
- **线程安全**: 支持高并发环境下的唯一性保证
- **Django集成**: ID生成器已集成到`authentication.utils`模块中

#### 优化的表
| 表名 | 记录数 | ID范围示例 | 乱序程度 |
|------|--------|------------|----------|
| users | 19条 | 1,286,071,206,912,771,874 - 8,833,444,280,517,369,888 | ✅ 53.85%递增比例 |
| project_categories | 4条 | 2,164,238,018,644,507,186 - 6,734,285,177,059,253,106 | ✅ 良好乱序 |
| configs | 6条 | 1,870,234,794,176,292,672 - 5,547,980,102,093,183,415 | ✅ 良好乱序 |
| generations | 3条 | 1,504,355,496,382,637,616 - 7,408,465,358,589,349,628 | ✅ 50%递增比例 |
| tokens | 24条 | 1,129,268,112,755,067,510 - 9,138,296,597,550,244,523 | ✅ 47.83%递增比例 |
| point_usage_records | 10条 | 1,120,103,148,240,669,411 - 8,769,556,661,988,852,545 | ✅ 55.56%递增比例 |

### 🔒 安全性提升

#### 防止信息泄露
- **之前**: 通过连续ID可推测用户数量、注册时间等敏感信息
- **现在**: ID完全随机，无法推测任何业务信息

#### 防止遍历攻击
- **之前**: 攻击者可通过递增ID遍历所有资源
- **现在**: 随机ID使遍历攻击变得不可行

#### 提高系统安全
- **之前**: ID可预测，存在安全隐患
- **现在**: ID不可预测，大幅提升安全性

### 📊 兼容性保证

#### API兼容性
- ✅ 所有API路径保持不变（如`/api/admin/users/{id}/`）
- ✅ 序列化器正常工作，ID字段正确返回
- ✅ 外键查询功能正常
- ✅ 分页、排序、筛选功能不受影响

#### 前端兼容性
- ✅ ID仍为数字类型，前端无需修改
- ✅ 所有业务逻辑保持不变
- ✅ 用户体验完全一致

#### 数据完整性
- ✅ 所有外键关系完整保持
- ✅ 66条记录完整迁移，零数据丢失
- ✅ 索引和查询性能不受影响

### 💡 开发者注意事项

#### 新记录创建
```python
# 创建新用户（ID自动生成）
user = CustomUser(username="test", phone_number="123456789")
user.save()
print(f"新用户ID: {user.id}")  # 输出随机ID，如：4115361349489737397
```

#### ID生成器使用
```python
from authentication.utils import generate_id, generate_batch_ids

# 手动生成随机ID
new_id = generate_id()
print(f"随机ID: {new_id}")  # 输出如：6416157825986189457

# 批量生成乱序ID
ids = generate_batch_ids(10)
print(f"批量ID: {ids}")
```

#### ID验证和分析工具
```python
from authentication.utils import validate_id_format, analyze_id_randomness

# 验证ID格式
is_valid = validate_id_format(6416157825986189457)
print(f"ID格式正确: {is_valid}")  # True

# 分析ID随机性
id_list = [1234567890123456789, 9876543210987654321, 5555555555555555555]
analysis = analyze_id_randomness(id_list)
print(f"随机性等级: {analysis['randomness_level']}")  # 优秀/良好/一般/较差/差
print(f"递增比例: {analysis['increasing_ratio']:.2%}")  # 如：45.67%
```

#### 重要提醒
- ⚠️ **不要依赖ID的顺序性**: ID不再按时间递增
- ⚠️ **不要使用ID推测业务信息**: ID完全随机，无业务含义
- ✅ **继续使用ID作为主键**: 查询、关联等功能完全正常
- ✅ **API使用方式不变**: 所有接口调用方式保持一致

---

## 认证方式

### JWT Token认证
本API使用JWT (JSON Web Token) 进行身份认证，采用RSA256算法签名。

#### Token类型
- **Access Token**: 用于API访问，有效期30分钟 (1800秒)
- **Refresh Token**: 用于刷新Access Token，有效期24小时 (86400秒)

#### 认证头格式
```
Authorization: Bearer <access_token>
```

#### 令牌安全最佳实践
1. **Access Token**: 短期有效，用于API访问
2. **Refresh Token**: 长期有效，仅用于刷新Access Token
3. **撤销机制**: 支持主动撤销可疑或泄露的令牌
4. **自动过期**: 令牌到期后自动失效
5. **审计日志**: 所有令牌操作都有完整的审计记录

---

## 通用规范

### 请求头规范
```http
Content-Type: application/json
Accept: application/json
Authorization: Bearer <access_token>  # 需要认证的接口
```

### 响应格式
#### 成功响应
```json
{
    "message": "操作成功",
    "data": { ... },
    "timestamp": "2025-01-25T10:00:00Z"
}
```

#### 错误响应
```json
{
    "message": "错误描述",
    "errors": { ... },
    "status_code": 400
}
```

### 分页格式
```json
{
    "count": 100,
    "next": "http://localhost:8000/api/auth/endpoint/?page=2",
    "previous": null,
    "results": [ ... ]
}
```

---

## 用户认证接口

### 1. 用户注册

#### 接口信息
- **URL**: `POST /api/auth/register/`
- **权限**: 公开访问
- **描述**: 创建新用户账号，需要短信验证码验证

#### 注册流程
1. 调用 `/api/auth/sms/send/` 发送短信验证码
2. 用户收到短信验证码
3. 调用 `/api/auth/register/` 进行注册，包含验证码

#### 请求示例
```http
POST /api/auth/register/
Content-Type: application/json

{
    "username": "testuser",
    "phone_number": "13800138000",
    "password": "password123",
    "password_confirm": "password123",
    "sms_code": "123456",
    "gender": "male",
    "job_title": "软件工程师",
    "introduction": "个人介绍",
    "avatar_url": "https://example.com/avatar.jpg"
}
```

#### 响应示例
```json
{
    "message": "用户注册成功",
    "user": {
        "id": 1,
        "username": "testuser",
        "phone_number": "13800138000",
        "gender": "male",
        "job_title": "软件工程师",
        "introduction": "个人介绍",
        "avatar_url": "https://example.com/avatar.jpg",
        "points": 1000,
        "system_role": "user",
        "created_at": "2025-01-25T10:00:00Z"
    },
    "tokens": {
        "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9...",
        "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9...",
        "access_expires_in": 3600,
        "refresh_expires_in": 604800
    }
}
```

### 2. 用户登录

#### 接口信息
- **URL**: `POST /api/auth/login/`
- **权限**: 公开访问
- **描述**: 用户登录获取Token

#### 请求示例
```http
POST /api/auth/login/
Content-Type: application/json

{
    "username": "testuser",
    "password": "password123"
}
```

#### 响应示例
```json
{
    "message": "登录成功",
    "user": {
        "id": 1,
        "username": "testuser",
        "phone_number": "13800138000",
        "gender": "male",
        "job_title": "软件工程师",
        "introduction": "个人介绍",
        "avatar_url": "https://example.com/avatar.jpg",
        "points": 1000,
        "system_role": "user",
        "created_at": "2025-01-25T10:00:00Z",
        "last_login": "2025-01-25 14:30:45"
    },
    "tokens": {
        "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9...",
        "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9...",
        "access_expires_in": 3600,
        "refresh_expires_in": 604800
    }
}
```

### 3. Token刷新

#### 接口信息
- **URL**: `POST /api/auth/refresh/`
- **权限**: 公开访问
- **描述**: 使用Refresh Token获取新的Access Token

#### 请求示例
```http
POST /api/auth/refresh/
Content-Type: application/json

{
    "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9..."
}
```

#### 响应示例

##### 成功响应
```json
{
    "message": "Token刷新成功",
    "tokens": {
        "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9...",
        "access_expires_in": 1800
    }
}
```

##### 失败响应（令牌已撤销）
```json
{
    "message": "Token刷新失败",
    "error": "Refresh token已被撤销"
}
```

##### 失败响应（令牌过期）
```json
{
    "message": "Token刷新失败",
    "error": "Refresh token已过期"
}
```

### 4. 用户登出

#### 接口信息
- **URL**: `POST /api/auth/logout/`
- **权限**: 已认证用户
- **描述**: 用户登出，撤销Token

#### 请求示例
```http
POST /api/auth/logout/
Authorization: Bearer <access_token>
```

#### 响应示例
```json
{
    "message": "登出成功"
}
```

### 5. 获取用户资料

#### 接口信息
- **URL**: `GET /api/auth/profile/`
- **权限**: 已认证用户
- **描述**: 获取当前用户的详细信息

#### 请求示例
```http
GET /api/auth/profile/
Authorization: Bearer <access_token>
```

#### 响应示例
```json
{
    "id": 1,
    "username": "testuser",
    "phone_number": "13800138000",
    "gender": "male",
    "job_title": "软件工程师",
    "introduction": "个人介绍",
    "avatar_url": "https://example.com/avatar.jpg",
    "points": 1000,
    "system_role": "user",
    "created_at": "2025-01-25T10:00:00Z",
    "updated_at": "2025-01-25T10:00:00Z"
}
```

### 6. 更新用户资料

#### 接口信息
- **URL**: `PUT /api/auth/profile/update/`
- **权限**: 已认证用户
- **描述**: 更新当前用户的资料信息

#### 请求示例
```http
PUT /api/auth/profile/update/
Authorization: Bearer <access_token>
Content-Type: application/json

{
    "job_title": "高级软件工程师",
    "introduction": "更新后的个人介绍",
    "avatar_url": "https://example.com/new-avatar.jpg"
}
```

#### 响应示例
```json
{
    "message": "用户资料更新成功",
    "user": {
        "id": 1,
        "username": "testuser",
        "phone_number": "13800138000",
        "gender": "male",
        "job_title": "高级软件工程师",
        "introduction": "更新后的个人介绍",
        "avatar_url": "https://example.com/new-avatar.jpg",
        "points": 1000,
        "system_role": "user",
        "created_at": "2025-01-25T10:00:00Z",
        "updated_at": "2025-01-25T10:30:00Z"
    }
}
```

### 7. 修改密码

#### 接口信息
- **URL**: `POST /api/auth/password/change/`
- **权限**: 已认证用户
- **描述**: 修改用户密码

#### 请求示例
```http
POST /api/auth/password/change/
Authorization: Bearer <access_token>
Content-Type: application/json

{
    "old_password": "oldpassword123",
    "new_password": "newpassword123",
    "new_password_confirm": "newpassword123"
}
```

#### 响应示例
```json
{
    "message": "密码修改成功"
}
```

#### 错误响应示例
```json
{
    "message": "密码修改失败",
    "errors": {
        "old_password": ["旧密码错误"]
    }
}
```

**注意**: 密码修改功能已通过专门测试验证，完全正常工作。如果在综合测试中遇到超时问题，请使用单独的测试脚本验证。

### 8. 发送短信验证码

#### 接口信息
- **URL**: `POST /api/auth/sms/send/`
- **权限**: 公开访问
- **描述**: 发送短信验证码到指定手机号

#### 请求示例
```http
POST /api/auth/sms/send/
Content-Type: application/json

{
    "phone_number": "19301366078"
}
```

#### 响应示例

##### 成功响应
```json
{
    "message": "验证码发送成功",
    "request_id": "96CB86E3-BFF7-5204-B99F-54EB5C988115"
}
```

##### 失败响应（发送频率限制）
```json
{
    "message": "发送过于频繁，请1分钟后再试"
}
```

##### 失败响应（手机号格式错误）
```json
{
    "message": "参数验证失败",
    "errors": {
        "phone_number": ["手机号格式不正确"]
    }
}
```

#### 功能特性
- **频率限制**: 同一手机号1分钟内只能发送一次验证码
- **验证码有效期**: 5分钟
- **验证码格式**: 6位数字
- **短信服务**: 使用阿里云短信服务
- **短信签名**: 孑行
- **短信模板**: SMS_324431014

### 9. 验证短信验证码

#### 接口信息
- **URL**: `POST /api/auth/sms/verify/`
- **权限**: 公开访问
- **描述**: 验证短信验证码是否正确

#### 请求示例
```http
POST /api/auth/sms/verify/
Content-Type: application/json

{
    "phone_number": "19301366078",
    "code": "123456"
}
```

#### 响应示例

##### 成功响应
```json
{
    "message": "验证码验证成功"
}
```

##### 失败响应（验证码错误）
```json
{
    "message": "验证码不存在或已使用"
}
```

##### 失败响应（验证码过期）
```json
{
    "message": "验证码已过期"
}
```

##### 失败响应（尝试次数过多）
```json
{
    "message": "验证码尝试次数过多"
}
```

#### 验证规则
- **验证码格式**: 必须是6位数字
- **有效期**: 5分钟内有效
- **尝试次数**: 最多尝试3次
- **使用次数**: 验证成功后立即失效
- **自动清理**: 验证成功后会清理该手机号的其他未使用验证码

### 10. 忘记密码 - 发送验证码

#### 接口信息
- **URL**: `POST /api/auth/forgot-password/`
- **权限**: 公开访问
- **描述**: 为忘记密码的用户发送短信验证码

#### 请求示例
```http
POST /api/auth/forgot-password/
Content-Type: application/json

{
    "phone_number": "13800138002"
}
```

#### 响应示例

##### 成功响应
```json
{
    "message": "验证码发送成功，请查看手机短信",
    "request_id": "F23B9BEF-F808-5E15-B7EA-0214FBCCF878"
}
```

##### 失败响应（手机号未注册）
```json
{
    "message": "参数验证失败",
    "errors": {
        "phone_number": ["该手机号未注册"]
    }
}
```

##### 失败响应（发送频率限制）
```json
{
    "message": "发送过于频繁，请1分钟后再试"
}
```

#### 功能特性
- **用户验证**: 只有已注册的手机号才能接收验证码
- **频率限制**: 同一手机号1分钟内只能发送一次验证码
- **验证码有效期**: 5分钟
- **安全机制**: 与注册验证码使用相同的安全策略

### 11. 重置密码

#### 接口信息
- **URL**: `POST /api/auth/reset-password/`
- **权限**: 公开访问
- **描述**: 使用短信验证码重置用户密码

#### 请求示例
```http
POST /api/auth/reset-password/
Content-Type: application/json

{
    "phone_number": "13800138002",
    "sms_code": "123456",
    "new_password": "newpassword123",
    "confirm_password": "newpassword123"
}
```

#### 响应示例

##### 成功响应
```json
{
    "message": "密码重置成功，请使用新密码登录"
}
```

##### 失败响应（验证码错误）
```json
{
    "message": "参数验证失败",
    "errors": {
        "non_field_errors": ["短信验证码验证失败: 验证码不存在或已使用"]
    }
}
```

##### 失败响应（密码不一致）
```json
{
    "message": "参数验证失败",
    "errors": {
        "non_field_errors": ["两次输入的密码不一致"]
    }
}
```

#### 重置流程
1. 调用 `/api/auth/forgot-password/` 发送验证码
2. 用户收到短信验证码
3. 调用 `/api/auth/reset-password/` 重置密码
4. 使用新密码登录系统

#### 安全机制
- **验证码验证**: 必须提供有效的短信验证码
- **密码强度**: 新密码最少6位字符
- **一次性使用**: 验证码使用后立即失效
- **用户验证**: 只能重置已注册用户的密码

---

## 项目分类接口

### 1. 获取项目分类列表

#### 接口信息
- **URL**: `GET /api/auth/project-categories/`
- **权限**: 公开访问
- **描述**: 获取所有项目分类列表，支持搜索、过滤、排序

#### 查询参数
- `is_active`: 是否启用 (true/false)
- `search`: 搜索关键词（匹配名称和描述）
- `ordering`: 排序字段 (created_at, name, -created_at, -name)
- `page`: 页码
- `page_size`: 每页数量

#### 请求示例
```http
GET /api/auth/project-categories/?is_active=true&search=ComfyUI&ordering=-created_at
```

#### 响应示例
```json
{
    "count": 4,
    "next": null,
    "previous": null,
    "results": [
        {
            "id": 1,
            "name": "ComfyUI",
            "code": "comfyui",
            "description": "ComfyUI工作流生图",
            "is_active": true,
            "created_at": "2025-01-25T10:00:00Z",
            "updated_at": "2025-01-25T10:00:00Z"
        },
        {
            "id": 2,
            "name": "WebUI",
            "code": "webui",
            "description": "Stable Diffusion WebUI生图",
            "is_active": true,
            "created_at": "2025-01-25T10:00:00Z",
            "updated_at": "2025-01-25T10:00:00Z"
        }
    ]
}
```

### 2. 获取单个项目分类

#### 接口信息
- **URL**: `GET /api/auth/project-categories/{id}/`
- **权限**: 公开访问
- **描述**: 获取指定ID的项目分类详情

#### 请求示例
```http
GET /api/auth/project-categories/1/
```

#### 响应示例
```json
{
    "id": 1,
    "name": "ComfyUI",
    "code": "comfyui",
    "description": "ComfyUI工作流生图",
    "is_active": true,
    "created_at": "2025-01-25T10:00:00Z",
    "updated_at": "2025-01-25T10:00:00Z"
}
```

### 3. 创建项目分类

#### 接口信息
- **URL**: `POST /api/auth/project-categories/`
- **权限**: 管理员
- **描述**: 创建新的项目分类

#### 请求示例
```http
POST /api/auth/project-categories/
Authorization: Bearer <admin_access_token>
Content-Type: application/json

{
    "name": "新项目类型",
    "code": "new_project",
    "description": "新的项目分类描述",
    "is_active": true
}
```

#### 响应示例
```json
{
    "id": 5,
    "name": "新项目类型",
    "code": "new_project",
    "description": "新的项目分类描述",
    "is_active": true,
    "created_at": "2025-01-25T10:30:00Z",
    "updated_at": "2025-01-25T10:30:00Z"
}
```

### 4. 更新项目分类

#### 接口信息
- **URL**: `PUT /api/auth/project-categories/{id}/`
- **权限**: 管理员
- **描述**: 更新指定项目分类的信息

#### 请求示例
```http
PUT /api/auth/project-categories/1/
Authorization: Bearer <admin_access_token>
Content-Type: application/json

{
    "name": "ComfyUI工作流",
    "code": "comfyui",
    "description": "ComfyUI工作流生图系统",
    "is_active": true
}
```

#### 响应示例
```json
{
    "id": 1,
    "name": "ComfyUI工作流",
    "code": "comfyui",
    "description": "ComfyUI工作流生图系统",
    "is_active": true,
    "created_at": "2025-01-25T10:00:00Z",
    "updated_at": "2025-01-25T10:35:00Z"
}
```

### 5. 删除项目分类

#### 接口信息
- **URL**: `DELETE /api/auth/project-categories/{id}/`
- **权限**: 管理员
- **描述**: 删除指定的项目分类（有积分记录时禁止删除）

#### 请求示例
```http
DELETE /api/auth/project-categories/5/
Authorization: Bearer <admin_access_token>
```

#### 响应示例
```json
{
    "message": "项目分类删除成功"
}
```

#### 错误响应示例
```json
{
    "message": "该项目分类下存在积分使用记录，无法删除"
}
```

---

## 积分使用记录接口

### 1. 查询积分使用记录

#### 接口信息
- **URL**: `GET /api/auth/point-usage-records/`
- **权限**: 已认证用户
- **描述**: 查询积分使用记录，普通用户只能查看自己的记录，管理员可以查看所有记录

#### 查询参数
- `project_category`: 项目分类ID
- `project_category__code`: 项目分类代码
- `start_date`: 开始日期 (YYYY-MM-DD)
- `end_date`: 结束日期 (YYYY-MM-DD)
- `user_id`: 用户ID（仅管理员）
- `username`: 用户名（仅管理员，模糊匹配）
- `ordering`: 排序字段 (usage_time, points_used, -usage_time, -points_used)
- `page`: 页码
- `page_size`: 每页数量

#### 请求示例
```http
GET /api/auth/point-usage-records/?project_category=1&start_date=2025-01-01&end_date=2025-01-31
Authorization: Bearer <access_token>
```

#### 响应示例
```json
{
    "count": 10,
    "next": "http://localhost:8000/api/auth/point-usage-records/?page=2",
    "previous": null,
    "results": [
        {
            "id": 1,
            "user": 1,
            "user_username": "testuser",
            "project_category": 1,
            "project_category_name": "ComfyUI",
            "project_category_code": "comfyui",
            "usage_item_id": 123,
            "points_before": 1000,
            "points_after": 950,
            "points_used": 50,
            "usage_time": "2025-01-25T10:00:00Z",
            "description": "ComfyUI工作流生图"
        }
    ],
    "stats": {
        "total_records": 10,
        "total_points_used": 500
    }
}
```

### 2. 创建积分使用记录

#### 接口信息
- **URL**: `POST /api/auth/point-usage-records/create/`
- **权限**: 已认证用户
- **描述**: 创建积分使用记录，自动扣除用户积分

#### 请求示例
```http
POST /api/auth/point-usage-records/create/
Authorization: Bearer <access_token>
Content-Type: application/json

{
    "project_category": 1,
    "usage_item_id": 456,
    "points_used": 30,
    "description": "使用ComfyUI生成图片"
}
```

#### 响应示例
```json
{
    "message": "积分使用记录创建成功",
    "record": {
        "id": 15,
        "user": 1,
        "user_username": "testuser",
        "project_category": 1,
        "project_category_name": "ComfyUI",
        "project_category_code": "comfyui",
        "usage_item_id": 456,
        "points_before": 950,
        "points_after": 920,
        "points_used": 30,
        "usage_time": "2025-01-25T10:45:00Z",
        "description": "使用ComfyUI生成图片"
    }
}
```

#### 错误响应示例
```json
{
    "message": "积分不足，当前积分: 20，需要: 30"
}
```

---

## 管理后台接口

### 1. 仪表盘统计接口

#### 1.1 获取仪表盘统计数据

##### 接口信息
- **URL**: `GET /api/admin/dashboard/stats/`
- **权限**: 管理员
- **描述**: 获取仪表盘统计数据

##### 请求示例
```http
GET /api/admin/dashboard/stats/
Authorization: Bearer <access_token>
```

##### 响应示例
```json
{
    "total_users": 13,
    "active_users": 0,
    "comfyui_generations": 9,
    "webui_generations": 1,
    "total_points_used": 250,
    "today_new_users": 1,
    "online_users": 3
}
```

#### 1.2 获取用户增长图表数据

##### 接口信息
- **URL**: `GET /api/admin/dashboard/charts/user-growth/`
- **权限**: 管理员
- **描述**: 获取用户增长趋势数据

##### 请求示例
```http
GET /api/admin/dashboard/charts/user-growth/
Authorization: Bearer <access_token>
```

##### 响应示例
```json
{
    "labels": ["1月", "2月", "3月", "4月", "5月", "6月"],
    "new_users": [12, 19, 8, 15, 22, 18],
    "active_users": [8, 15, 12, 18, 20, 16]
}
```

#### 1.3 获取积分分布图表数据

##### 接口信息
- **URL**: `GET /api/admin/dashboard/charts/points-distribution/`
- **权限**: 管理员
- **描述**: 获取积分分布图表数据

##### 请求示例
```http
GET /api/admin/dashboard/charts/points-distribution/
Authorization: Bearer <access_token>
```

##### 响应示例
```json
{
    "labels": ["0-100积分", "100-500积分", "500-1000积分", "1000+积分"],
    "values": [25, 35, 25, 15]
}
```

#### 1.4 获取最近活动列表

##### 接口信息
- **URL**: `GET /api/admin/dashboard/recent-activities/`
- **权限**: 管理员
- **描述**: 获取最近活动列表

##### 查询参数
- `limit`: 返回记录数量，默认15

##### 请求示例
```http
GET /api/admin/dashboard/recent-activities/?limit=10
Authorization: Bearer <access_token>
```

##### 响应示例
```json
[
    {
        "type": "user_register",
        "description": "新用户 testuser_1754271607 注册",
        "user": "testuser_1754271607",
        "created_at": "2025-08-04T09:40:07Z"
    },
    {
        "type": "point_usage",
        "description": "用户 alice 使用了 10 积分",
        "user": "alice",
        "created_at": "2025-08-04T09:40:26Z"
    }
]
```

### 2. 用户管理接口

#### 2.1 获取用户列表

##### 接口信息
- **URL**: `GET /api/admin/users/`
- **权限**: 管理员
- **描述**: 获取用户管理列表，支持搜索、筛选、分页

##### 功能特性
- **最后登录时间追踪**: 系统会自动记录用户每次登录的时间，显示在`last_login`字段中
- **登录状态显示**: 如果用户从未登录，`last_login`字段为`null`
- **实时更新**: 每次用户登录时，系统会自动更新`last_login`时间戳
- **用户状态管理**: 支持活跃/非活跃状态切换，管理员可以禁用/启用用户账户

##### 查询参数
- `search`: 搜索关键词（用户名或电话号码）
- `role`: 用户角色筛选 (admin, user)
- `gender`: 性别筛选 (male, female, other)
- `is_active`: 状态筛选 (true, false)
- `created_after`: 注册时间起始 (YYYY-MM-DD)
- `created_before`: 注册时间结束 (YYYY-MM-DD)
- `page`: 页码
- `page_size`: 每页数量

##### 请求示例
```http
GET /api/admin/users/?search=alice&role=user&page=1&page_size=20
Authorization: Bearer <access_token>
```

##### 响应示例
```json
{
    "count": 13,
    "next": null,
    "previous": null,
    "results": [
        {
            "id": 1,
            "username": "admin",
            "phone_number": "13800138000",
            "avatar_url": "https://example.com/avatar.jpg",
            "points": 1000,
            "gender": "other",
            "job_title": "系统管理员",
            "introduction": "系统管理员账号",
            "system_role": "admin",
            "following_count": 0,
            "followers_count": 0,
            "is_active": true,
            "created_at": "2025-07-25T10:35:44Z",
            "updated_at": "2025-07-25T10:35:44Z",
            "last_login": "2025-08-04T09:39:45Z"
        }
    ]
}
```

#### 2.2 编辑用户信息

##### 接口信息
- **URL**: `PUT /api/admin/users/{id}/`
- **权限**: 管理员
- **描述**: 编辑用户信息，支持修改所有用户字段包括状态

##### 功能特性
- **完整字段编辑**: 支持修改用户名、手机号、性别、职位、头像URL、个人介绍
- **系统信息编辑**: 支持修改系统角色、积分、用户状态
- **状态切换**: 支持活跃/非活跃状态切换
- **数据验证**: 自动验证字段格式和唯一性
- **实时更新**: 修改后数据立即更新到列表中

##### 请求示例
```http
PUT /api/admin/users/123/
Authorization: Bearer <access_token>
Content-Type: application/json

{
    "username": "updated_user",
    "phone_number": "13900139000",
    "gender": "female",
    "job_title": "高级工程师",
    "avatar_url": "https://example.com/new-avatar.jpg",
    "introduction": "更新后的个人介绍",
    "system_role": "user",
    "points": 1500,
    "is_active": false
}
```

##### 响应示例
```json
{
    "message": "用户信息更新成功",
    "user": {
        "id": 123,
        "username": "updated_user",
        "phone_number": "13900139000",
        "gender": "female",
        "job_title": "高级工程师",
        "avatar_url": "https://example.com/new-avatar.jpg",
        "introduction": "更新后的个人介绍",
        "system_role": "user",
        "points": 1500,
        "is_active": false,
        "updated_at": "2025-08-06T10:30:00Z"
    }
}
```

##### 错误响应示例
```json
{
    "message": "用户信息更新失败",
    "errors": {
        "username": ["该用户名已存在"],
        "phone_number": ["手机号格式不正确"]
    }
}
```

### 3. 令牌管理接口

#### 令牌撤销机制说明

本系统采用**软删除**机制管理JWT令牌，具有以下特点：

##### 撤销状态字段
- `revoked`: 布尔值，标识令牌是否已被撤销
  - `false` (0): 令牌有效，可以正常使用
  - `true` (1): 令牌已撤销，无法继续使用

##### 撤销机制优势
1. **安全性**: 撤销后令牌立即失效，防止未授权访问
2. **审计追踪**: 保留令牌历史记录，便于安全审计
3. **数据完整性**: 不破坏关联数据的完整性
4. **可追溯性**: 可以查询令牌的完整生命周期

##### 撤销触发场景
- 管理员主动撤销可疑令牌
- 用户主动登出（撤销refresh token）
- 检测到异常访问行为
- 批量清理过期或无效令牌

#### 3.1 获取令牌列表

##### 接口信息
- **URL**: `GET /api/admin/tokens/`
- **权限**: 管理员
- **描述**: 获取令牌列表，支持按用户、类型、状态筛选

##### 查询参数
- `user_id`: 用户ID筛选
- `user`: 用户名筛选（模糊匹配）
- `token_type`: 令牌类型 (access, refresh)
- `revoked`: 撤销状态筛选 (true=已撤销, false=有效)
- `expires_before`: 过期时间结束 (YYYY-MM-DD)
- `expires_after`: 过期时间起始 (YYYY-MM-DD)
- `page`: 页码
- `page_size`: 每页数量（默认20，最大100）

##### 请求示例
```http
GET /api/admin/tokens/?token_type=refresh&user=alice&page=1
Authorization: Bearer <access_token>
```

##### 响应示例
```json
{
    "count": 16,
    "next": null,
    "previous": null,
    "results": [
        {
            "id": 1,
            "user": {
                "id": 1,
                "username": "admin",
                "phone_number": "13800138000"
            },
            "username": "admin",
            "token_type": "refresh",
            "expires_at": "2025-08-05T09:39:45Z",
            "created_at": "2025-08-04T09:39:45Z",
            "revoked": false,
            "is_expired": false
        }
    ]
}
```

#### 3.2 撤销单个令牌

##### 接口信息
- **URL**: `DELETE /api/admin/tokens/{id}/`
- **权限**: 管理员
- **描述**: 撤销指定令牌（软删除，标记为已撤销状态）

##### 功能说明
- **撤销机制**: 令牌不会被物理删除，而是标记为已撤销状态 (`revoked=true`)
- **立即生效**: 撤销后令牌立即失效，无法继续使用
- **审计追踪**: 保留令牌记录用于安全审计
- **不可逆操作**: 已撤销的令牌无法恢复

##### 请求示例
```http
DELETE /api/admin/tokens/123/
Authorization: Bearer <access_token>
```

##### 响应示例
```json
{
    "message": "令牌已撤销"
}
```

#### 3.3 批量撤销令牌

##### 接口信息
- **URL**: `POST /api/admin/tokens/batch-delete/`
- **权限**: 管理员
- **描述**: 批量撤销令牌（软删除，标记为已撤销状态）

##### 请求示例
```http
POST /api/admin/tokens/batch-delete/
Authorization: Bearer <access_token>
Content-Type: application/json

{
    "token_ids": [1, 2, 3, 4]
}
```

##### 响应示例
```json
{
    "message": "批量撤销成功",
    "revoked_count": 4
}
```

#### 3.4 清理过期令牌

##### 接口信息
- **URL**: `POST /api/admin/tokens/cleanup-expired/`
- **权限**: 管理员
- **描述**: 清理所有过期令牌

##### 请求示例
```http
POST /api/admin/tokens/cleanup-expired/
Authorization: Bearer <access_token>
```

##### 响应示例
```json
{
    "message": "过期令牌清理完成",
    "deleted_count": 15
}
```

#### 3.5 清理已撤销令牌

##### 接口信息
- **URL**: `POST /api/admin/tokens/cleanup-revoked/`
- **权限**: 管理员
- **描述**: 物理删除所有已撤销的令牌记录

##### 功能说明
- **物理删除**: 与撤销操作不同，此操作会永久删除令牌记录
- **批量清理**: 一次性删除所有 `revoked=true` 的令牌
- **不可逆操作**: 删除后无法恢复，请谨慎使用
- **清理目的**: 减少数据库存储空间，清理历史记录

##### 请求示例
```http
POST /api/admin/tokens/cleanup-revoked/
Authorization: Bearer <access_token>
```

##### 响应示例
```json
{
    "message": "成功清理 23 个已撤销令牌",
    "deleted_count": 23
}
```

##### 错误响应
```json
{
    "error": "清理已撤销令牌失败: 数据库连接错误"
}
```

### 4. 积分管理接口

#### 积分记录管理说明

积分管理系统支持完整的CRUD操作，包括查看、编辑、删除积分使用记录。编辑积分记录时会自动同步以下数据：

##### 数据同步机制
1. **points_after字段**: 根据 `points_before - points_used` 自动重新计算
2. **用户积分余额**: 根据积分差值自动调整用户当前积分
3. **统计数据**: 实时更新总消耗、平均消耗等统计指标

##### 项目类型映射
- 积分记录中的 `project_category` 字段关联 `project_categories` 表
- 前端显示时自动映射为项目类别的 `name` 字段
- 支持按项目类型筛选积分记录

#### 4.1 获取积分记录列表

##### 接口信息
- **URL**: `GET /api/admin/points/records/`
- **权限**: 管理员
- **描述**: 获取积分使用记录列表（管理员视图，所有用户）

##### 查询参数
- `user_id`: 用户ID筛选
- `username`: 用户名筛选（模糊匹配）
- `project_category`: 项目分类ID
- `start_date`: 开始日期 (YYYY-MM-DD)
- `end_date`: 结束日期 (YYYY-MM-DD)
- `ordering`: 排序字段 (usage_time, points_used, -usage_time, -points_used)
- `page`: 页码
- `page_size`: 每页数量

##### 请求示例
```http
GET /api/admin/points/records/?username=alice&start_date=2025-08-01&page=1
Authorization: Bearer <access_token>
```

##### 响应示例
```json
{
    "count": 11,
    "next": null,
    "previous": null,
    "results": [
        {
            "id": 1,
            "user": {
                "id": 2,
                "username": "alice",
                "phone_number": "13800138001"
            },
            "user_username": "alice",
            "project_category": {
                "id": 1,
                "name": "ComfyUI",
                "code": "comfyui"
            },
            "usage_item_id": 123,
            "points_before": 1000,
            "points_after": 950,
            "points_used": 50,
            "usage_time": "2025-08-04T09:40:26Z",
            "description": "ComfyUI工作流生图"
        }
    ]
}
```

#### 4.2 获取积分统计信息

##### 接口信息
- **URL**: `GET /api/admin/points/statistics/`
- **权限**: 管理员
- **描述**: 获取积分统计信息

##### 请求示例
```http
GET /api/admin/points/statistics/
Authorization: Bearer <access_token>
```

##### 响应示例
```json
{
    "total_points_used": 250,
    "active_users_count": 2,
    "today_points_used": 10,
    "average_points_per_user": 22.73,
    "project_distribution": [
        {
            "project_category__name": "ComfyUI",
            "total_points": 200
        },
        {
            "project_category__name": "WebUI",
            "total_points": 50
        }
    ]
}
```

#### 4.3 批量调整用户积分

##### 接口信息
- **URL**: `POST /api/admin/points/adjust/`
- **权限**: 管理员
- **描述**: 批量调整用户积分

##### 请求示例
```http
POST /api/admin/points/adjust/
Authorization: Bearer <access_token>
Content-Type: application/json

{
    "usernames": "alice,bob,charlie",
    "points": 100,
    "description": "系统奖励积分"
}
```

##### 响应示例
```json
{
    "message": "积分调整成功",
    "success_count": 3,
    "failed_users": []
}
```

#### 4.4 获取积分记录详情

##### 接口信息
- **URL**: `GET /api/admin/points/records/{record_id}/`
- **权限**: 管理员
- **描述**: 获取指定积分记录的详细信息

##### 请求示例
```http
GET /api/admin/points/records/123/
Authorization: Bearer <access_token>
```

##### 响应示例
```json
{
    "id": 123,
    "user_id": 2,
    "user_username": "alice",
    "project_category": {
        "id": 1,
        "name": "ComfyUI工作流",
        "code": "comfyui"
    },
    "usage_item_id": "workflow_001",
    "points_before": 410,
    "points_after": 395,
    "points_used": 15,
    "usage_time": "2025-08-04T09:40:26Z",
    "description": "API测试创建的积分使用记录"
}
```

#### 4.5 更新积分记录

##### 接口信息
- **URL**: `PUT /api/admin/points/records/{record_id}/`
- **权限**: 管理员
- **描述**: 更新积分记录的消耗积分和描述，自动同步相关数据

##### 功能说明
- **自动计算**: 根据新的消耗积分自动重新计算 `points_after`
- **用户积分同步**: 根据积分差值自动调整用户当前积分余额
- **数据一致性**: 确保所有相关数据保持一致

##### 请求示例
```http
PUT /api/admin/points/records/123/
Authorization: Bearer <access_token>
Content-Type: application/json

{
    "points_used": 15,
    "description": "更新后的描述"
}
```

##### 响应示例
```json
{
    "message": "积分记录更新成功",
    "record": {
        "id": 123,
        "points_used": 15,
        "points_after": 395,
        "description": "更新后的描述",
        "user_current_points": 385
    }
}
```

##### 错误响应
```json
{
    "error": "消耗积分不能为负数"
}
```

#### 4.6 删除积分记录

##### 接口信息
- **URL**: `DELETE /api/admin/points/records/{record_id}/`
- **权限**: 管理员
- **描述**: 删除积分记录并恢复用户积分

##### 功能说明
- **积分恢复**: 删除记录时自动将消耗的积分返还给用户
- **数据清理**: 彻底删除积分使用记录
- **审计安全**: 建议谨慎使用，重要记录建议保留

##### 请求示例
```http
DELETE /api/admin/points/records/123/
Authorization: Bearer <access_token>
```

##### 响应示例
```json
{
    "message": "积分记录删除成功，用户积分已恢复",
    "restored_points": 15,
    "user_current_points": 400
}
```

##### 错误响应
```json
{
    "error": "积分记录不存在"
}
```

#### 4.7 积分趋势图表数据

##### 接口信息
- **URL**: `GET /api/admin/points/charts/trend/`
- **权限**: 管理员
- **描述**: 获取积分消耗趋势图表数据（最近30天）

##### 功能说明
- **时间范围**: 获取最近30天的积分消耗趋势
- **数据聚合**: 按日期分组统计每日积分消耗
- **完整日期**: 包含没有消耗记录的日期（显示为0）
- **图表友好**: 数据格式适合前端图表组件直接使用

##### 请求示例
```http
GET /api/admin/points/charts/trend/
Authorization: Bearer <access_token>
```

##### 响应示例
```json
{
    "labels": ["12/08", "12/09", "12/10", "12/11", "12/12", "12/13", "12/14"],
    "values": [0, 50, 30, 0, 75, 120, 25]
}
```

#### 4.8 项目类型分布图表数据

##### 接口信息
- **URL**: `GET /api/admin/points/charts/project-distribution/`
- **权限**: 管理员
- **描述**: 获取按项目类型的积分消耗分布数据

##### 功能说明
- **项目分类**: 按项目类别统计积分消耗
- **排序**: 按消耗积分从高到低排序
- **类别映射**: 正确显示项目类别名称
- **饼图数据**: 适合饼图或环形图显示

##### 请求示例
```http
GET /api/admin/points/charts/project-distribution/
Authorization: Bearer <access_token>
```

##### 响应示例
```json
{
    "labels": ["ComfyUI", "WebUI", "对话", "其他"],
    "values": [150, 75, 45, 20]
}
```

#### 4.9 积分记录导出功能

##### 功能说明
积分管理页面提供了完整的前端CSV导出功能，无需后端API支持。

##### 导出模式
1. **全部记录导出**: 导出当前页面加载的所有积分记录
2. **筛选结果导出**: 导出当前筛选条件下的记录
3. **批量选中导出**: 导出用户勾选的特定记录

##### 导出字段说明
| 字段名 | 说明 | 数据来源 |
|--------|------|----------|
| 用户名 | 积分使用者 | `user_username` 字段 |
| 消耗积分 | 本次消耗的积分数量 | `points_used` 字段 |
| 项目类型 | 项目类别名称 | `project_category_name` 字段 |
| 描述 | 积分使用描述 | `description` 字段 |
| 使用时间 | 积分使用时间 | `usage_time` 字段（格式化） |

##### 文件命名规则
```javascript
// 全部记录
`积分记录_${YYYY-MM-DD}.csv`

// 筛选结果
`积分记录_筛选结果_${YYYY-MM-DD}.csv`

// 批量选中
`积分记录_选中_${YYYY-MM-DD}.csv`
```

##### 技术实现
- **编码格式**: UTF-8 with BOM（解决中文乱码）
- **数据处理**: 前端JavaScript实现
- **下载方式**: Blob API + 临时链接
- **项目类型映射**: 正确显示中文名称而非ID

##### 导出示例
```csv
用户名,消耗积分,项目类型,描述,使用时间
"alice",10,"ComfyUI","API测试创建的积分使用记录","2025/7/25 11:49:30"
"admin",50,"ComfyUI","ComfyUI工作流生图","2025/7/25 10:35:44"
"admin",30,"WebUI","WebUI生图","2025/7/25 10:35:44"
"alice",20,"对话","AI对话服务","2025/7/25 10:35:44"
```

##### 筛选支持
- **用户筛选**: 按用户名模糊搜索
- **项目类型筛选**: 按项目类别精确筛选
- **日期范围筛选**: 今天、本周、本月、本季度
- **复合筛选**: 支持多条件组合筛选

### 5. 生图记录管理接口

#### 5.1 获取生图记录列表

##### 接口信息
- **URL**: `GET /api/admin/generations/`
- **权限**: 管理员
- **描述**: 获取生图记录列表，支持按用户、时间、项目类型筛选

##### 查询参数
- `user_id`: 用户ID筛选
- `user`: 用户名筛选（模糊匹配）
- `project`: 项目类型筛选 (comfyui, webui)
- `time_range`: 时间范围 (today, week, month)
- `created_after`: 创建时间起始 (YYYY-MM-DD)
- `created_before`: 创建时间结束 (YYYY-MM-DD)
- `ordering`: 排序字段 (created_at, -created_at)
- `page`: 页码
- `page_size`: 每页数量

##### 请求示例
```http
GET /api/admin/generations/?user=alice&project=webui&time_range=week&page=1
Authorization: Bearer <access_token>
```

##### 响应示例
```json
{
    "count": 3,
    "next": null,
    "previous": null,
    "results": [
        {
            "id": 1,
            "user_id": 1,
            "user": {
                "id": 1,
                "username": "admin",
                "phone_number": "13800138000"
            },
            "username": "admin",
            "project_type": "webui",
            "prompt": "a beautiful landscape",
            "params": {
                "width": 512,
                "height": 512,
                "steps": 20
            },
            "image_urls": [
                "https://example.com/image1.jpg",
                "https://example.com/image2.jpg"
            ],
            "is_public": false,
            "created_at": "2025-07-24T18:03:35Z"
        }
    ]
}
```

#### 5.2 获取生图记录详情

##### 接口信息
- **URL**: `GET /api/admin/generations/{id}/`
- **权限**: 管理员
- **描述**: 获取生图记录详细信息

##### 请求示例
```http
GET /api/admin/generations/123/
Authorization: Bearer <access_token>
```

##### 响应示例
```json
{
    "id": 123,
    "user_id": 1,
    "username": "admin",
    "project_type": "webui",
    "prompt": "a beautiful landscape with mountains and rivers",
    "params": {
        "width": 512,
        "height": 512,
        "steps": 20,
        "cfg_scale": 7.5,
        "sampler": "DPM++ 2M Karras"
    },
    "image_urls": [
        "https://example.com/image1.jpg",
        "https://example.com/image2.jpg"
    ],
    "source_config_id": 456,
    "is_public": false,
    "visible_from": null,
    "visible_to": null,
    "created_at": "2025-07-24T18:03:35Z"
}
```

#### 5.3 删除生图记录

##### 接口信息
- **URL**: `DELETE /api/admin/generations/{id}/`
- **权限**: 管理员
- **描述**: 删除指定生图记录

##### 请求示例
```http
DELETE /api/admin/generations/123/
Authorization: Bearer <access_token>
```

##### 响应示例
```json
{
    "message": "生图记录删除成功"
}
```

#### 5.4 编辑生图记录

##### 接口信息
- **URL**: `PUT /api/admin/generations/{id}/`
- **权限**: 管理员
- **描述**: 编辑生图记录信息，包括积分消耗

##### 功能特性
- **基本信息编辑**: 支持修改提示词、参数、图片URL、公开状态
- **项目分类修改**: 支持更改项目分类
- **积分消耗编辑**: 支持修改消耗积分，自动同步用户积分余额
- **积分记录管理**: 自动创建或更新关联的积分使用记录
- **数据一致性**: 确保生图记录和积分记录数据一致

##### 请求示例
```http
PUT /api/admin/generations/123/
Authorization: Bearer <access_token>
Content-Type: application/json

{
    "prompt": "更新后的提示词",
    "params": {
        "width": 768,
        "height": 768,
        "steps": 30
    },
    "image_urls": [
        "https://example.com/new-image1.jpg",
        "https://example.com/new-image2.jpg"
    ],
    "is_public": true,
    "project_category_id": 2,
    "points_used": 75
}
```

##### 响应示例
```json
{
    "message": "生图记录更新成功",
    "generation": {
        "id": "123",
        "project_category_id": 2,
        "prompt": "更新后的提示词",
        "params": {
            "width": 768,
            "height": 768,
            "steps": 30
        },
        "image_urls": [
            "https://example.com/new-image1.jpg",
            "https://example.com/new-image2.jpg"
        ],
        "thumbnail_url": "https://example.com/new-image1.jpg",
        "is_public": true,
        "points_used": 75
    }
}
```

##### 积分处理说明
- **更新现有记录**: 如果已有积分记录，更新消耗积分并调整用户余额
- **创建新记录**: 如果没有积分记录且积分>0，创建新的积分使用记录
- **用户积分同步**: 根据积分差值自动调整用户当前积分
- **数据完整性**: 确保积分记录的`points_before`和`points_after`字段正确

#### 5.5 批量删除生图记录

##### 接口信息
- **URL**: `POST /api/admin/generations/batch-delete/`
- **权限**: 管理员
- **描述**: 批量删除生图记录

##### 请求示例
```http
POST /api/admin/generations/batch-delete/
Authorization: Bearer <access_token>
Content-Type: application/json

{
    "record_ids": [1, 2, 3, 4]
}
```

##### 响应示例
```json
{
    "message": "批量删除成功",
    "deleted_count": 4
}
```

---

## ID使用最佳实践

### 🎯 随机ID特性说明

由于系统已实现随机ID生成，开发者在使用API时需要注意以下要点：

#### ✅ 正确的使用方式
```javascript
// ✅ 正确：通过API获取ID
const response = await fetch('/api/auth/users/', {
    headers: { 'Authorization': `Bearer ${token}` }
});
const users = await response.json();
users.results.forEach(user => {
    console.log(`用户ID: ${user.id}`); // 如：4115361349489737397
});

// ✅ 正确：使用ID进行API调用
const userId = 4115361349489737397;
const userDetail = await fetch(`/api/admin/users/${userId}/`);

// ✅ 正确：ID作为唯一标识符使用
const userMap = new Map();
users.forEach(user => userMap.set(user.id, user));
```

#### ❌ 错误的使用方式
```javascript
// ❌ 错误：不要依赖ID的顺序性
const users = await getUsers();
users.sort((a, b) => a.id - b.id); // ID不再按时间排序！

// ❌ 错误：不要通过ID推测信息
const userId = 1000001;
console.log("这是第1000001个用户"); // 错误！ID是随机的

// ❌ 错误：不要尝试遍历ID
for (let id = 1; id <= 1000000; id++) {
    await fetch(`/api/admin/users/${id}/`); // 无效！ID不连续
}

// ❌ 错误：不要基于ID大小判断创建时间
if (userA.id > userB.id) {
    console.log("用户A比用户B注册得晚"); // 错误！ID随机
}
```

### 📊 API响应中的ID字段

#### 用户相关ID
```json
{
    "id": 4115361349489737397,           // 用户ID（随机）
    "username": "testuser",
    "created_at": "2025-08-05T12:30:00Z" // 使用时间字段判断顺序
}
```

#### 配置相关ID
```json
{
    "id": 6416157825986189457,           // 配置ID（随机）
    "owner_id": 4115361349489737397,     // 拥有者ID（随机）
    "project_category_id": 2164238018644507186, // 项目分类ID（随机）
    "name": "我的配置"
}
```

#### 生图记录ID
```json
{
    "id": 5507272166823098638,           // 生图记录ID（随机）
    "owner_id": 4115361349489737397,     // 拥有者ID（随机）
    "source_config_id": 6416157825986189457, // 配置ID（随机）
    "created_at": "2025-08-05T12:35:00Z"
}
```

### 🔍 查询和筛选建议

#### 推荐的查询方式
```javascript
// ✅ 使用时间字段排序
const users = await fetch('/api/auth/users/?ordering=-created_at');

// ✅ 使用筛选参数
const recentUsers = await fetch('/api/auth/users/?created_at__gte=2025-08-01');

// ✅ 使用搜索功能
const searchUsers = await fetch('/api/auth/users/?search=username');

// ✅ 使用分页
const page2 = await fetch('/api/auth/users/?page=2');
```

#### 外键关联查询
```javascript
// ✅ 通过外键ID查询关联数据
const configId = 6416157825986189457;
const generations = await fetch(`/api/admin/generations/?source_config_id=${configId}`);

// ✅ 使用用户ID查询其配置
const userId = 4115361349489737397;
const userConfigs = await fetch(`/api/admin/configs/?owner_id=${userId}`);
```

### ⚠️ 重要提醒

1. **ID仅作为唯一标识符**: 不要从ID中推测任何业务信息
2. **使用时间字段排序**: 需要按时间排序时使用`created_at`等时间字段
3. **ID类型为数字**: 虽然是随机生成，但仍为BIGINT类型
4. **外键关系正常**: 所有表间的关联关系完全正常
5. **API接口不变**: 所有接口的使用方式保持一致

---

## 错误码说明

### HTTP状态码

| 状态码 | 说明 | 示例场景 |
|--------|------|----------|
| 200 | 请求成功 | 获取数据成功 |
| 201 | 创建成功 | 用户注册、创建记录 |
| 400 | 请求参数错误 | 数据验证失败 |
| 401 | 未认证 | Token无效或过期 |
| 403 | 权限不足 | 非管理员访问管理接口 |
| 404 | 资源不存在 | 请求的数据不存在 |
| 500 | 服务器内部错误 | 系统异常 |

### 业务错误码

#### 用户认证相关
- `USER_NOT_FOUND`: 用户不存在
- `INVALID_PASSWORD`: 密码错误
- `TOKEN_EXPIRED`: Token已过期
- `TOKEN_INVALID`: Token无效
- `PERMISSION_DENIED`: 权限不足

#### 积分系统相关
- `INSUFFICIENT_POINTS`: 积分不足
- `INVALID_PROJECT_CATEGORY`: 项目分类不存在
- `POINTS_MUST_POSITIVE`: 积分必须大于0

#### 数据验证相关
- `FIELD_REQUIRED`: 必填字段缺失
- `FIELD_INVALID`: 字段格式错误
- `DUPLICATE_VALUE`: 值重复（如用户名、手机号）

---

## 未完成接口说明

### 1. 管理后台接口（部分已实现）
**状态**: 部分实现 ✅
**说明**: 核心管理后台接口已实现，包括仪表盘、用户管理、令牌管理、积分管理、生图记录管理

**已实现接口** ✅:

#### 1.1 仪表盘统计接口 ✅
- `GET /api/admin/dashboard/stats/` - 获取仪表盘统计数据 ✅
- `GET /api/admin/dashboard/charts/user-growth/` - 用户增长趋势数据 ✅
- `GET /api/admin/dashboard/charts/points-distribution/` - 积分分布图表数据 ✅
- `GET /api/admin/dashboard/recent-activities/` - 最近活动列表 ✅

#### 1.2 用户管理接口 ✅
- `GET /api/admin/users/` - 用户管理列表（支持搜索、筛选、分页）✅
- `PUT /api/admin/users/{id}/` - 编辑用户信息（支持状态切换、完整字段编辑）✅

#### 1.3 令牌管理接口 ✅
- `GET /api/admin/tokens/` - 令牌列表（支持按用户、类型、撤销状态筛选，分页显示）✅
- `DELETE /api/admin/tokens/{id}/` - 撤销单个令牌（软删除机制）✅
- `POST /api/admin/tokens/batch-delete/` - 批量撤销令牌 ✅
- `POST /api/admin/tokens/cleanup-expired/` - 清理过期令牌 ✅
- `POST /api/admin/tokens/cleanup-revoked/` - 清理已撤销令牌（物理删除）✅

#### 1.4 积分管理接口 ✅
- `GET /api/admin/points/records/` - 积分流水记录（管理员视图，所有用户）✅
- `GET /api/admin/points/statistics/` - 积分统计信息 ✅
- `GET /api/admin/points/charts/trend/` - 积分消耗趋势图表数据 ✅
- `GET /api/admin/points/charts/project-distribution/` - 项目类型分布图表数据 ✅
- `POST /api/admin/points/adjust/` - 批量调整用户积分 ✅
- `GET /api/admin/points/records/{id}/` - 获取积分记录详情 ✅
- `PUT /api/admin/points/records/{id}/` - 更新积分记录（自动同步用户积分）✅
- `DELETE /api/admin/points/records/{id}/` - 删除积分记录（恢复用户积分）✅
- **前端导出功能** - CSV格式导出积分记录（支持全部/筛选/批量导出）✅

#### 1.5 生图记录管理接口 ✅
- `GET /api/admin/generations/` - 生图记录列表（支持按用户、时间、项目类型筛选，包含积分信息）✅
- `GET /api/admin/generations/{id}/` - 获取生图记录详情（包含积分信息）✅
- `PUT /api/admin/generations/{id}/` - 编辑生图记录（支持积分修改和同步）✅
- `DELETE /api/admin/generations/{id}/` - 删除生图记录 ✅
- `POST /api/admin/generations/batch-delete/` - 批量删除生图记录 ✅

**待实现接口**:

#### 1.6 用户管理扩展接口
- `GET /api/admin/users/{id}/` - 获取用户详细信息
- `POST /api/admin/users/{id}/toggle-status/` - 启用/禁用用户（已通过编辑接口实现）
- `POST /api/admin/users/{id}/kick-offline/` - 踢用户下线（撤销所有token）
- `POST /api/admin/users/{id}/adjust-points/` - 调整用户积分

#### 1.7 令牌管理扩展接口
- `GET /api/admin/tokens/cleanup-task/status/` - 获取定时清理任务状态
- `POST /api/admin/tokens/cleanup-task/toggle/` - 开启/关闭定时清理任务

#### 1.8 使用情况分析接口
- `GET /api/admin/usage/overview/` - 使用情况概览
- `GET /api/admin/usage/by-project/` - 按项目类型统计使用情况
- `GET /api/admin/usage/user-preferences/` - 用户偏好分析
- `GET /api/admin/usage/popular-configs/` - 热门配置排行

#### 1.9 生图记录扩展接口
- `GET /api/admin/generations/export/` - 导出生图记录数据

### 2. 密码管理接口
**状态**: 部分实现
**说明**: 用户密码修改和重置功能

**需要实现的接口**:
- `POST /api/auth/password/change/` - 修改密码（需要登录）
  - 请求体：`{"old_password": "旧密码", "new_password": "新密码", "new_password_confirm": "确认新密码"}`
  - 响应：`{"message": "密码修改成功"}`
- `POST /api/auth/password/reset/` - 发送重置邮件
- `POST /api/auth/password/reset/confirm/` - 确认重置密码

### 4. 文件上传接口
**状态**: 未实现
**说明**: 头像上传等文件处理功能

**计划接口**:
- `POST /api/upload/avatar/` - 头像上传
- `POST /api/upload/files/` - 通用文件上传

### 5. 通知系统接口
**状态**: 未实现
**说明**: 用户通知、系统消息功能

**计划接口**:
- `GET /api/notifications/` - 获取通知列表
- `PUT /api/notifications/{id}/read/` - 标记通知已读

### 6. 数据导出接口
**状态**: 部分实现
**说明**: 前端实现的CSV数据导出功能

#### 6.1 积分记录导出 ✅

##### 功能说明
积分管理页面提供了完整的CSV导出功能，支持全部记录导出和筛选结果导出。

##### 导出功能特性
- **全部记录导出**: 导出所有积分使用记录
- **筛选结果导出**: 导出当前筛选条件下的记录
- **项目类型映射**: 正确显示项目类别名称（ComfyUI、WebUI、对话等）
- **中文支持**: 添加BOM头解决中文乱码问题
- **智能文件名**: 根据筛选状态自动生成文件名

##### 导出字段
```csv
用户名,消耗积分,项目类型,描述,使用时间
"alice",10,"ComfyUI","API测试创建的积分使用记录","2025/7/25 11:49:30"
"admin",50,"ComfyUI","ComfyUI工作流生图","2025/7/25 10:35:44"
"admin",30,"WebUI","WebUI生图","2025/7/25 10:35:44"
"alice",20,"对话","AI对话服务","2025/7/25 10:35:44"
```

##### 文件命名规则
- **全部记录**: `积分记录_YYYY-MM-DD.csv`
- **筛选结果**: `积分记录_筛选结果_YYYY-MM-DD.csv`
- **批量导出**: `积分记录_选中_YYYY-MM-DD.csv`

##### 实现方式
- **前端实现**: 使用JavaScript Blob API生成CSV文件
- **数据来源**: 基于已加载的积分记录数据
- **筛选支持**: 支持用户名、项目类型、日期范围筛选
- **编码处理**: UTF-8编码，添加BOM头防止乱码

#### 6.2 批量操作导出 ✅

##### 功能说明
支持选中特定记录进行批量导出，提供精确的数据导出控制。

##### 操作流程
1. 在积分记录列表中勾选需要导出的记录
2. 点击"批量导出"按钮
3. 自动生成包含选中记录的CSV文件
4. 文件名自动添加"_选中"标识

**未实现接口**:
- `GET /api/export/users/` - 导出用户数据
- `GET /api/export/generations/` - 导出生图记录

### 7. 积分充值接口
**状态**: 未实现
**说明**: 积分充值、购买功能

**计划接口**:
- `POST /api/points/recharge/` - 积分充值
- `GET /api/points/packages/` - 积分套餐列表

---

## 开发和测试说明

### 测试账号
- **管理员**: username: `admin`, password: `admin123`
- **普通用户**: username: `alice`, password: `alice123`
- **其他用户**: username: `bob`, password: `user123`

### 密码安全说明
- **密码格式**: 所有用户密码已更新为Django标准PBKDF2格式
- **安全性**: 使用SHA256算法进行密码哈希
- **验证机制**: 只接受PBKDF2格式密码，拒绝其他格式
- **更新时间**: 2025-08-06 - 密码安全性全面升级

### 测试工具
- **自动化测试**: `python comprehensive_api_test.py`
- **单独测试**: 各种 `test_*.py` 文件
- **API文档**: 本文档

### 注意事项
1. 所有时间字段使用ISO 8601格式
2. 分页默认每页20条记录
3. Token有效期：Access Token 30分钟，Refresh Token 24小时
4. 积分系统支持事务安全
5. 管理员权限通过 `system_role` 字段判断

---

**文档更新时间**: 2025-08-06
**API版本**: v1.0
**维护者**: 开发团队

## 🎉 管理后台系统修复完成总结

### 修复的核心问题

#### 1. 用户编辑状态功能 ✅
- **问题**: 用户状态字段缺失，编辑功能不完整
- **解决**: 添加用户状态字段到编辑表单和后端序列化器
- **结果**: 支持活跃/非活跃状态切换，数据实时更新

#### 2. 令牌管理批量清理功能 ✅
- **问题**: URL路由冲突导致405错误
- **解决**: 调整URL路由顺序，具体路径优先于通用路径
- **结果**: 清理过期和已撤销令牌功能完全正常

#### 3. 积分管理图表数据 ✅
- **问题**: 图表显示假数据，缺少真实API
- **解决**: 新增趋势图表和分布图表API，修复前端调用
- **结果**: 图表显示真实数据库数据，统计信息准确

#### 4. 生图记录积分修改功能 ✅
- **问题**: 积分数据显示和编辑功能缺失
- **解决**: 实现积分数据关联查询和编辑同步机制
- **结果**: 支持积分修改，自动同步用户积分余额

### 技术修复要点

#### 后端修复
- **URL路由优化**: 解决路径匹配冲突问题
- **API字段补全**: 添加缺失的序列化器字段
- **数据关联修复**: 正确处理模型间的关联关系
- **新增API端点**: 提供图表数据和积分处理接口

#### 前端修复
- **API调用修复**: 修正错误的API调用方式
- **数据绑定修复**: 解决表单数据绑定问题
- **状态管理优化**: 改善数据刷新和状态更新

#### 数据库设计理解
- **用户状态管理**: 通过`is_active`字段控制
- **积分系统设计**: `Generation`通过`PointUsageRecord`关联积分
- **项目分类系统**: 通过`ProjectCategory`管理类型

### 系统功能现状

现在整个管理后台系统的核心功能完全正常：
- ✅ **用户管理**: 完整的用户信息编辑和状态管理
- ✅ **令牌管理**: 完善的令牌撤销和清理机制
- ✅ **积分管理**: 真实数据图表和完整的记录管理
- ✅ **生图记录**: 支持积分编辑的完整记录管理

所有功能都经过实际测试验证，确保在生产环境中稳定运行。

---

**文档更新时间**: 2025-08-11
**API版本**: v1.1
**维护者**: 开发团队