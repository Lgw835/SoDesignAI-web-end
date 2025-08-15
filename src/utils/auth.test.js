/**
 * 自动刷新令牌功能测试
 * 这个文件包含了测试自动刷新令牌机制的测试用例
 */

import { authApi, authUtils } from './auth.js'

// 模拟测试环境
const mockFetch = (response, status = 200) => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: status >= 200 && status < 300,
      status,
      json: () => Promise.resolve(response),
    })
  )
}

// 模拟Cookie操作
const mockCookies = {}
Object.defineProperty(document, 'cookie', {
  get: () => {
    return Object.entries(mockCookies)
      .map(([key, value]) => `${key}=${value}`)
      .join('; ')
  },
  set: (cookieString) => {
    const [keyValue] = cookieString.split(';')
    const [key, value] = keyValue.split('=')
    if (value === '' || cookieString.includes('expires=Thu, 01 Jan 1970')) {
      delete mockCookies[key]
    } else {
      mockCookies[key] = value
    }
  }
})

describe('自动刷新令牌功能测试', () => {
  beforeEach(() => {
    // 清除所有mock
    jest.clearAllMocks()
    Object.keys(mockCookies).forEach(key => delete mockCookies[key])
    localStorage.clear()
  })

  test('应该在401错误时自动刷新token', async () => {
    // 设置初始token
    mockCookies['sodesign_access_token'] = 'expired_token'
    mockCookies['sodesign_refresh_token'] = 'valid_refresh_token'
    
    // 第一次请求返回401，第二次刷新token成功，第三次重试成功
    let callCount = 0
    global.fetch = jest.fn(() => {
      callCount++
      if (callCount === 1) {
        // 第一次请求返回401
        return Promise.resolve({
          ok: false,
          status: 401,
          json: () => Promise.resolve({ message: 'Token expired' })
        })
      } else if (callCount === 2) {
        // 刷新token请求成功
        return Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve({
            tokens: {
              access_token: 'new_access_token',
              refresh_token: 'new_refresh_token'
            }
          })
        })
      } else {
        // 重试请求成功
        return Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve({ data: 'success' })
        })
      }
    })

    // 发送请求
    const result = await authApi.getProfile()
    
    // 验证结果
    expect(result.data).toBe('success')
    expect(fetch).toHaveBeenCalledTimes(3)
    expect(mockCookies['sodesign_access_token']).toBe('new_access_token')
    expect(mockCookies['sodesign_refresh_token']).toBe('new_refresh_token')
  })

  test('应该在token快过期时主动刷新', async () => {
    // 设置即将过期的token（2分钟后过期）
    const expiresAt = Date.now() + 2 * 60 * 1000
    mockCookies['sodesign_access_token'] = 'expiring_token'
    mockCookies['sodesign_refresh_token'] = 'valid_refresh_token'
    mockCookies['sodesign_access_token_expires'] = expiresAt.toString()
    
    let callCount = 0
    global.fetch = jest.fn(() => {
      callCount++
      if (callCount === 1) {
        // 刷新token请求成功
        return Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve({
            tokens: {
              access_token: 'refreshed_access_token',
              refresh_token: 'refreshed_refresh_token'
            }
          })
        })
      } else {
        // 实际请求成功
        return Promise.resolve({
          ok: true,
          status: 200,
          json: () => Promise.resolve({ data: 'success' })
        })
      }
    })

    // 发送请求
    const result = await authApi.getProfile()
    
    // 验证结果
    expect(result.data).toBe('success')
    expect(fetch).toHaveBeenCalledTimes(2)
    expect(mockCookies['sodesign_access_token']).toBe('refreshed_access_token')
  })

  test('应该防止多个请求同时刷新token', async () => {
    // 设置过期的token
    mockCookies['sodesign_access_token'] = 'expired_token'
    mockCookies['sodesign_refresh_token'] = 'valid_refresh_token'
    
    let refreshCallCount = 0
    global.fetch = jest.fn((url) => {
      if (url.includes('/refresh/')) {
        refreshCallCount++
        // 模拟刷新请求需要一些时间
        return new Promise(resolve => {
          setTimeout(() => {
            resolve({
              ok: true,
              status: 200,
              json: () => Promise.resolve({
                tokens: {
                  access_token: 'new_access_token',
                  refresh_token: 'new_refresh_token'
                }
              })
            })
          }, 100)
        })
      } else {
        // 其他请求先返回401
        return Promise.resolve({
          ok: false,
          status: 401,
          json: () => Promise.resolve({ message: 'Token expired' })
        })
      }
    })

    // 同时发送多个请求
    const promises = [
      authApi.getProfile(),
      authApi.getProfile(),
      authApi.getProfile()
    ]

    await Promise.all(promises)
    
    // 验证只调用了一次刷新
    expect(refreshCallCount).toBe(1)
  })

  test('应该在刷新失败时清除认证信息', async () => {
    // 设置过期的token
    mockCookies['sodesign_access_token'] = 'expired_token'
    mockCookies['sodesign_refresh_token'] = 'invalid_refresh_token'
    
    // 模拟window.location
    delete window.location
    window.location = { pathname: '/profile', href: '' }
    
    global.fetch = jest.fn((url) => {
      if (url.includes('/refresh/')) {
        // 刷新token失败
        return Promise.resolve({
          ok: false,
          status: 401,
          json: () => Promise.resolve({ message: 'Invalid refresh token' })
        })
      } else {
        // 其他请求返回401
        return Promise.resolve({
          ok: false,
          status: 401,
          json: () => Promise.resolve({ message: 'Token expired' })
        })
      }
    })

    // 发送请求应该抛出错误
    await expect(authApi.getProfile()).rejects.toThrow('登录已过期，请重新登录')
    
    // 验证token被清除
    expect(mockCookies['sodesign_access_token']).toBeUndefined()
    expect(mockCookies['sodesign_refresh_token']).toBeUndefined()
    
    // 验证跳转到首页
    expect(window.location.href).toBe('/')
  })

  test('应该正确检测token过期时间', () => {
    // 测试token未过期
    const futureTime = Date.now() + 10 * 60 * 1000 // 10分钟后
    mockCookies['sodesign_access_token_expires'] = futureTime.toString()
    
    // 应该不认为快过期（默认5分钟缓冲）
    expect(authUtils.isTokenExpiringSoon()).toBe(false)
    
    // 测试token快过期
    const soonTime = Date.now() + 3 * 60 * 1000 // 3分钟后
    mockCookies['sodesign_access_token_expires'] = soonTime.toString()
    
    // 应该认为快过期
    expect(authUtils.isTokenExpiringSoon()).toBe(true)
    
    // 测试自定义缓冲时间
    expect(authUtils.isTokenExpiringSoon(2)).toBe(false) // 2分钟缓冲
    expect(authUtils.isTokenExpiringSoon(4)).toBe(true)  // 4分钟缓冲
  })
})

// 导出测试工具函数，供其他测试文件使用
export const testUtils = {
  mockFetch,
  mockCookies,
  clearMocks: () => {
    jest.clearAllMocks()
    Object.keys(mockCookies).forEach(key => delete mockCookies[key])
    localStorage.clear()
  }
}
