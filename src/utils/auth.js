/**
 * 认证相关工具函数
 * 处理用户认证、Token管理、API请求等
 */

import { getAuthApiUrl, REQUEST_CONFIG, HTTP_STATUS } from '../config/api_config.js'

// Token存储键名
const TOKEN_KEYS = {
  ACCESS_TOKEN: 'sodesign_access_token',
  REFRESH_TOKEN: 'sodesign_refresh_token',
  ACCESS_TOKEN_EXPIRES: 'sodesign_access_token_expires',
  USER_INFO: 'sodesign_user_info'
}

// Cookie操作工具类
class CookieManager {
  /**
   * 设置Cookie
   * @param {string} name - Cookie名称
   * @param {string} value - Cookie值
   * @param {number} days - 过期天数，默认7天
   * @param {object} options - 其他选项
   */
  static setCookie(name, value, days = 7, options = {}) {
    const expires = new Date()
    expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000))

    const defaultOptions = {
      expires: expires.toUTCString(),
      path: '/',
      secure: window.location.protocol === 'https:',
      sameSite: 'Lax'
    }

    const cookieOptions = { ...defaultOptions, ...options }

    let cookieString = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`

    Object.entries(cookieOptions).forEach(([key, val]) => {
      if (val === true) {
        cookieString += `; ${key}`
      } else if (val !== false && val !== null && val !== undefined) {
        cookieString += `; ${key}=${val}`
      }
    })

    document.cookie = cookieString
    console.log(`🍪 Cookie设置成功: ${name}`)
  }

  /**
   * 获取Cookie
   * @param {string} name - Cookie名称
   * @returns {string|null} Cookie值
   */
  static getCookie(name) {
    const nameEQ = encodeURIComponent(name) + '='
    const cookies = document.cookie.split(';')

    for (let cookie of cookies) {
      let c = cookie.trim()
      if (c.indexOf(nameEQ) === 0) {
        const value = decodeURIComponent(c.substring(nameEQ.length))
        console.log(`🍪 Cookie获取成功: ${name}`)
        return value
      }
    }

    console.log(`🍪 Cookie不存在: ${name}`)
    return null
  }

  /**
   * 删除Cookie
   * @param {string} name - Cookie名称
   * @param {string} path - Cookie路径
   */
  static deleteCookie(name, path = '/') {
    document.cookie = `${encodeURIComponent(name)}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path}`
    console.log(`🍪 Cookie删除成功: ${name}`)
  }

  /**
   * 检查Cookie是否存在
   * @param {string} name - Cookie名称
   * @returns {boolean} 是否存在
   */
  static hasCookie(name) {
    return this.getCookie(name) !== null
  }

  /**
   * 清除所有相关Cookie
   * @param {string[]} names - Cookie名称数组
   */
  static clearCookies(names) {
    names.forEach(name => this.deleteCookie(name))
    console.log('🍪 相关Cookie已清除')
  }
}

/**
 * HTTP请求工具类
 */
class ApiClient {
  constructor() {
    this.baseURL = ''
    // 用于防止多个请求同时刷新token的Promise缓存
    this.refreshPromise = null
    // 标记是否正在刷新token
    this.isRefreshing = false
  }

  /**
   * 发送HTTP请求
   * @param {string} url - 请求URL
   * @param {Object} options - 请求选项
   * @param {boolean} isRetry - 是否为重试请求
   * @returns {Promise} 请求结果
   */
  async request(url, options = {}, isRetry = false) {
    const config = {
      method: 'GET',
      headers: REQUEST_CONFIG.DEFAULT_HEADERS,
      ...options
    }

    // 检查token是否快过期，如果是则主动刷新
    if (!isRetry && !url.includes('/refresh/') && this.getAccessToken() && this.isTokenExpiringSoon()) {
      console.log('🔄 Token即将过期，主动刷新')
      try {
        await this.handleTokenRefresh()
        console.log('🔄 主动刷新Token成功')
      } catch (error) {
        console.error('🔄 主动刷新Token失败:', error)
        // 主动刷新失败，继续使用当前token，让后续的401处理
      }
    }

    // 添加认证头
    const token = this.getAccessToken()
    if (token && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`
    }

    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), REQUEST_CONFIG.TIMEOUT)

      const response = await fetch(url, {
        mode: 'cors',
        credentials: 'include',
        ...config,
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      // 检查响应状态
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))

        // 如果是401错误且不是重试请求，尝试刷新token
        if (response.status === HTTP_STATUS.UNAUTHORIZED && !isRetry && !url.includes('/refresh/')) {
          console.log('🔄 检测到401错误，尝试刷新token')

          try {
            await this.handleTokenRefresh()
            // 刷新成功，重试原请求
            console.log('🔄 Token刷新成功，重试原请求')
            return this.request(url, options, true)
          } catch (refreshError) {
            console.error('🔄 Token刷新失败:', refreshError)
            // 刷新失败，清除认证信息并跳转到首页
            this.handleAuthFailure()
            throw new ApiError(401, '登录已过期，请重新登录')
          }
        }

        throw new ApiError(response.status, errorData.message || '请求失败', errorData)
      }

      return await response.json()
    } catch (error) {
      if (error.name === 'AbortError') {
        throw new ApiError(0, '请求超时，请检查网络连接')
      }
      throw error
    }
  }

  /**
   * GET请求
   */
  async get(url, params = {}) {
    const urlWithParams = new URL(url)
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null) {
        urlWithParams.searchParams.append(key, params[key])
      }
    })
    return this.request(urlWithParams.toString())
  }

  /**
   * POST请求
   */
  async post(url, data = {}) {
    return this.request(url, {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  /**
   * PUT请求
   */
  async put(url, data = {}) {
    return this.request(url, {
      method: 'PUT',
      body: JSON.stringify(data)
    })
  }

  /**
   * DELETE请求
   */
  async delete(url) {
    return this.request(url, {
      method: 'DELETE'
    })
  }

  /**
   * 获取访问令牌
   */
  getAccessToken() {
    return CookieManager.getCookie(TOKEN_KEYS.ACCESS_TOKEN)
  }

  /**
   * 获取刷新令牌
   */
  getRefreshToken() {
    return CookieManager.getCookie(TOKEN_KEYS.REFRESH_TOKEN)
  }

  /**
   * 保存令牌
   */
  saveTokens(accessToken, refreshToken) {
    // Access Token 设置较短过期时间（1天）
    CookieManager.setCookie(TOKEN_KEYS.ACCESS_TOKEN, accessToken, 1, {
      httpOnly: false, // 需要JavaScript访问
      secure: window.location.protocol === 'https:',
      sameSite: 'Lax'
    })

    // 保存Access Token过期时间（30分钟后过期）
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000) // 30分钟
    CookieManager.setCookie(TOKEN_KEYS.ACCESS_TOKEN_EXPIRES, expiresAt.getTime().toString(), 1, {
      httpOnly: false,
      secure: window.location.protocol === 'https:',
      sameSite: 'Lax'
    })

    if (refreshToken) {
      // Refresh Token 设置较长过期时间（7天）
      CookieManager.setCookie(TOKEN_KEYS.REFRESH_TOKEN, refreshToken, 7, {
        httpOnly: false, // 需要JavaScript访问
        secure: window.location.protocol === 'https:',
        sameSite: 'Lax'
      })
    }

    console.log('🔐 Token已保存到Cookie')
  }

  /**
   * 清除令牌
   */
  clearTokens() {
    CookieManager.deleteCookie(TOKEN_KEYS.ACCESS_TOKEN)
    CookieManager.deleteCookie(TOKEN_KEYS.REFRESH_TOKEN)
    CookieManager.deleteCookie(TOKEN_KEYS.ACCESS_TOKEN_EXPIRES)
    localStorage.removeItem(TOKEN_KEYS.USER_INFO) // 用户信息仍使用localStorage
    console.log('🔐 Token已从Cookie中清除')
  }

  /**
   * 保存用户信息
   */
  saveUserInfo(userInfo) {
    localStorage.setItem(TOKEN_KEYS.USER_INFO, JSON.stringify(userInfo))
  }

  /**
   * 获取用户信息
   */
  getUserInfo() {
    const userInfo = localStorage.getItem(TOKEN_KEYS.USER_INFO)
    return userInfo ? JSON.parse(userInfo) : null
  }

  /**
   * 检查是否已登录
   */
  isAuthenticated() {
    return !!this.getAccessToken()
  }

  /**
   * 检查Access Token是否快过期
   * @param {number} bufferMinutes - 提前多少分钟算作快过期，默认5分钟
   * @returns {boolean} 是否快过期
   */
  isTokenExpiringSoon(bufferMinutes = 5) {
    const expiresAtStr = CookieManager.getCookie(TOKEN_KEYS.ACCESS_TOKEN_EXPIRES)
    if (!expiresAtStr) {
      return false
    }

    const expiresAt = parseInt(expiresAtStr)
    const now = Date.now()
    const bufferTime = bufferMinutes * 60 * 1000 // 转换为毫秒

    return (expiresAt - now) <= bufferTime
  }

  /**
   * 处理token刷新
   * 使用Promise缓存防止多个请求同时刷新
   */
  async handleTokenRefresh() {
    // 如果已经有刷新请求在进行中，等待它完成
    if (this.refreshPromise) {
      console.log('🔄 等待现有的token刷新完成')
      return this.refreshPromise
    }

    // 创建新的刷新Promise
    this.refreshPromise = this.performTokenRefresh()

    try {
      const result = await this.refreshPromise
      return result
    } finally {
      // 清除Promise缓存
      this.refreshPromise = null
    }
  }

  /**
   * 执行实际的token刷新操作
   */
  async performTokenRefresh() {
    const refreshToken = this.getRefreshToken()
    if (!refreshToken) {
      throw new ApiError(401, '没有刷新令牌')
    }

    console.log('🔄 开始刷新token')

    const response = await fetch(getAuthApiUrl('REFRESH_TOKEN'), {
      method: 'POST',
      headers: REQUEST_CONFIG.DEFAULT_HEADERS,
      body: JSON.stringify({
        refresh_token: refreshToken
      }),
      mode: 'cors',
      credentials: 'include'
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new ApiError(response.status, errorData.message || 'Token刷新失败', errorData)
    }

    const data = await response.json()

    if (data.tokens) {
      // 保存新的tokens
      this.saveTokens(data.tokens.access_token, data.tokens.refresh_token)
      console.log('🔄 Token刷新成功')
    } else {
      throw new ApiError(500, 'Token刷新响应格式错误')
    }

    return data
  }

  /**
   * 处理认证失败
   * 清除所有认证信息并跳转到首页
   */
  handleAuthFailure() {
    console.log('🔄 认证失败，清除认证信息')
    this.clearTokens()

    // 跳转到首页
    if (typeof window !== 'undefined' && window.location) {
      // 如果当前不在首页，则跳转到首页
      if (window.location.pathname !== '/') {
        window.location.href = '/'
      }
    }
  }
}

/**
 * API错误类
 */
class ApiError extends Error {
  constructor(status, message, data = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.data = data
  }
}

// 创建API客户端实例
const apiClient = new ApiClient()

/**
 * 认证API函数
 */
export const authApi = {
  /**
   * 发送短信验证码
   * @param {string} phoneNumber - 手机号
   * @returns {Promise} 发送结果
   */
  async sendSmsCode(phoneNumber) {
    return apiClient.post(getAuthApiUrl('SMS_SEND'), {
      phone_number: phoneNumber
    })
  },

  /**
   * 验证短信验证码
   * @param {string} phoneNumber - 手机号
   * @param {string} code - 验证码
   * @returns {Promise} 验证结果
   */
  async verifySmsCode(phoneNumber, code) {
    return apiClient.post(getAuthApiUrl('SMS_VERIFY'), {
      phone_number: phoneNumber,
      code: code
    })
  },

  /**
   * 用户注册
   * @param {Object} userData - 用户数据
   * @returns {Promise} 注册结果
   */
  async register(userData) {
    const response = await apiClient.post(getAuthApiUrl('REGISTER'), userData)
    
    // 保存令牌和用户信息
    if (response.tokens) {
      apiClient.saveTokens(response.tokens.access_token, response.tokens.refresh_token)
    }
    if (response.user) {
      apiClient.saveUserInfo(response.user)
    }
    
    return response
  },

  /**
   * 用户登录
   * @param {string} username - 用户名
   * @param {string} password - 密码
   * @returns {Promise} 登录结果
   */
  async login(username, password) {
    const response = await apiClient.post(getAuthApiUrl('LOGIN'), {
      username,
      password
    })
    
    // 保存令牌和用户信息
    if (response.tokens) {
      apiClient.saveTokens(response.tokens.access_token, response.tokens.refresh_token)
    }
    if (response.user) {
      apiClient.saveUserInfo(response.user)
    }
    
    return response
  },

  /**
   * 用户登出
   * @returns {Promise} 登出结果
   */
  async logout() {
    try {
      await apiClient.post(getAuthApiUrl('LOGOUT'))
    } finally {
      // 无论API调用是否成功，都清除本地令牌
      apiClient.clearTokens()
    }
  },

  /**
   * 发送忘记密码验证码
   * @param {string} phoneNumber - 手机号
   * @returns {Promise} 发送结果
   */
  async sendForgotPasswordCode(phoneNumber) {
    return apiClient.post(getAuthApiUrl('FORGOT_PASSWORD'), {
      phone_number: phoneNumber
    })
  },

  /**
   * 重置密码
   * @param {string} phoneNumber - 手机号
   * @param {string} smsCode - 短信验证码
   * @param {string} newPassword - 新密码
   * @param {string} confirmPassword - 确认密码
   * @returns {Promise} 重置结果
   */
  async resetPassword(phoneNumber, smsCode, newPassword, confirmPassword) {
    return apiClient.post(getAuthApiUrl('RESET_PASSWORD'), {
      phone_number: phoneNumber,
      sms_code: smsCode,
      new_password: newPassword,
      confirm_password: confirmPassword
    })
  },

  /**
   * 获取用户资料
   * @returns {Promise} 用户资料
   */
  async getProfile() {
    return apiClient.get(getAuthApiUrl('PROFILE'))
  },



  /**
   * 刷新访问令牌
   * @returns {Promise} 新的访问令牌
   */
  async refreshToken() {
    const refreshToken = apiClient.getRefreshToken()
    if (!refreshToken) {
      throw new ApiError(401, '没有刷新令牌')
    }

    const response = await apiClient.post(getAuthApiUrl('REFRESH_TOKEN'), {
      refresh_token: refreshToken
    })

    if (response.tokens) {
      // 保存新的access token和refresh token（如果有的话）
      apiClient.saveTokens(response.tokens.access_token, response.tokens.refresh_token)
    }

    return response
  }
}

/**
 * 工具函数
 */
export const authUtils = {
  /**
   * 检查是否已登录
   */
  isAuthenticated: () => apiClient.isAuthenticated(),

  /**
   * 获取当前用户信息
   */
  getCurrentUser: () => apiClient.getUserInfo(),

  /**
   * 清除认证信息
   */
  clearAuth: () => apiClient.clearTokens(),

  /**
   * 保存用户信息
   */
  saveUserInfo: (userInfo) => apiClient.saveUserInfo(userInfo),

  /**
   * 格式化API错误信息
   * @param {Error} error - 错误对象
   * @returns {string} 格式化的错误信息
   */
  formatApiError(error) {
    if (error instanceof ApiError) {
      // 处理API错误
      if (error.data && error.data.errors) {
        // 处理字段验证错误
        const fieldErrors = Object.values(error.data.errors).flat()
        return fieldErrors.join(', ')
      }
      return error.message
    }
    
    // 处理网络错误
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      return '网络连接失败，请检查网络设置'
    }
    
    return error.message || '未知错误'
  }
}

// 导出API错误类
export { ApiError }

// 导出默认对象
export default {
  authApi,
  authUtils,
  ApiError
}
