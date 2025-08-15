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
  phoneNumber: '',
  smsCode: '',
  newPassword: '',
  confirmPassword: ''
})

// 组件状态
const isSubmitting = ref(false)
const isSendingCode = ref(false)
const showNewPassword = ref(false)
const showConfirmPassword = ref(false)
const errorMessage = ref('')
const successMessage = ref('')
const smsCodeSent = ref(false)
const countdown = ref(0)
const currentStep = ref(1) // 1: 发送验证码, 2: 重置密码

// 创建表单验证器
const forgotPasswordValidator = createValidators.forgotPassword()
const resetPasswordValidator = createValidators.resetPassword()

// 字段错误状态
const fieldErrors = reactive({
  phoneNumber: null,
  smsCode: null,
  newPassword: null,
  confirmPassword: null
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

const currentValidator = computed(() => {
  return currentStep.value === 1 ? forgotPasswordValidator : resetPasswordValidator
})

// 方法
const validateField = (field) => {
  const error = currentValidator.value.validateField(field, formData[field], formData)
  fieldErrors[field] = error
  return !error
}

const validateCurrentStep = () => {
  if (currentStep.value === 1) {
    return validateField('phoneNumber')
  } else {
    const { isValid, errors } = resetPasswordValidator.validateAll(formData)
    Object.assign(fieldErrors, errors)
    return isValid
  }
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
    await authApi.sendForgotPasswordCode(formData.phoneNumber)
    successMessage.value = '验证码已发送，请查看手机短信'
    smsCodeSent.value = true
    startCountdown()
    
    // 如果是第一步，自动进入第二步
    if (currentStep.value === 1) {
      currentStep.value = 2
    }
  } catch (error) {
    console.error('发送验证码失败:', error)
    errorMessage.value = authUtils.formatApiError(error)
  } finally {
    isSendingCode.value = false
  }
}

const handleSubmit = async () => {
  clearMessages()

  if (currentStep.value === 1) {
    // 第一步：发送验证码
    await sendSmsCode()
  } else {
    // 第二步：重置密码
    await resetPassword()
  }
}

const resetPassword = async () => {
  // 验证表单
  if (!validateCurrentStep()) {
    return
  }

  isSubmitting.value = true
  setLoading(true)

  try {
    await authApi.resetPassword(
      formData.phoneNumber,
      formData.smsCode,
      formData.newPassword,
      formData.confirmPassword
    )
    
    successMessage.value = '密码重置成功！正在跳转到登录页面...'

    // 延迟跳转到登录页面
    setTimeout(() => {
      emit('switch-to-login')
    }, 1500)

  } catch (error) {
    console.error('重置密码失败:', error)
    errorMessage.value = authUtils.formatApiError(error)
  } finally {
    isSubmitting.value = false
    setLoading(false)
  }
}

const togglePasswordVisibility = (field) => {
  if (field === 'newPassword') {
    showNewPassword.value = !showNewPassword.value
  } else if (field === 'confirmPassword') {
    showConfirmPassword.value = !showConfirmPassword.value
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

const goBackToStep1 = () => {
  currentStep.value = 1
  clearMessages()
}

const switchToLogin = () => {
  emit('switch-to-login')
}
</script>

<template>
  <div class="forgot-password-form">
    <!-- 表单标题 -->
    <div class="form-header">
      <p class="form-description">
        {{ currentStep === 1 ? '请输入您的手机号，我们将发送验证码' : '请输入验证码和新密码' }}
      </p>
    </div>

    <!-- 成功/错误消息 -->
    <div v-if="successMessage" class="message success-message">
      {{ successMessage }}
    </div>
    <div v-if="errorMessage" class="message error-message">
      {{ errorMessage }}
    </div>

    <!-- 忘记密码表单 -->
    <form @submit.prevent="handleSubmit" class="auth-form">
      <!-- 第一步：手机号输入 -->
      <div v-if="currentStep === 1" class="step-content">
        <div class="form-group">
          <label for="phoneNumber" class="form-label">手机号</label>
          <input
            id="phoneNumber"
            v-model="formData.phoneNumber"
            type="tel"
            class="form-input"
            :class="{ 'error': fieldErrors.phoneNumber }"
            placeholder="请输入注册时的手机号"
            autocomplete="tel"
            @input="handleInputChange('phoneNumber')"
            @blur="validateField('phoneNumber')"
          />
          <div v-if="fieldErrors.phoneNumber" class="field-error">
            {{ fieldErrors.phoneNumber }}
          </div>
        </div>

        <button
          type="submit"
          class="submit-button"
          :disabled="isSendingCode"
        >
          <span v-if="isSendingCode" class="loading-spinner"></span>
          {{ isSendingCode ? '发送中...' : '发送验证码' }}
        </button>
      </div>

      <!-- 第二步：验证码和新密码 -->
      <div v-else class="step-content">
        <!-- 手机号显示（只读） -->
        <div class="form-group">
          <label class="form-label">手机号</label>
          <div class="readonly-field">
            {{ formData.phoneNumber }}
            <button
              type="button"
              class="change-phone-button"
              @click="goBackToStep1"
            >
              更换
            </button>
          </div>
        </div>

        <!-- 短信验证码 -->
        <div class="form-group">
          <label for="smsCode" class="form-label">短信验证码</label>
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

        <!-- 新密码 -->
        <div class="form-group">
          <label for="newPassword" class="form-label">新密码</label>
          <div class="password-input-wrapper">
            <input
              id="newPassword"
              v-model="formData.newPassword"
              :type="showNewPassword ? 'text' : 'password'"
              class="form-input"
              :class="{ 'error': fieldErrors.newPassword }"
              placeholder="请输入新密码（至少6位）"
              autocomplete="new-password"
              @input="handleInputChange('newPassword')"
              @blur="validateField('newPassword')"
            />
            <button
              type="button"
              class="password-toggle"
              @click="togglePasswordVisibility('newPassword')"
              :aria-label="showNewPassword ? '隐藏密码' : '显示密码'"
            >
              <svg v-if="showNewPassword" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                <line x1="1" y1="1" x2="23" y2="23"/>
              </svg>
              <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
            </button>
          </div>
          <div v-if="fieldErrors.newPassword" class="field-error">
            {{ fieldErrors.newPassword }}
          </div>
        </div>

        <!-- 确认新密码 -->
        <div class="form-group">
          <label for="confirmPassword" class="form-label">确认新密码</label>
          <div class="password-input-wrapper">
            <input
              id="confirmPassword"
              v-model="formData.confirmPassword"
              :type="showConfirmPassword ? 'text' : 'password'"
              class="form-input"
              :class="{ 'error': fieldErrors.confirmPassword }"
              placeholder="请再次输入新密码"
              autocomplete="new-password"
              @input="handleInputChange('confirmPassword')"
              @blur="validateField('confirmPassword')"
            />
            <button
              type="button"
              class="password-toggle"
              @click="togglePasswordVisibility('confirmPassword')"
              :aria-label="showConfirmPassword ? '隐藏密码' : '显示密码'"
            >
              <svg v-if="showConfirmPassword" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                <line x1="1" y1="1" x2="23" y2="23"/>
              </svg>
              <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
            </button>
          </div>
          <div v-if="fieldErrors.confirmPassword" class="field-error">
            {{ fieldErrors.confirmPassword }}
          </div>
        </div>

        <button
          type="submit"
          class="submit-button"
          :disabled="isSubmitting"
        >
          <span v-if="isSubmitting" class="loading-spinner"></span>
          {{ isSubmitting ? '重置中...' : '重置密码' }}
        </button>
      </div>
    </form>

    <!-- 切换到登录 -->
    <div class="form-footer">
      <p class="switch-form-text">
        想起密码了？
        <button
          type="button"
          class="link-button"
          @click="switchToLogin"
        >
          返回登录
        </button>
      </p>
    </div>
  </div>
</template>

<style scoped>
.forgot-password-form {
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

.step-content {
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

.readonly-field {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  background: var(--bg-secondary);
  border: 2px solid var(--border-color);
  border-radius: 8px;
  color: var(--text-primary);
  font-size: 1rem;
}

.change-phone-button {
  background: none;
  border: none;
  color: var(--accent-color);
  cursor: pointer;
  font-size: 0.9rem;
  text-decoration: none;
  transition: color 0.2s ease;
}

.change-phone-button:hover {
  color: var(--accent-color-hover);
  text-decoration: underline;
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

  .readonly-field {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .change-phone-button {
    align-self: flex-end;
  }
}
</style>
