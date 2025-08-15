<script setup>
import { ref, computed, inject, watch } from 'vue'
import LoginForm from './LoginForm.vue'
import RegisterForm from './RegisterForm.vue'
import ForgotPasswordForm from './ForgotPasswordForm.vue'

// 注入主题
const currentTheme = inject('theme', ref('light'))

// 组件属性
const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  initialMode: {
    type: String,
    default: 'login', // 'login', 'register', 'forgot-password'
    validator: (value) => ['login', 'register', 'forgot-password'].includes(value)
  }
})

// 组件事件
const emit = defineEmits(['close', 'success'])

// 响应式状态
const currentMode = ref(props.initialMode)
const isVisible = ref(false)

// 计算属性
const modalTitle = computed(() => {
  const titles = {
    login: '登录',
    register: '注册',
    'forgot-password': '忘记密码'
  }
  return titles[currentMode.value] || '认证'
})

const showBackButton = computed(() => {
  return currentMode.value !== 'login'
})

// 方法
const openModal = () => {
  isVisible.value = true
  document.body.style.overflow = 'hidden'
}

const closeModal = () => {
  isVisible.value = false
  document.body.style.overflow = ''
  emit('close')
}

// 监听show属性变化
watch(() => props.show, (newValue) => {
  if (newValue) {
    openModal()
  } else {
    closeModal()
  }
}, { immediate: true })

// 监听初始模式变化
watch(() => props.initialMode, (newValue) => {
  currentMode.value = newValue
})

const switchMode = (mode) => {
  currentMode.value = mode
}

const goBack = () => {
  currentMode.value = 'login'
}

const handleSuccess = (data) => {
  emit('success', data)
  closeModal()
}

const handleBackdropClick = (event) => {
  // 禁用背景点击关闭，只能通过关闭按钮或ESC键关闭
  // if (event.target === event.currentTarget) {
  //   closeModal()
  // }
}

const handleEscapeKey = (event) => {
  // 在重置密码页面禁用ESC键退出
  if (event.key === 'Escape' && isVisible.value && currentMode.value !== 'forgot-password') {
    closeModal()
  }
}

// 键盘事件监听
watch(isVisible, (newValue) => {
  if (newValue) {
    document.addEventListener('keydown', handleEscapeKey)
  } else {
    document.removeEventListener('keydown', handleEscapeKey)
  }
})
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="isVisible"
        class="auth-modal-overlay"
        :data-theme="currentTheme"
        @click="handleBackdropClick"
      >
        <div class="auth-modal">
          <!-- 模态框头部 -->
          <div class="auth-modal-header">
            <button
              v-if="showBackButton"
              class="back-button"
              @click="goBack"
              aria-label="返回"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
            </button>
            <h2 class="modal-title">{{ modalTitle }}</h2>
            <button
              v-if="currentMode !== 'forgot-password'"
              class="close-button"
              @click="closeModal"
              aria-label="关闭"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          <!-- 模态框内容 -->
          <div class="auth-modal-content">
            <Transition name="form-slide" mode="out-in">
              <LoginForm
                v-if="currentMode === 'login'"
                key="login"
                @switch-to-register="switchMode('register')"
                @switch-to-forgot-password="switchMode('forgot-password')"
                @success="handleSuccess"
              />
              <RegisterForm
                v-else-if="currentMode === 'register'"
                key="register"
                @switch-to-login="switchMode('login')"
                @success="handleSuccess"
              />
              <ForgotPasswordForm
                v-else-if="currentMode === 'forgot-password'"
                key="forgot-password"
                @switch-to-login="switchMode('login')"
                @success="handleSuccess"
              />
            </Transition>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
/* 模态框覆盖层 */
.auth-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 1rem;
}

/* 模态框主体 */
.auth-modal {
  background: var(--bg-primary);
  border-radius: 12px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
  width: 100%;
  max-width: 400px;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* 模态框头部 */
.auth-modal-header {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem 1.5rem 0;
  border-bottom: 1px solid var(--border-color);
  margin-bottom: 1.5rem;
  position: relative;
}

.modal-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
  text-align: center;
}

.back-button,
.close-button {
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 6px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
}

.back-button:hover,
.close-button:hover {
  background: var(--bg-secondary);
  color: var(--text-primary);
}

.back-button {
  left: 1.5rem;
}

.close-button {
  right: 1.5rem;
}

/* 模态框内容 */
.auth-modal-content {
  flex: 1;
  padding: 0 1.5rem 1.5rem;
  overflow-y: auto;
  /* 隐藏滚动条但保持滚动功能 */
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE and Edge */
}

.auth-modal-content::-webkit-scrollbar {
  display: none; /* Chrome, Safari and Opera */
}

/* 动画效果 */
.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
  transform: scale(0.9);
}

.form-slide-enter-active,
.form-slide-leave-active {
  transition: all 0.3s ease;
}

.form-slide-enter-from {
  opacity: 0;
  transform: translateX(20px);
}

.form-slide-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

/* 响应式设计 */
@media (max-width: 480px) {
  .auth-modal-overlay {
    padding: 0.5rem;
  }

  .auth-modal {
    max-width: none;
    border-radius: 8px;
  }

  .auth-modal-header {
    padding: 1rem 1rem 0;
    margin-bottom: 1rem;
  }

  .modal-title {
    font-size: 1.25rem;
  }

  .back-button {
    left: 1rem;
  }

  .close-button {
    right: 1rem;
  }

  .auth-modal-content {
    padding: 0 1rem 1rem;
  }
}

/* 主题适配 */
[data-theme="dark"] .auth-modal {
  background: var(--bg-primary);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
}

[data-theme="dark"] .auth-modal-overlay {
  background: rgba(0, 0, 0, 0.7);
}
</style>
