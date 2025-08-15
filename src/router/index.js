import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import UserProfile from '../views/UserProfile.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/profile',
    name: 'UserProfile',
    component: UserProfile,
    meta: {
      requiresAuth: true
    }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    // 如果有保存的位置（比如浏览器后退），恢复到该位置
    if (savedPosition) {
      return savedPosition
    }
    // 如果路由有hash，滚动到对应元素
    if (to.hash) {
      return {
        el: to.hash,
        behavior: 'smooth',
        top: 80 // 考虑导航栏高度
      }
    }
    // 默认滚动到顶部
    return { top: 0 }
  }
})

// 路由守卫 - 检查认证状态
router.beforeEach((to, from, next) => {
  // 检查路由是否需要认证
  if (to.matched.some(record => record.meta.requiresAuth)) {
    // 检查用户是否已登录 - 使用正确的token key
    const token = document.cookie.split(';').find(row => row.trim().startsWith('sodesign_access_token='))
    if (!token) {
      // 未登录，重定向到首页
      next('/')
      return
    }
  }
  next()
})

export default router
