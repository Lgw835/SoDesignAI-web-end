<script setup>
import { ref, onMounted, onUnmounted, inject, computed } from 'vue'
import { useRouter } from 'vue-router'
import AuthModal from './auth/AuthModal.vue'

import { authUtils } from '../utils/auth.js'

// Router
const router = useRouter()

// Inject theme from parent
const currentTheme = inject('theme', ref('light'))
const setTheme = inject('setTheme', () => {})

// Reactive state
const isMenuOpen = ref(false)
const navbarClass = ref('nav-transparent')
const showAuthModal = ref(false)
const authModalMode = ref('login')
const isAuthenticated = ref(authUtils.isAuthenticated())
const currentUser = ref(authUtils.getCurrentUser())
const showUserDropdown = ref(false)


// Logo URLs for different themes and states
const logoUrls = {
  light: 'https://s3.20250131.xyz/gh/usst-502s/welcome/2025/8/1754556683120-404.png',
  dark: 'https://s3.20250131.xyz/gh/usst-502s/welcome/2025/8/1754556656603-396.png'
}

// Computed logo URL based on theme and navbar state
const currentLogoUrl = computed(() => {
  // For transparent navbar (hero section), use dark logo for light theme and light logo for dark theme
  if (navbarClass.value.includes('nav-transparent')) {
    return currentTheme.value === 'light' ? logoUrls.dark : logoUrls.light
  }
  // For solid navbar, use logo matching the theme
  return currentTheme.value === 'light' ? logoUrls.light : logoUrls.dark
})

// Navigation links
const navLinks = ref([
  { href: '#webui', text: 'WebUI' },
  { href: '#comfyui', text: 'ComfyUI' },
  { href: '#modelib', text: 'ModeLIB' },
  { href: '#caselib', text: 'CaseLIB' }
])

// Mobile menu toggle
const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value
}

const closeMenu = () => {
  isMenuOpen.value = false
}

// 认证相关方法
const openAuthModal = (mode = 'login') => {
  authModalMode.value = mode
  showAuthModal.value = true
  closeMenu() // 关闭移动端菜单
}

const closeAuthModal = () => {
  showAuthModal.value = false
}

const handleAuthSuccess = (data) => {
  isAuthenticated.value = true
  currentUser.value = data.user
  showAuthModal.value = false

  // 显示成功消息
  console.log('认证成功:', data)
}

const handleLogout = async () => {
  try {
    await authUtils.clearAuth()
    isAuthenticated.value = false
    currentUser.value = null
    showUserDropdown.value = false
    console.log('登出成功')
  } catch (error) {
    console.error('登出失败:', error)
  }
}

// 用户下拉菜单相关方法
const toggleUserDropdown = () => {
  showUserDropdown.value = !showUserDropdown.value
}

// 处理编辑信息
const handleEditProfile = () => {
  showUserDropdown.value = false
  router.push('/profile')
}



// 获取默认头像
const getDefaultAvatar = () => {
  // 使用用户名生成默认头像
  const username = currentUser.value?.username || 'User'
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=ffc107&color=000&size=40&rounded=true`
}

// 头像加载错误处理
const handleAvatarError = (event) => {
  event.target.src = getDefaultAvatar()
}





// Smooth scroll navigation
const handleNavClick = (event, href) => {
  event.preventDefault()

  // 如果不在首页，先导航到首页
  if (router.currentRoute.value.path !== '/') {
    router.push('/').then(() => {
      // 等待路由切换完成后再滚动
      setTimeout(() => {
        scrollToSection(href)
      }, 100)
    })
  } else {
    // 在首页直接滚动
    scrollToSection(href)
  }

  // Close mobile menu after navigation
  closeMenu()
}

// 滚动到指定section
const scrollToSection = (href) => {
  const targetElement = document.querySelector(href)

  if (targetElement) {
    const offsetTop = targetElement.offsetTop - 80 // Account for fixed navbar

    window.scrollTo({
      top: offsetTop,
      behavior: 'smooth'
    })
  }
}

// Navbar scroll effect
const updateNavbarStyle = () => {
  const scrollY = window.scrollY
  const heroSection = document.querySelector('.hero-section')
  const heroHeight = heroSection ? heroSection.offsetHeight : 0

  if (scrollY < heroHeight - 100) {
    navbarClass.value = 'nav-transparent'
  } else {
    navbarClass.value = 'nav-solid'
    if (scrollY > 50) {
      navbarClass.value += ' scrolled'
    }
  }
}

// Click outside to close menu
const handleClickOutside = (event) => {
  const navbar = document.querySelector('.navbar')
  if (isMenuOpen.value && navbar && !navbar.contains(event.target)) {
    closeMenu()
  }

  // 关闭用户下拉菜单
  const userMenu = document.querySelector('.user-menu')
  if (showUserDropdown.value && userMenu && !userMenu.contains(event.target)) {
    showUserDropdown.value = false
  }
}

// Window resize handler
const handleResize = () => {
  if (window.innerWidth > 768 && isMenuOpen.value) {
    closeMenu()
  }
}

// Lifecycle hooks
onMounted(() => {
  updateNavbarStyle()
  window.addEventListener('scroll', updateNavbarStyle)
  document.addEventListener('click', handleClickOutside)
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('scroll', updateNavbarStyle)
  document.removeEventListener('click', handleClickOutside)
  window.removeEventListener('resize', handleResize)
})
</script>

<template>
  <header class="navbar" :class="navbarClass" role="banner">
    <nav class="nav-container">
      <!-- Brand Logo -->
      <div class="nav-brand">
        <a href="#" class="brand-link" aria-label="SoDesign.AI Home">
          <img
            :src="currentLogoUrl"
            alt="SoDesign.AI Logo"
            class="brand-logo"
            loading="lazy"
          >
        </a>
      </div>

      <!-- Desktop Navigation Links -->
      <div class="nav-menu" :class="{ 'mobile-open': isMenuOpen }">
        <ul class="nav-links" role="menubar">
          <li v-for="link in navLinks" :key="link.href" role="none">
            <a 
              :href="link.href" 
              class="nav-link" 
              role="menuitem"
              @click="handleNavClick($event, link.href)"
            >
              {{ link.text }}
            </a>
          </li>
        </ul>
      </div>

      <!-- Action Controls -->
      <div class="nav-actions">
        <!-- 未登录状态 -->
        <div v-if="!isAuthenticated" class="auth-buttons">
          <button
            class="btn btn-signin"
            @click="openAuthModal('login')"
          >
            登录
          </button>
          <button
            class="btn btn-register"
            @click="openAuthModal('register')"
          >
            注册
          </button>
        </div>

        <!-- 已登录状态 -->
        <div v-else class="user-menu">
          <div class="user-info" @click="toggleUserDropdown">
            <div class="user-avatar">
              <img
                :src="currentUser?.avatar_url || getDefaultAvatar()"
                :alt="currentUser?.username"
                class="avatar-image"
                @error="handleAvatarError"
              />
              <div class="online-indicator"></div>
            </div>
            <div class="user-dropdown" :class="{ 'show': showUserDropdown }">
              <div class="user-dropdown-header">
                <div class="user-avatar-large">
                  <img
                    :src="currentUser?.avatar_url || getDefaultAvatar()"
                    :alt="currentUser?.username"
                    class="avatar-image-large"
                    @error="handleAvatarError"
                  />
                </div>
                <div class="user-details">
                  <h4 class="user-display-name">{{ currentUser?.username }}</h4>
                  <p class="user-points">积分: {{ currentUser?.points || 0 }}</p>
                </div>
              </div>
              <div class="user-dropdown-actions">
                <button class="dropdown-action-item edit-item" @click="handleEditProfile">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                    <path d="m18.5 2.5 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                  编辑信息
                </button>
                <button class="dropdown-action-item logout-item" @click="handleLogout">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                    <polyline points="16,17 21,12 16,7"/>
                    <line x1="21" y1="12" x2="9" y2="12"/>
                  </svg>
                  退出登录
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Mobile Menu Toggle -->
      <button 
        class="mobile-menu-toggle" 
        :class="{ active: isMenuOpen }"
        @click="toggleMenu"
        aria-label="Toggle navigation menu"
        :aria-expanded="isMenuOpen"
      >
        <span class="hamburger-line" :class="{ active: isMenuOpen }"></span>
        <span class="hamburger-line" :class="{ active: isMenuOpen }"></span>
        <span class="hamburger-line" :class="{ active: isMenuOpen }"></span>
      </button>
    </nav>

    <!-- 认证模态框 -->
    <AuthModal
      :show="showAuthModal"
      :initial-mode="authModalMode"
      @close="closeAuthModal"
      @success="handleAuthSuccess"
    />


  </header>
</template>

<style scoped>
/* Navigation Styles */
.navbar {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    background: var(--nav-bg);
    backdrop-filter: blur(10px);
    border-bottom: 1px solid var(--border-color);
    z-index: 1000;
    transition: all 0.3s ease;
}

/* Navigation variants for different backgrounds */
.navbar.nav-transparent {
    background: rgba(255, 255, 255, 0.1);
    border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

.navbar.nav-transparent .brand-text {
    color: white;
}

.navbar.nav-transparent .nav-link {
    color: white;
}

.navbar.nav-transparent .nav-link:hover {
    color: var(--accent-color);
}

.navbar.nav-transparent .btn-signin {
    color: white;
    border-color: rgba(255, 255, 255, 0.3);
}

.navbar.nav-transparent .btn-signin:hover {
    background: rgba(255, 255, 255, 0.1);
}

.navbar.nav-transparent .hamburger-line {
    background: white;
}

.navbar.nav-solid {
    background: var(--nav-bg);
    border-bottom: 1px solid var(--border-color);
    box-shadow: 0 2px 20px var(--shadow-color);
}

.nav-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 1rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 70px;
    position: relative;
}

/* Brand Styles */
.nav-brand {
    display: flex;
    align-items: center;
    position: relative;
    z-index: 10;
}

.brand-link {
    display: flex;
    align-items: center;
    text-decoration: none;
    color: var(--text-primary);
    font-weight: 600;
    font-size: 1.25rem;
}

.brand-logo {
    height: 50px;
    width: auto;
    margin-right: 0.5rem;
    transition: all 0.3s ease;
    object-fit: contain;
    max-width: 200px;
}

/* Navigation Menu */
.nav-menu {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    align-items: center;
    justify-content: center;
}

.nav-links {
    display: flex;
    list-style: none;
    gap: 2rem;
    margin: 0;
    justify-content: center;
}

.nav-link {
    text-decoration: none;
    color: var(--text-primary);
    font-weight: 500;
    padding: 0.5rem 0;
    position: relative;
    transition: color 0.3s ease;
    font-size: 1.5rem;
}

.nav-link:hover {
    color: var(--accent-color);
}

.nav-link::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 0;
    height: 2px;
    background: var(--accent-color);
    transition: width 0.3s ease;
}

.nav-link:hover::after {
    width: 100%;
}

/* Action Controls */
.nav-actions {
    display: flex;
    align-items: center;
    gap: 1rem;
    position: relative;
    z-index: 10;
}

.auth-buttons {
    display: flex;
    align-items: center;
    gap: 0.75rem;
}

.btn {
    padding: 0.5rem 1rem;
    border-radius: 6px;
    font-size: 0.9rem;
    font-weight: 500;
    text-decoration: none;
    transition: all 0.2s ease;
    cursor: pointer;
    border: none;
    background: none;
}

.btn-signin {
    color: var(--text-primary);
    border: 1px solid var(--border-color);
}

.btn-signin:hover {
    background: var(--bg-secondary);
    border-color: var(--accent-color);
}

.btn-register {
    background: var(--accent-color);
    color: white;
}

.btn-register:hover {
    background: var(--accent-color-hover);
    transform: translateY(-1px);
}

.user-menu {
    position: relative;
}

.user-info {
    display: flex;
    align-items: center;
    cursor: pointer;
    position: relative;
}

/* 用户头像样式 */
.user-avatar {
    position: relative;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    overflow: hidden;
    border: 2px solid var(--accent-color);
    transition: all 0.2s ease;
}

.user-avatar:hover {
    border-color: var(--accent-color-hover);
    transform: scale(1.05);
}

.avatar-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 50%;
}

.online-indicator {
    position: absolute;
    bottom: 2px;
    right: 2px;
    width: 10px;
    height: 10px;
    background: #4caf50;
    border: 2px solid var(--bg-primary);
    border-radius: 50%;
}

.user-dropdown {
    position: absolute;
    top: calc(100% + 0.75rem);
    right: 0;
    background: rgba(255, 255, 255, 0.85);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 16px;
    box-shadow: 0 16px 40px rgba(0, 0, 0, 0.12);
    min-width: 280px;
    z-index: 1000;
    opacity: 0;
    visibility: hidden;
    transform: translateY(-10px);
    transition: all 0.3s ease;
    overflow: hidden;
}

.user-dropdown.show {
    opacity: 1;
    visibility: visible;
    transform: translateY(0);
}

/* 暗色主题的毛玻璃效果 */
[data-theme="dark"] .user-dropdown {
    background: rgba(18, 18, 18, 0.85);
    border: 1px solid rgba(255, 255, 255, 0.1);
}

/* 下拉菜单头部 */
.user-dropdown-header {
    padding: 1.25rem;
    background: linear-gradient(135deg, var(--accent-color), var(--accent-color-hover));
    color: #000;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
    text-align: center;
}

.user-avatar-large {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    overflow: hidden;
    border: 2px solid rgba(255, 255, 255, 0.4);
    flex-shrink: 0;
    box-shadow: 0 3px 8px rgba(0, 0, 0, 0.15);
}

.avatar-image-large {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 50%;
}

.user-details {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.25rem;
    width: 100%;
}

.user-display-name {
    font-size: 1.25rem;
    font-weight: 700;
    margin: 0;
    color: #000;
    word-break: break-word;
    line-height: 1.2;
    text-align: center;
}

.user-points {
    font-size: 1rem;
    margin: 0;
    color: rgba(0, 0, 0, 0.85);
    font-weight: 600;
    text-align: center;
}



/* 下拉菜单操作区域 */
.user-dropdown-actions {
    padding: 0.75rem;
    display: flex;
    gap: 0.625rem;
    justify-content: center;
    flex-wrap: nowrap;
}

.dropdown-action-item {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 0.625rem 0.75rem;
    background: rgba(255, 255, 255, 0.8);
    border: 1px solid rgba(255, 255, 255, 0.3);
    border-radius: 8px;
    color: var(--text-primary);
    cursor: pointer;
    transition: all 0.2s ease;
    font-size: 0.85rem;
    font-weight: 500;
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    white-space: nowrap;
    min-width: 0;
    flex: 1;
}

.dropdown-action-item:hover {
    background: rgba(255, 255, 255, 0.95);
    border-color: rgba(255, 255, 255, 0.5);
    transform: translateY(-1px);
}

.dropdown-action-item svg {
    flex-shrink: 0;
    opacity: 0.8;
}

.edit-item {
    color: #007bff;
    background: rgba(0, 123, 255, 0.1);
    border-color: rgba(0, 123, 255, 0.2);
}

.edit-item:hover {
    background: rgba(0, 123, 255, 0.15);
    border-color: rgba(0, 123, 255, 0.3);
    color: #007bff;
}

.logout-item {
    color: #dc3545;
    background: rgba(220, 53, 69, 0.1);
    border-color: rgba(220, 53, 69, 0.2);
}

.logout-item:hover {
    background: rgba(220, 53, 69, 0.15);
    border-color: rgba(220, 53, 69, 0.3);
    color: #dc3545;
}

/* 暗色主题下的按钮样式 */
[data-theme="dark"] .dropdown-action-item {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.2);
    color: var(--text-primary);
}

[data-theme="dark"] .dropdown-action-item:hover {
    background: rgba(255, 255, 255, 0.15);
    border-color: rgba(255, 255, 255, 0.3);
}

[data-theme="dark"] .edit-item {
    background: rgba(0, 123, 255, 0.2);
    border-color: rgba(0, 123, 255, 0.3);
}

[data-theme="dark"] .edit-item:hover {
    background: rgba(0, 123, 255, 0.25);
    border-color: rgba(0, 123, 255, 0.4);
}

[data-theme="dark"] .logout-item {
    background: rgba(220, 53, 69, 0.2);
    border-color: rgba(220, 53, 69, 0.3);
}

[data-theme="dark"] .logout-item:hover {
    background: rgba(220, 53, 69, 0.25);
    border-color: rgba(220, 53, 69, 0.4);
}



/* Mobile Menu Toggle */
.mobile-menu-toggle {
    display: none;
    flex-direction: column;
    background: none;
    border: none;
    cursor: pointer;
    padding: 0.5rem;
    gap: 0.25rem;
}

.hamburger-line {
    width: 24px;
    height: 2px;
    background: var(--text-primary);
    transition: all 0.3s ease;
}

.hamburger-line.active:nth-child(1) {
    transform: rotate(45deg) translate(5px, 5px);
}

.hamburger-line.active:nth-child(2) {
    opacity: 0;
}

.hamburger-line.active:nth-child(3) {
    transform: rotate(-45deg) translate(7px, -6px);
}

/* Mobile Navigation Styles */
@media (max-width: 768px) {
    .nav-menu {
        position: fixed;
        top: 70px;
        left: 0;
        right: 0;
        background: var(--nav-bg);
        backdrop-filter: blur(10px);
        border-bottom: 1px solid var(--border-color);
        transform: translateY(-100%);
        transition: transform 0.3s ease;
        z-index: 999;
        display: none;
    }

    .navbar.nav-transparent .nav-menu {
        background: rgba(18, 18, 18, 0.95);
        border-bottom: 1px solid rgba(255, 255, 255, 0.2);
    }

    .nav-menu.mobile-open {
        display: block;
        transform: translateY(0);
    }

    .nav-links {
        flex-direction: column;
        padding: 1rem;
        gap: 0;
    }

    .nav-links li {
        width: 100%;
    }

    .nav-link {
        display: block;
        padding: 1rem;
        border-bottom: 1px solid var(--border-color);
        text-align: center;
        font-size: 1.2rem;
    }

    .navbar.nav-transparent .nav-link {
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        color: white;
    }

    .nav-link:last-child {
        border-bottom: none;
    }

    .mobile-menu-toggle {
        display: flex;
    }

    .nav-actions {
        gap: 0.5rem;
    }

    .auth-buttons {
        gap: 0.5rem;
    }

    .btn {
        padding: 0.4rem 0.8rem;
        font-size: 0.8rem;
    }

    .user-avatar {
        width: 36px;
        height: 36px;
    }

    .user-dropdown {
        right: -1rem;
        min-width: 260px;
    }

    .user-dropdown-header {
        padding: 1rem;
        gap: 0.75rem;
        flex-direction: column;
        text-align: center;
    }

    .user-avatar-large {
        width: 45px;
        height: 45px;
    }

    .user-display-name {
        font-size: 1.125rem;
    }

    .user-points {
        font-size: 0.9rem;
    }

    .user-dropdown-actions {
        padding: 0.625rem;
    }

    .dropdown-action-item {
        padding: 0.5rem 0.625rem;
        font-size: 0.8rem;
        gap: 0.375rem;
    }
}
</style>
