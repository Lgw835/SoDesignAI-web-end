/**
 * API配置文件
 * 统一管理所有API请求网址，便于后续更换服务器地址
 */

// 环境配置
const ENV = {
  DEVELOPMENT: 'development',
  PRODUCTION: 'production'
}

// 当前环境（可以通过环境变量或其他方式动态设置）
const CURRENT_ENV = process.env.NODE_ENV === 'production' ? ENV.PRODUCTION : ENV.DEVELOPMENT

// 服务器地址配置
const SERVER_CONFIG = {
  [ENV.DEVELOPMENT]: {
    BASE_URL: 'http://localhost:8000',
    API_PREFIX: '/api/auth'
  },
  [ENV.PRODUCTION]: {
    BASE_URL: 'https://sodesignai.com',
    API_PREFIX: '/api/auth'
  }
}

// 获取当前环境的配置
const getCurrentConfig = () => {
  return SERVER_CONFIG[CURRENT_ENV]
}

// 构建完整的API URL
const buildApiUrl = (endpoint) => {
  const config = getCurrentConfig()
  return `${config.BASE_URL}${config.API_PREFIX}${endpoint}`
}

// API端点配置
export const API_ENDPOINTS = {
  // 用户认证相关
  AUTH: {
    // 短信验证码
    SMS_SEND: '/sms/send/',
    SMS_VERIFY: '/sms/verify/',
    
    // 用户注册和登录
    REGISTER: '/register/',
    LOGIN: '/login/',
    LOGOUT: '/logout/',
    
    // 密码管理
    FORGOT_PASSWORD: '/forgot-password/',
    RESET_PASSWORD: '/reset-password/',
    CHANGE_PASSWORD: '/password/change/',
    
    // 用户资料
    PROFILE: '/profile/',
    PROFILE_UPDATE: '/profile/update/',
    
    // Token管理
    REFRESH_TOKEN: '/refresh/'
  },
  
  // 项目分类相关
  PROJECT_CATEGORIES: '/project-categories/',
  
  // 积分相关
  POINTS: {
    USAGE_RECORDS: '/point-usage-records/',
    CREATE_RECORD: '/point-usage-records/create/'
  },
  
  // 管理后台相关（如果需要）
  ADMIN: {
    DASHBOARD_STATS: '/admin/dashboard/stats/',
    USERS: '/admin/users/',
    TOKENS: '/admin/tokens/',
    POINTS_RECORDS: '/admin/points/records/'
  }
}

// 构建API URL的工具函数
export const getApiUrl = (endpoint) => {
  return buildApiUrl(endpoint)
}

// 获取完整的API端点URL
export const getAuthApiUrl = (authEndpoint) => {
  return getApiUrl(API_ENDPOINTS.AUTH[authEndpoint])
}

// HTTP请求配置
export const REQUEST_CONFIG = {
  // 请求超时时间（毫秒）
  TIMEOUT: 10000,
  
  // 默认请求头
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  
  // 认证请求头
  getAuthHeaders: (token) => ({
    ...REQUEST_CONFIG.DEFAULT_HEADERS,
    'Authorization': `Bearer ${token}`
  })
}

// 响应状态码
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500
}

// 业务错误码（根据API文档）
export const BUSINESS_ERROR_CODES = {
  // 用户认证相关
  USER_NOT_FOUND: 'USER_NOT_FOUND',
  INVALID_PASSWORD: 'INVALID_PASSWORD',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  TOKEN_INVALID: 'TOKEN_INVALID',
  PERMISSION_DENIED: 'PERMISSION_DENIED',
  
  // 积分系统相关
  INSUFFICIENT_POINTS: 'INSUFFICIENT_POINTS',
  INVALID_PROJECT_CATEGORY: 'INVALID_PROJECT_CATEGORY',
  POINTS_MUST_POSITIVE: 'POINTS_MUST_POSITIVE',
  
  // 数据验证相关
  FIELD_REQUIRED: 'FIELD_REQUIRED',
  FIELD_INVALID: 'FIELD_INVALID',
  DUPLICATE_VALUE: 'DUPLICATE_VALUE'
}

// 导出配置信息
export const CONFIG_INFO = {
  CURRENT_ENV,
  BASE_URL: getCurrentConfig().BASE_URL,
  API_PREFIX: getCurrentConfig().API_PREFIX,
  FULL_API_BASE: `${getCurrentConfig().BASE_URL}${getCurrentConfig().API_PREFIX}`
}

// 调试信息（仅在开发环境下显示）
if (CURRENT_ENV === ENV.DEVELOPMENT) {
  console.log('🔧 API配置信息:', CONFIG_INFO)
  console.log('📡 可用的API端点:', API_ENDPOINTS)
}

export default {
  API_ENDPOINTS,
  getApiUrl,
  getAuthApiUrl,
  REQUEST_CONFIG,
  HTTP_STATUS,
  BUSINESS_ERROR_CODES,
  CONFIG_INFO
}
