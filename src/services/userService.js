import { getApiUrl, API_ENDPOINTS, REQUEST_CONFIG } from '../config/api_config.js'
import authModule from '../utils/auth.js'

const { authUtils } = authModule

// 获取token的辅助函数
const getToken = () => {
  // 从cookie中获取token
  const cookies = document.cookie.split(';')
  const tokenCookie = cookies.find(row => row.trim().startsWith('sodesign_access_token='))
  const token = tokenCookie ? tokenCookie.split('=')[1] : null
  console.log('🔑 获取到的token:', token ? token.substring(0, 20) + '...' : 'null')
  return token
}

/**
 * 用户资料服务
 */
export const userService = {
  /**
   * 获取用户资料
   */
  async getProfile() {
    try {
      const token = getToken()
      if (!token) {
        throw new Error('未找到认证令牌')
      }

      const apiUrl = getApiUrl(API_ENDPOINTS.AUTH.PROFILE)
      const headers = REQUEST_CONFIG.getAuthHeaders(token)

      console.log('📡 获取用户资料API调用:', {
        url: apiUrl,
        headers: headers,
        endpoint: API_ENDPOINTS.AUTH.PROFILE
      })

      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: headers,
        signal: AbortSignal.timeout(REQUEST_CONFIG.TIMEOUT)
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `HTTP ${response.status}`)
      }

      const responseData = await response.json()
      console.log('📡 获取用户资料API响应:', responseData)

      // 返回用户数据部分
      return responseData.user || responseData
    } catch (error) {
      console.error('获取用户资料失败:', error)
      throw error
    }
  },

  /**
   * 更新用户资料
   * @param {Object} profileData - 要更新的用户资料数据
   */
  async updateProfile(profileData) {
    try {
      const token = getToken()
      if (!token) {
        throw new Error('未找到认证令牌')
      }

      const apiUrl = getApiUrl(API_ENDPOINTS.AUTH.PROFILE_UPDATE)
      const headers = REQUEST_CONFIG.getAuthHeaders(token)

      console.log('📡 更新用户资料API调用:', {
        url: apiUrl,
        headers: headers,
        data: profileData,
        endpoint: API_ENDPOINTS.AUTH.PROFILE_UPDATE
      })

      const response = await fetch(apiUrl, {
        method: 'PUT',
        headers: headers,
        body: JSON.stringify(profileData),
        signal: AbortSignal.timeout(REQUEST_CONFIG.TIMEOUT)
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `HTTP ${response.status}`)
      }

      const responseData = await response.json()
      console.log('📡 更新用户资料API响应:', responseData)

      // 返回完整响应数据，因为更新接口可能返回不同的结构
      return responseData
    } catch (error) {
      console.error('更新用户资料失败:', error)
      throw error
    }
  },

  /**
   * 发送短信验证码
   * @param {string} phoneNumber - 手机号码
   */
  async sendSmsCode(phoneNumber) {
    try {
      const response = await fetch(getApiUrl(API_ENDPOINTS.AUTH.SMS_SEND), {
        method: 'POST',
        headers: REQUEST_CONFIG.DEFAULT_HEADERS,
        body: JSON.stringify({
          phone_number: phoneNumber
        }),
        signal: AbortSignal.timeout(REQUEST_CONFIG.TIMEOUT)
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `HTTP ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('发送短信验证码失败:', error)
      throw error
    }
  },

  /**
   * 验证短信验证码
   * @param {string} phoneNumber - 手机号码
   * @param {string} code - 验证码
   */
  async verifySmsCode(phoneNumber, code) {
    try {
      const response = await fetch(getApiUrl(API_ENDPOINTS.AUTH.SMS_VERIFY), {
        method: 'POST',
        headers: REQUEST_CONFIG.DEFAULT_HEADERS,
        body: JSON.stringify({
          phone_number: phoneNumber,
          code: code
        }),
        signal: AbortSignal.timeout(REQUEST_CONFIG.TIMEOUT)
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `HTTP ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('验证短信验证码失败:', error)
      throw error
    }
  },

  /**
   * 修改密码
   * @param {string} oldPassword - 旧密码
   * @param {string} newPassword - 新密码
   * @param {string} newPasswordConfirm - 确认新密码
   */
  async changePassword(oldPassword, newPassword, newPasswordConfirm) {
    try {
      const token = getToken()
      if (!token) {
        throw new Error('未找到认证令牌')
      }

      const response = await fetch(getApiUrl(API_ENDPOINTS.AUTH.CHANGE_PASSWORD), {
        method: 'POST',
        headers: REQUEST_CONFIG.getAuthHeaders(token),
        body: JSON.stringify({
          old_password: oldPassword,
          new_password: newPassword,
          new_password_confirm: newPasswordConfirm
        }),
        signal: AbortSignal.timeout(REQUEST_CONFIG.TIMEOUT)
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `HTTP ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error('修改密码失败:', error)
      throw error
    }
  }
}

export default userService
