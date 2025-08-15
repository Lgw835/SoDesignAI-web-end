<script setup>
import { ref, reactive, inject, computed } from 'vue'
import { authApi, authUtils } from '../../utils/auth.js'
import { createValidators } from '../../utils/validation.js'

// 注入全局状态
const setLoading = inject('setLoading', () => {})

// 组件事件
const emit = defineEmits(['switch-to-login', 'success'])

// 表单数据
const formData = reactive({
  username: '',
  phoneNumber: '',
  password: '',
  passwordConfirm: '',
  smsCode: '',
  gender: 'male',
  jobTitle: '',
  introduction: '',
  avatarUrl: ''
})

// 组件状态
const isSubmitting = ref(false)
const isSendingCode = ref(false)
const showPassword = ref(false)
const showPasswordConfirm = ref(false)
const errorMessage = ref('')
const successMessage = ref('')
const smsCodeSent = ref(false)
const countdown = ref(0)

// 创建表单验证器
const validator = createValidators.register()

// 字段错误状态
const fieldErrors = reactive({
  username: null,
  phoneNumber: null,
  password: null,
  passwordConfirm: null,
  smsCode: null
})

// 计算属性
const canSendSmsCode = computed(() => {
  return !isSendingCode.value && 
         countdown.value === 0 && 
         formData.phoneNumber && 
         !fieldErrors.phoneNumber
})

const smsButtonText = computed(() => {
  if (isSendingCode.value) return '发送中...'
  if (countdown.value > 0) return `${countdown.value}s后重发`
  if (smsCodeSent.value) return '重新发送'
  return '发送验证码'
})

// 方法
const validateField = (field) => {
  const error = validator.validateField(field, formData[field], formData)
  fieldErrors[field] = error
  return !error
}

const validateForm = () => {
  const { isValid, errors } = validator.validateAll(formData)
  Object.assign(fieldErrors, errors)
  return isValid
}

const clearMessages = () => {
  errorMessage.value = ''
  successMessage.value = ''
}

const startCountdown = () => {
  countdown.value = 60
  const timer = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) {
      clearInterval(timer)
    }
  }, 1000)
}

const sendSmsCode = async () => {
  clearMessages()
  
  // 验证手机号
  if (!validateField('phoneNumber')) {
    return
  }

  isSendingCode.value = true

  try {
    await authApi.sendSmsCode(formData.phoneNumber)
    successMessage.value = '验证码已发送，请查看手机短信'
    smsCodeSent.value = true
    startCountdown()
  } catch (error) {
    console.error('发送验证码失败:', error)
    errorMessage.value = authUtils.formatApiError(error)
  } finally {
    isSendingCode.value = false
  }
}

const handleSubmit = async () => {
  clearMessages()

  // 验证表单
  if (!validateForm()) {
    return
  }

  isSubmitting.value = true
  setLoading(true)

  try {
    const userData = {
      username: formData.username,
      phone_number: formData.phoneNumber,
      password: formData.password,
      password_confirm: formData.passwordConfirm,
      sms_code: formData.smsCode,
      gender: formData.gender,
      job_title: formData.jobTitle || undefined,
      introduction: formData.introduction || undefined,
      avatar_url: formData.avatarUrl || undefined
    }

    const response = await authApi.register(userData)
    
    successMessage.value = '注册成功！'
    
    // 通知父组件注册成功
    emit('success', {
      type: 'register',
      user: response.user,
      tokens: response.tokens
    })

  } catch (error) {
    console.error('注册失败:', error)
    errorMessage.value = authUtils.formatApiError(error)
  } finally {
    isSubmitting.value = false
    setLoading(false)
  }
}

const togglePasswordVisibility = (field) => {
  if (field === 'password') {
    showPassword.value = !showPassword.value
  } else if (field === 'passwordConfirm') {
    showPasswordConfirm.value = !showPasswordConfirm.value
  }
}

const handleInputChange = (field) => {
  clearMessages()
  // 延迟验证，避免用户输入时立即显示错误
  setTimeout(() => {
    if (formData[field]) {
      validateField(field)
    } else {
      fieldErrors[field] = null
    }
  }, 300)
}

const switchToLogin = () => {
  emit('switch-to-login')
}
</script>

<template>
  <div class="register-form">
    <!-- 表单标题 -->
    <div class="form-header">
      <p class="form-description">
        创建您的账户，开始使用SoDesign.AI
      </p>
    </div>

    <!-- 成功/错误消息 -->
    <div v-if="successMessage" class="message success-message">
      {{ successMessage }}
    </div>
    <div v-if="errorMessage" class="message error-message">
      {{ errorMessage }}
    </div>

    <!-- 注册表单 -->
    <form @submit.prevent="handleSubmit" class="auth-form">
      <!-- 用户名输入 -->
      <div class="form-group">
        <label for="username" class="form-label">用户名 *</label>
        <input
          id="username"
          v-model="formData.username"
          type="text"
          class="form-input"
          :class="{ 'error': fieldErrors.username }"
          placeholder="请输入用户名"
          autocomplete="username"
          @input="handleInputChange('username')"
          @blur="validateField('username')"
        />
        <div v-if="fieldErrors.username" class="field-error">
          {{ fieldErrors.username }}
        </div>
      </div>

      <!-- 手机号输入 -->
      <div class="form-group">
        <label for="phoneNumber" class="form-label">手机号 *</label>
        <input
          id="phoneNumber"
          v-model="formData.phoneNumber"
          type="tel"
          class="form-input"
          :class="{ 'error': fieldErrors.phoneNumber }"
          placeholder="请输入手机号"
          autocomplete="tel"
          @input="handleInputChange('phoneNumber')"
          @blur="validateField('phoneNumber')"
        />
        <div v-if="fieldErrors.phoneNumber" class="field-error">
          {{ fieldErrors.phoneNumber }}
        </div>
      </div>

      <!-- 短信验证码 -->
      <div class="form-group">
        <label for="smsCode" class="form-label">短信验证码 *</label>
        <div class="sms-input-wrapper">
          <input
            id="smsCode"
            v-model="formData.smsCode"
            type="text"
            class="form-input sms-input"
            :class="{ 'error': fieldErrors.smsCode }"
            placeholder="请输入6位验证码"
            maxlength="6"
            @input="handleInputChange('smsCode')"
            @blur="validateField('smsCode')"
          />
          <button
            type="button"
            class="sms-button"
            :class="{ 'disabled': !canSendSmsCode }"
            :disabled="!canSendSmsCode"
            @click="sendSmsCode"
          >
            {{ smsButtonText }}
          </button>
        </div>
        <div v-if="fieldErrors.smsCode" class="field-error">
          {{ fieldErrors.smsCode }}
        </div>
      </div>

      <!-- 密码输入 -->
      <div class="form-group">
        <label for="password" class="form-label">密码 *</label>
        <div class="password-input-wrapper">
          <input
            id="password"
            v-model="formData.password"
            :type="showPassword ? 'text' : 'password'"
            class="form-input"
            :class="{ 'error': fieldErrors.password }"
            placeholder="请输入密码（至少6位）"
            autocomplete="new-password"
            @input="handleInputChange('password')"
            @blur="validateField('password')"
          />
          <button
            type="button"
            class="password-toggle"
            @click="togglePasswordVisibility('password')"
            :aria-label="showPassword ? '隐藏密码' : '显示密码'"
          >
            <svg v-if="showPassword" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
              <line x1="1" y1="1" x2="23" y2="23"/>
            </svg>
            <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
          </button>
        </div>
        <div v-if="fieldErrors.password" class="field-error">
          {{ fieldErrors.password }}
        </div>
      </div>

      <!-- 确认密码输入 -->
      <div class="form-group">
        <label for="passwordConfirm" class="form-label">确认密码 *</label>
        <div class="password-input-wrapper">
          <input
            id="passwordConfirm"
            v-model="formData.passwordConfirm"
            :type="showPasswordConfirm ? 'text' : 'password'"
            class="form-input"
            :class="{ 'error': fieldErrors.passwordConfirm }"
            placeholder="请再次输入密码"
            autocomplete="new-password"
            @input="handleInputChange('passwordConfirm')"
            @blur="validateField('passwordConfirm')"
          />
          <button
            type="button"
            class="password-toggle"
            @click="togglePasswordVisibility('passwordConfirm')"
            :aria-label="showPasswordConfirm ? '隐藏密码' : '显示密码'"
          >
            <svg v-if="showPasswordConfirm" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
              <line x1="1" y1="1" x2="23" y2="23"/>
            </svg>
            <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
          </button>
        </div>
        <div v-if="fieldErrors.passwordConfirm" class="field-error">
          {{ fieldErrors.passwordConfirm }}
        </div>
      </div>

      <!-- 性别选择 -->
      <div class="form-group">
        <label class="form-label">性别</label>
        <div class="radio-group">
          <label class="radio-label">
            <input
              v-model="formData.gender"
              type="radio"
              value="male"
              class="radio-input"
            />
            <span class="radio-text">男</span>
          </label>
          <label class="radio-label">
            <input
              v-model="formData.gender"
              type="radio"
              value="female"
              class="radio-input"
            />
            <span class="radio-text">女</span>
          </label>
          <label class="radio-label">
            <input
              v-model="formData.gender"
              type="radio"
              value="other"
              class="radio-input"
            />
            <span class="radio-text">其他</span>
          </label>
        </div>
      </div>

      <!-- 职位（可选） -->
      <div class="form-group">
        <label for="jobTitle" class="form-label">职位</label>
        <input
          id="jobTitle"
          v-model="formData.jobTitle"
          type="text"
          class="form-input"
          placeholder="请输入您的职位（可选）"
          autocomplete="organization-title"
        />
      </div>

      <!-- 个人介绍（可选） -->
      <div class="form-group">
        <label for="introduction" class="form-label">个人介绍</label>
        <textarea
          id="introduction"
          v-model="formData.introduction"
          class="form-textarea"
          placeholder="简单介绍一下自己（可选）"
          rows="3"
          maxlength="200"
        ></textarea>
      </div>

      <!-- 提交按钮 -->
      <button
        type="submit"
        class="submit-button"
        :disabled="isSubmitting"
      >
        <span v-if="isSubmitting" class="loading-spinner"></span>
        {{ isSubmitting ? '注册中...' : '注册' }}
      </button>
    </form>

    <!-- 切换到登录 -->
    <div class="form-footer">
      <p class="switch-form-text">
        已有账户？
        <button
          type="button"
          class="link-button"
          @click="switchToLogin"
        >
          立即登录
        </button>
      </p>
    </div>
  </div>
</template>

<style scoped>
.register-form {
  width: 100%;
}

.form-header {
  text-align: center;
  margin-bottom: 2rem;
}

.form-description {
  color: var(--text-secondary);
  margin: 0;
  font-size: 0.95rem;
}

.message {
  padding: 0.75rem 1rem;
  border-radius: 6px;
  margin-bottom: 1rem;
  font-size: 0.9rem;
}

.success-message {
  background: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.error-message {
  background: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

.auth-form {
  width: 100%;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-label {
  display: block;
  margin-bottom: 0.5rem;
  color: var(--text-primary);
  font-weight: 500;
  font-size: 0.9rem;
}

.form-input,
.form-textarea {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 2px solid var(--border-color);
  border-radius: 8px;
  font-size: 1rem;
  background: var(--bg-primary);
  color: var(--text-primary);
  transition: all 0.2s ease;
  box-sizing: border-box;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: var(--accent-color);
  box-shadow: 0 0 0 3px rgba(var(--accent-color-rgb), 0.1);
}

.form-input.error,
.form-textarea.error {
  border-color: #dc3545;
}

.form-input.error:focus,
.form-textarea.error:focus {
  box-shadow: 0 0 0 3px rgba(220, 53, 69, 0.1);
}

.form-textarea {
  resize: vertical;
  min-height: 80px;
  font-family: inherit;
}

.sms-input-wrapper {
  display: flex;
  gap: 0.5rem;
}

.sms-input {
  flex: 1;
}

.sms-button {
  padding: 0.75rem 1rem;
  background: var(--accent-color);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  min-width: 100px;
}

.sms-button:hover:not(.disabled) {
  background: var(--accent-color-hover);
}

.sms-button.disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.password-input-wrapper {
  position: relative;
}

.password-toggle {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  transition: color 0.2s ease;
}

.password-toggle:hover {
  color: var(--text-primary);
}

.radio-group {
  display: flex;
  gap: 1.5rem;
  margin-top: 0.5rem;
}

.radio-label {
  display: flex;
  align-items: center;
  cursor: pointer;
  font-size: 0.9rem;
}

.radio-input {
  margin-right: 0.5rem;
  accent-color: var(--accent-color);
}

.radio-text {
  color: var(--text-primary);
}

.field-error {
  color: #dc3545;
  font-size: 0.8rem;
  margin-top: 0.25rem;
}

.submit-button {
  width: 100%;
  padding: 0.875rem 1rem;
  background: var(--accent-color);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 1rem;
}

.submit-button:hover:not(:disabled) {
  background: var(--accent-color-hover);
  transform: translateY(-1px);
}

.submit-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.form-footer {
  text-align: center;
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--border-color);
}

.switch-form-text {
  color: var(--text-secondary);
  margin: 0;
  font-size: 0.9rem;
}

.link-button {
  background: none;
  border: none;
  color: var(--accent-color);
  cursor: pointer;
  font-size: 0.9rem;
  text-decoration: none;
  transition: color 0.2s ease;
}

.link-button:hover {
  color: var(--accent-color-hover);
  text-decoration: underline;
}

/* 主题适配 */
[data-theme="dark"] .success-message {
  background: rgba(40, 167, 69, 0.2);
  color: #4caf50;
  border-color: rgba(40, 167, 69, 0.3);
}

[data-theme="dark"] .error-message {
  background: rgba(220, 53, 69, 0.2);
  color: #f56565;
  border-color: rgba(220, 53, 69, 0.3);
}

/* 响应式设计 */
@media (max-width: 480px) {
  .sms-input-wrapper {
    flex-direction: column;
  }

  .sms-button {
    min-width: auto;
  }

  .radio-group {
    gap: 1rem;
  }
}
</style>
