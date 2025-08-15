<script setup>
import { ref, onMounted, onUnmounted, inject } from 'vue'
import { useRouter } from 'vue-router'
import authModule from '../utils/auth.js'
import { userService } from '../services/userService.js'

const { authUtils } = authModule

// Router
const router = useRouter()

// Inject theme from parent
const currentTheme = inject('theme', ref('light'))

// 页面状态
const isLoading = ref(false)
const isSaving = ref(false)
const showPhoneVerification = ref(false)
const verificationCode = ref('')
const newPhoneNumber = ref('')
const isVerifyingPhone = ref(false)
const isSendingCode = ref(false)
const countdown = ref(0)
const countdownTimer = ref(null)

// 用户信息
const userProfile = ref({
  username: '',
  phone_number: '',
  gender: '',
  job_title: '',
  introduction: '',
  avatar_url: '',
  created_at: '',
  updated_at: '',
  points: 0
})

// 表单数据
const formData = ref({
  username: '',
  gender: '',
  job_title: '',
  introduction: '',
  avatar_url: ''
})

// 性别选项
const genderOptions = [
  { value: 'male', label: '男' },
  { value: 'female', label: '女' },
  { value: 'other', label: '其他' }
]

// Logo URL - 使用SoDesign.AI自己的logo
const logoUrl = ref('https://s3.20250131.xyz/gh/usst-502s/welcome/2025/7/1753009569174-861.png')

// 文件上传相关
const fileInput = ref(null)
const isUploading = ref(false)

// 获取用户资料
const fetchUserProfile = async () => {
  isLoading.value = true
  try {
    const data = await userService.getProfile()
    userProfile.value = data
    // 初始化表单数据
    formData.value = {
      username: data.username || '',
      gender: data.gender || '',
      job_title: data.job_title || '',
      introduction: data.introduction || '',
      avatar_url: data.avatar_url || ''
    }
  } catch (error) {
    console.error('获取用户资料失败:', error)

    // 如果API调用失败，尝试使用localStorage中的用户信息作为fallback
    const localUserInfo = authUtils.getCurrentUser()
    if (localUserInfo) {
      console.log('使用本地用户信息作为fallback:', localUserInfo)
      userProfile.value = localUserInfo
      formData.value = {
        username: localUserInfo.username || '',
        gender: localUserInfo.gender || '',
        job_title: localUserInfo.job_title || '',
        introduction: localUserInfo.introduction || '',
        avatar_url: localUserInfo.avatar_url || ''
      }
    } else {
      alert('获取用户资料失败：' + error.message)
    }
  } finally {
    isLoading.value = false
  }
}

// 保存用户资料
const saveProfile = async () => {
  isSaving.value = true
  try {
    const data = await userService.updateProfile(formData.value)
    userProfile.value = data.user
    
    // 更新本地存储的用户信息
    authUtils.saveUserInfo(data.user)
    
    alert('用户资料更新成功！')
  } catch (error) {
    console.error('保存用户资料失败:', error)
    alert('更新失败：' + error.message)
  } finally {
    isSaving.value = false
  }
}

// 显示电话验证
const showPhoneVerificationModal = () => {
  showPhoneVerification.value = true
  newPhoneNumber.value = ''
  verificationCode.value = ''
  clearCountdown() // 清除之前的倒计时
}

// 关闭电话验证模态框
const closePhoneVerificationModal = () => {
  showPhoneVerification.value = false
  clearCountdown() // 清除倒计时
}

// 发送验证码
const sendVerificationCode = async () => {
  if (!newPhoneNumber.value) {
    alert('请输入新手机号')
    return
  }

  // 简单的手机号格式验证
  const phoneRegex = /^1[3-9]\d{9}$/
  if (!phoneRegex.test(newPhoneNumber.value)) {
    alert('请输入正确的手机号格式')
    return
  }

  isSendingCode.value = true
  try {
    await userService.sendSmsCode(newPhoneNumber.value)
    alert('验证码已发送，请查收短信')

    // 开始倒计时
    startCountdown()
  } catch (error) {
    console.error('发送验证码失败:', error)
    alert('发送失败：' + error.message)
  } finally {
    isSendingCode.value = false
  }
}

// 验证并更新电话
const verifyAndUpdatePhone = async () => {
  if (!verificationCode.value) {
    alert('请输入验证码')
    return
  }

  isVerifyingPhone.value = true
  try {
    // 验证短信验证码
    await userService.verifySmsCode(newPhoneNumber.value, verificationCode.value)
    
    // 验证成功后，更新用户资料中的电话号码
    const updatedData = {
      ...formData.value,
      phone_number: newPhoneNumber.value
    }
    
    const result = await userService.updateProfile(updatedData)
    userProfile.value = result.user
    formData.value.phone_number = result.user.phone_number
    
    // 更新本地存储的用户信息
    authUtils.saveUserInfo(result.user)
    
    alert('电话号码修改成功！')
    showPhoneVerification.value = false
  } catch (error) {
    console.error('验证电话失败:', error)
    alert('验证失败：' + error.message)
  } finally {
    isVerifyingPhone.value = false
  }
}

// 开始倒计时
const startCountdown = () => {
  countdown.value = 60 // 60秒倒计时

  countdownTimer.value = setInterval(() => {
    countdown.value--

    if (countdown.value <= 0) {
      clearInterval(countdownTimer.value)
      countdownTimer.value = null
    }
  }, 1000)
}

// 清除倒计时
const clearCountdown = () => {
  if (countdownTimer.value) {
    clearInterval(countdownTimer.value)
    countdownTimer.value = null
  }
  countdown.value = 0
}

// 格式化时间
const formatDate = (dateString) => {
  if (!dateString) return '未知'
  return new Date(dateString).toLocaleString('zh-CN')
}

// 头像上传相关方法
const triggerFileUpload = () => {
  fileInput.value?.click()
}

const handleFileUpload = async (event) => {
  const file = event.target.files?.[0]
  if (!file) return

  // 检查文件类型
  if (!file.type.startsWith('image/')) {
    alert('请选择图片文件')
    return
  }

  // 检查文件大小 (5MB)
  if (file.size > 5 * 1024 * 1024) {
    alert('图片大小不能超过5MB')
    return
  }

  isUploading.value = true

  try {
    // 创建FormData
    const uploadFormData = new FormData()
    uploadFormData.append('file', file)

    // 上传到指定的API
    const response = await fetch('https://store.20250131.xyz/', {
      method: 'POST',
      body: uploadFormData
    })

    if (!response.ok) {
      throw new Error(`上传失败: ${response.status}`)
    }

    const result = await response.json()

    if (result.success && result.url) {
      // 更新头像URL
      formData.value.avatar_url = result.url

      // 立即更新数据库
      try {
        await userService.updateProfile({ avatar_url: result.url })
        // 同时更新本地用户信息
        userProfile.value.avatar_url = result.url
        const currentUser = authUtils.getCurrentUser()
        if (currentUser) {
          currentUser.avatar_url = result.url
          authUtils.saveUserInfo(currentUser)
        }
        alert('头像上传并保存成功！')
      } catch (updateError) {
        console.error('保存头像到数据库失败:', updateError)
        alert('头像上传成功，但保存到数据库失败：' + updateError.message)
      }
    } else {
      throw new Error('上传响应格式错误')
    }
  } catch (error) {
    console.error('头像上传失败:', error)
    alert('头像上传失败：' + error.message)
  } finally {
    isUploading.value = false
    // 清空文件输入
    if (fileInput.value) {
      fileInput.value.value = ''
    }
  }
}

// 页面加载时获取用户资料
onMounted(() => {
  // 设置页面标题
  document.title = '编辑个人信息 - SoDesign.AI'
  
  // 检查认证状态
  if (!authUtils.isAuthenticated()) {
    router.push('/')
    return
  }
  
  fetchUserProfile()
})

// 组件销毁时清除倒计时
onUnmounted(() => {
  clearCountdown()
})
</script>

<template>
  <div class="profile-page">
    <!-- 背景图片 -->
    <div class="profile-background"></div>

    <!-- 主要内容容器 -->
    <div class="profile-container">
      <!-- 页面头部 -->
      <div class="profile-header">
        <h1>编辑个人信息</h1>
      </div>

      <!-- 主要内容 -->
      <div class="profile-content">
        <div v-if="isLoading" class="loading-container">
          <p>加载中...</p>
        </div>

        <div v-else class="profile-form-container">
          <form @submit.prevent="saveProfile" class="profile-form">
            <!-- 顶部用户信息卡片 -->
            <div class="user-info-card">
              <div class="user-avatar-section">
                <div class="avatar-container" @click="triggerFileUpload">
                  <img
                    :src="formData.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.username || 'User')}&background=ffc107&color=000&size=120&rounded=true`"
                    :alt="formData.username"
                    class="user-avatar"
                  />
                  <div class="avatar-edit-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                      <path d="m18.5 2.5 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                  </div>
                </div>
                <input
                  ref="fileInput"
                  type="file"
                  accept="image/*"
                  @change="handleFileUpload"
                  style="display: none;"
                />
              </div>
              <div class="user-basic-info">
                <div class="user-name-section">
                  <h2 class="user-name">{{ formData.username || '未设置' }}</h2>
                  <span class="user-points">积分 {{ userProfile.points || 0 }}</span>
                </div>
                <div class="user-job-title" v-if="formData.job_title">
                  {{ formData.job_title }}
                </div>
                <div class="user-introduction" v-if="formData.introduction">
                  {{ formData.introduction }}
                </div>
              </div>
            </div>

            <!-- 基本信息 -->
            <div class="form-section">
              <h3>基本信息</h3>
              <div class="form-grid">
                <div class="form-group">
                  <label for="username">姓名：</label>
                  <input
                    id="username"
                    v-model="formData.username"
                    type="text"
                    required
                    class="form-input"
                  />
                </div>

                <div class="form-group">
                  <label for="gender">性别：</label>
                  <select id="gender" v-model="formData.gender" class="form-input">
                    <option value="">请选择</option>
                    <option 
                      v-for="option in genderOptions" 
                      :key="option.value" 
                      :value="option.value"
                    >
                      {{ option.label }}
                    </option>
                  </select>
                </div>

                <div class="form-group">
                  <label for="job_title">职位：</label>
                  <input
                    id="job_title"
                    v-model="formData.job_title"
                    type="text"
                    placeholder="请输入职位"
                    class="form-input"
                  />
                </div>

                <div class="form-group phone-group">
                  <label for="phone_number">电话：</label>
                  <div class="phone-input-group">
                    <input
                      id="phone_number"
                      :value="userProfile.phone_number"
                      type="tel"
                      readonly
                      class="form-input phone-readonly"
                    />
                    <button 
                      type="button" 
                      @click="showPhoneVerificationModal"
                      class="btn btn-secondary btn-small"
                    >
                      修改
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- 个人介绍 -->
            <div class="form-section">
              <h3>个人介绍</h3>
              <div class="form-group">
                <textarea
                  v-model="formData.introduction"
                  placeholder="请输入个人介绍"
                  rows="4"
                  class="form-textarea"
                ></textarea>
              </div>
            </div>

            <!-- 固定信息 -->
            <div class="form-section">
              <h3>账户信息</h3>
              <div class="info-grid">
                <div class="info-item">
                  <label>创建时间：</label>
                  <span>{{ formatDate(userProfile.created_at) }}</span>
                </div>
                <div class="info-item">
                  <label>最后登录：</label>
                  <span>{{ formatDate(userProfile.updated_at) }}</span>
                </div>
              </div>
            </div>

            <!-- 操作按钮 -->
            <div class="form-actions">
              <button 
                type="button" 
                @click="router.push('/')"
                class="btn btn-secondary"
              >
                返回首页
              </button>
              <button 
                type="submit" 
                :disabled="isSaving"
                class="btn btn-primary"
              >
                {{ isSaving ? '保存中...' : '保存更改' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- 电话验证模态框 -->
    <div v-if="showPhoneVerification" class="modal-overlay" @click.self="closePhoneVerificationModal">
      <div class="modal-content">
        <div class="modal-header">
          <h3>修改电话号码</h3>
          <button @click="closePhoneVerificationModal" class="modal-close">&times;</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label for="new_phone">新手机号：</label>
            <input
              id="new_phone"
              v-model="newPhoneNumber"
              type="tel"
              placeholder="请输入新手机号"
              class="form-input"
            />
          </div>
          <div class="form-group">
            <label for="verification_code">验证码：</label>
            <div class="verification-input-group">
              <input
                id="verification_code"
                v-model="verificationCode"
                type="text"
                placeholder="请输入验证码"
                class="form-input"
              />
              <button
                type="button"
                @click="sendVerificationCode"
                :disabled="isSendingCode || countdown > 0"
                class="btn btn-secondary btn-small"
              >
                {{
                  isSendingCode ? '发送中...' :
                  countdown > 0 ? `${countdown}秒后重试` :
                  '发送验证码'
                }}
              </button>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button
            @click="closePhoneVerificationModal"
            class="btn btn-secondary"
          >
            取消
          </button>
          <button 
            @click="verifyAndUpdatePhone"
            :disabled="isVerifyingPhone"
            class="btn btn-primary"
          >
            {{ isVerifyingPhone ? '验证中...' : '确认修改' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.profile-page {
  position: relative;
  min-height: 100vh;
  overflow: hidden;
}

/* 背景图片 */
.profile-background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: url('https://s3.20250131.xyz/gh/usst-502s/welcome/2025/7/1753016719127-693.png');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  z-index: -1;
}

/* 主要内容容器 */
.profile-container {
  position: relative;
  min-height: 100vh;
  padding-top: 80px;
  z-index: 1;
}

/* 页面头部 */
.profile-header {
  text-align: center;
  padding: 3rem 0 2rem;
  margin-bottom: 2rem;
}

.profile-header h1 {
  color: #333;
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0;
  text-shadow: 0 2px 4px rgba(255, 255, 255, 0.8);
}

/* 内容区域 */
.profile-content {
  padding: 0 2rem 2rem;
  max-width: 800px;
  margin: 0 auto;
}

.loading-container {
  text-align: center;
  color: white;
  padding: 3rem 0;
  font-size: 1.2rem;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-top: 4px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 表单容器 */
.profile-form-container {
  background: rgba(255, 255, 255, 0.4);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 24px;
  padding: 3rem;
  max-width: 1000px;
  margin: 0 auto;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

/* 用户信息卡片 */
.user-info-card {
  display: flex;
  align-items: center;
  gap: 2rem;
  background: rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(15px);
  -webkit-backdrop-filter: blur(15px);
  border-radius: 16px;
  padding: 2rem;
  margin-bottom: 2rem;
  border: 1px solid rgba(255, 255, 255, 0.4);
}

.user-avatar-section {
  position: relative;
}

.avatar-container {
  position: relative;
  cursor: pointer;
  transition: transform 0.3s ease;
}

.avatar-container:hover {
  transform: scale(1.05);
}

.user-avatar {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid rgba(255, 255, 255, 0.5);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.avatar-edit-icon {
  position: absolute;
  bottom: 8px;
  right: 8px;
  background: rgba(255, 193, 7, 0.9);
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #333;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
}

.avatar-edit-icon:hover {
  background: rgba(255, 193, 7, 1);
  transform: scale(1.1);
}

.user-basic-info {
  flex: 1;
}

.user-name-section {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.user-name {
  font-size: 2rem;
  font-weight: 700;
  color: #333;
  margin: 0;
  text-shadow: 0 2px 4px rgba(255, 255, 255, 0.8);
}

.user-points {
  font-size: 1.2rem;
  font-weight: 600;
  color: #ff6b35;
  background: rgba(255, 107, 53, 0.15);
  padding: 0.3rem 0.8rem;
  border-radius: 20px;
  border: 1px solid rgba(255, 107, 53, 0.3);
  min-width: 60px;
  text-align: center;
}

.user-job-title {
  font-size: 1rem;
  color: #666;
  font-weight: 500;
  margin-top: 0.5rem;
  font-style: italic;
}

.user-introduction {
  font-size: 0.9rem;
  color: #777;
  line-height: 1.4;
  margin-top: 0.5rem;
  max-width: 400px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.form-section {
  margin-bottom: 2rem;
}

/* 表单section样式 */
.form-section h3 {
  color: #333;
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  padding-bottom: 0.75rem;
  border-bottom: 2px solid rgba(51, 51, 51, 0.3);
  text-shadow: 0 1px 2px rgba(255, 255, 255, 0.8);
}

.avatar-section {
  display: flex;
  align-items: center;
  gap: 2rem;
}

.current-avatar {
  flex-shrink: 0;
}

.avatar-preview {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid var(--accent-color, #ffc107);
}

.avatar-input {
  flex: 1;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.phone-group {
  grid-column: 1 / -1;
}

.phone-input-group {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.phone-readonly {
  flex: 1;
  background-color: #f5f5f5;
  cursor: not-allowed;
}

.verification-input-group {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

/* 表单标签和输入框样式 */
.form-group label {
  font-weight: 600;
  font-size: 1.1rem;
  color: #333;
  text-shadow: 0 1px 2px rgba(255, 255, 255, 0.8);
  margin-bottom: 0.15rem;
  display: block;
}

.form-input,
.form-textarea {
  padding: 1rem;
  border: 1px solid rgba(51, 51, 51, 0.3);
  border-radius: 12px;
  font-size: 1.1rem;
  background: rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  color: #333;
  transition: all 0.3s ease;
  width: 100%;
}

.form-input::placeholder,
.form-textarea::placeholder {
  color: rgba(51, 51, 51, 0.6);
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: rgba(51, 51, 51, 0.6);
  background: rgba(255, 255, 255, 0.5);
  box-shadow: 0 0 0 3px rgba(51, 51, 51, 0.1);
}

.form-textarea {
  resize: vertical;
  min-height: 100px;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background: #f8f9fa;
  border-radius: 8px;
}

.info-item label {
  font-weight: 600;
  color: #666;
}

.info-item span {
  color: #333;
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: 2rem;
}

/* 按钮样式 */
.btn {
  padding: 0.75rem 2rem;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

.btn-primary {
  background: rgba(255, 193, 7, 0.8);
  color: #333;
  border-color: rgba(255, 193, 7, 0.9);
}

.btn-primary:hover:not(:disabled) {
  background: rgba(255, 193, 7, 0.9);
  border-color: rgba(255, 193, 7, 1);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 193, 7, 0.4);
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.3);
  color: #333;
  border-color: rgba(51, 51, 51, 0.3);
}

.btn-secondary:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.5);
  border-color: rgba(51, 51, 51, 0.5);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(51, 51, 51, 0.2);
}

.btn-small {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

/* 模态框样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

/* 模态框样式 */
.modal-content {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: 16px;
  width: 90%;
  max-width: 400px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
}

/* 模态框头部 */
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid rgba(51, 51, 51, 0.2);
}

.modal-header h3 {
  margin: 0;
  color: #333;
  text-shadow: 0 1px 2px rgba(255, 255, 255, 0.8);
}

/* 模态框关闭按钮 */
.modal-close {
  background: rgba(255, 255, 255, 0.3);
  border: 1px solid rgba(51, 51, 51, 0.2);
  border-radius: 8px;
  font-size: 1.5rem;
  cursor: pointer;
  color: #333;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.modal-close:hover {
  background: rgba(255, 255, 255, 0.5);
  border-color: rgba(51, 51, 51, 0.4);
}

/* 模态框内容 */
.modal-body {
  padding: 1.5rem;
}

.modal-body .form-group label {
  color: #333;
  text-shadow: 0 1px 2px rgba(255, 255, 255, 0.8);
  margin-bottom: 0.15rem;
}

.modal-footer {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  padding: 1.5rem;
  border-top: 1px solid rgba(51, 51, 51, 0.2);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .profile-page {
    padding-top: 70px;
  }
  
  .page-title {
    font-size: 1.5rem;
  }
  
  .profile-form-container {
    padding: 1.5rem;
    margin: 1rem;
  }
  
  .avatar-section {
    flex-direction: column;
    text-align: center;
  }
  
  .form-grid {
    grid-template-columns: 1fr;
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .phone-input-group,
  .verification-input-group {
    flex-direction: column;
  }

  /* 用户信息卡片移动端适配 */
  .user-info-card {
    flex-direction: column;
    text-align: center;
    gap: 1rem;
    padding: 1.5rem;
  }

  .user-avatar {
    width: 100px;
    height: 100px;
  }

  .avatar-edit-icon {
    width: 28px;
    height: 28px;
    bottom: 6px;
    right: 6px;
  }

  .user-name-section {
    flex-direction: column;
    gap: 0.5rem;
    align-items: center;
  }

  .user-name {
    font-size: 1.8rem;
  }

  .user-points {
    font-size: 1.1rem;
    padding: 0.25rem 0.6rem;
  }

  .user-job-title {
    font-size: 0.9rem;
    margin-top: 0.25rem;
  }

  .user-introduction {
    font-size: 0.85rem;
    margin-top: 0.25rem;
    max-width: 100%;
    text-align: center;
  }
}

/* 暗色主题支持 */
[data-theme="dark"] .profile-form-container {
  background: rgba(18, 18, 18, 0.95);
  color: white;
}

[data-theme="dark"] .form-section h3 {
  color: white;
}

[data-theme="dark"] .form-input,
[data-theme="dark"] .form-textarea {
  background: #2a2a2a;
  border-color: #444;
  color: white;
}

[data-theme="dark"] .form-input:focus,
[data-theme="dark"] .form-textarea:focus {
  border-color: var(--accent-color, #ffc107);
}

[data-theme="dark"] .phone-readonly {
  background-color: #1a1a1a;
}

[data-theme="dark"] .info-item {
  background: #2a2a2a;
}

[data-theme="dark"] .info-item label {
  color: #ccc;
}

[data-theme="dark"] .info-item span {
  color: white;
}

[data-theme="dark"] .modal-content {
  background: #2a2a2a;
  color: white;
}

[data-theme="dark"] .modal-header {
  border-bottom-color: #444;
}

[data-theme="dark"] .modal-footer {
  border-top-color: #444;
}

[data-theme="dark"] .modal-header h3 {
  color: white;
}

[data-theme="dark"] .modal-close {
  color: #ccc;
}
</style>
