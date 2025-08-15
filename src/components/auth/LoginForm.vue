<script setup>
import { ref, reactive, inject } from 'vue'
import { authApi, authUtils } from '../../utils/auth.js'
import { createValidators } from '../../utils/validation.js'

// 注入全局状态
const setLoading = inject('setLoading', () => {})

// 组件事件
const emit = defineEmits(['switch-to-register', 'switch-to-forgot-password', 'success'])

// 表单数据
const formData = reactive({
  username: '',
  password: ''
})

// 组件状态
const isSubmitting = ref(false)
const showPassword = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

// 创建表单验证器
const validator = createValidators.login()

// 字段错误状态
const fieldErrors = reactive({
  username: null,
  password: null
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

const handleSubmit = async () => {
  clearMessages()

  // 验证表单
  if (!validateForm()) {
    return
  }

  isSubmitting.value = true
  setLoading(true)

  try {
    const response = await authApi.login(formData.username, formData.password)
    
    successMessage.value = '登录成功！'
    
    // 通知父组件登录成功
    emit('success', {
      type: 'login',
      user: response.user,
      tokens: response.tokens
    })

  } catch (error) {
    console.error('登录失败:', error)
    errorMessage.value = authUtils.formatApiError(error)
  } finally {
    isSubmitting.value = false
    setLoading(false)
  }
}

const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value
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

const switchToRegister = () => {
  emit('switch-to-register')
}

const switchToForgotPassword = () => {
  emit('switch-to-forgot-password')
}
</script>

<template>
  <div class="login-form">
    <!-- 表单标题 -->
    <div class="form-header">
      <p class="form-description">
        欢迎回来！请登录您的账户
      </p>
    </div>

    <!-- 成功/错误消息 -->
    <div v-if="successMessage" class="message success-message">
      {{ successMessage }}
    </div>
    <div v-if="errorMessage" class="message error-message">
      {{ errorMessage }}
    </div>

    <!-- 登录表单 -->
    <form @submit.prevent="handleSubmit" class="auth-form">
      <!-- 用户名输入 -->
      <div class="form-group">
        <label for="username" class="form-label">用户名</label>
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

      <!-- 密码输入 -->
      <div class="form-group">
        <label for="password" class="form-label">密码</label>
        <div class="password-input-wrapper">
          <input
            id="password"
            v-model="formData.password"
            :type="showPassword ? 'text' : 'password'"
            class="form-input"
            :class="{ 'error': fieldErrors.password }"
            placeholder="请输入密码"
            autocomplete="current-password"
            @input="handleInputChange('password')"
            @blur="validateField('password')"
          />
          <button
            type="button"
            class="password-toggle"
            @click="togglePasswordVisibility"
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

      <!-- 忘记密码链接 -->
      <div class="form-actions">
        <button
          type="button"
          class="link-button"
          @click="switchToForgotPassword"
        >
          忘记密码？
        </button>
      </div>

      <!-- 提交按钮 -->
      <button
        type="submit"
        class="submit-button"
        :disabled="isSubmitting"
      >
        <span v-if="isSubmitting" class="loading-spinner"></span>
        {{ isSubmitting ? '登录中...' : '登录' }}
      </button>
    </form>

    <!-- 切换到注册 -->
    <div class="form-footer">
      <p class="switch-form-text">
        还没有账户？
        <button
          type="button"
          class="link-button"
          @click="switchToRegister"
        >
          立即注册
        </button>
      </p>
    </div>
  </div>
</template>

<style scoped>
.login-form {
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

.form-input {
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

.form-input:focus {
  outline: none;
  border-color: var(--accent-color);
  box-shadow: 0 0 0 3px rgba(var(--accent-color-rgb), 0.1);
}

.form-input.error {
  border-color: #dc3545;
}

.form-input.error:focus {
  box-shadow: 0 0 0 3px rgba(220, 53, 69, 0.1);
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

.field-error {
  color: #dc3545;
  font-size: 0.8rem;
  margin-top: 0.25rem;
}

.form-actions {
  display: flex;
  justify-content: center;
  margin-bottom: 1.5rem;
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
</style>
