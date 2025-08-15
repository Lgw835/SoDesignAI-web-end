/**
 * 表单验证工具函数
 * 提供各种字段验证规则和验证方法
 */

/**
 * 验证规则对象
 */
export const validationRules = {
  /**
   * 必填字段验证
   * @param {any} value - 待验证的值
   * @param {string} fieldName - 字段名称
   * @returns {string|null} 错误信息或null
   */
  required(value, fieldName = '此字段') {
    if (value === null || value === undefined || value === '') {
      return `${fieldName}不能为空`
    }
    if (typeof value === 'string' && value.trim() === '') {
      return `${fieldName}不能为空`
    }
    return null
  },

  /**
   * 手机号验证（中国大陆手机号）
   * @param {string} phoneNumber - 手机号
   * @returns {string|null} 错误信息或null
   */
  phoneNumber(phoneNumber) {
    if (!phoneNumber) {
      return '手机号不能为空'
    }
    
    // 中国大陆手机号正则表达式
    const phoneRegex = /^1[3-9]\d{9}$/
    
    if (!phoneRegex.test(phoneNumber)) {
      return '请输入正确的手机号格式'
    }
    
    return null
  },

  /**
   * 密码强度验证
   * @param {string} password - 密码
   * @returns {string|null} 错误信息或null
   */
  password(password) {
    if (!password) {
      return '密码不能为空'
    }
    
    if (password.length < 6) {
      return '密码长度不能少于6位'
    }
    
    if (password.length > 128) {
      return '密码长度不能超过128位'
    }
    
    // 检查是否包含至少一个字母和一个数字（可选的强密码要求）
    // const strongPasswordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{6,}$/
    // if (!strongPasswordRegex.test(password)) {
    //   return '密码必须包含至少一个字母和一个数字'
    // }
    
    return null
  },

  /**
   * 确认密码验证
   * @param {string} confirmPassword - 确认密码
   * @param {string} originalPassword - 原密码
   * @returns {string|null} 错误信息或null
   */
  confirmPassword(confirmPassword, originalPassword) {
    if (!confirmPassword) {
      return '请确认密码'
    }
    
    if (confirmPassword !== originalPassword) {
      return '两次输入的密码不一致'
    }
    
    return null
  },

  /**
   * 用户名验证
   * @param {string} username - 用户名
   * @returns {string|null} 错误信息或null
   */
  username(username) {
    if (!username) {
      return '用户名不能为空'
    }
    
    if (username.length < 2) {
      return '用户名长度不能少于2位'
    }
    
    if (username.length > 50) {
      return '用户名长度不能超过50位'
    }
    
    // 用户名只能包含字母、数字、下划线和中文
    const usernameRegex = /^[\w\u4e00-\u9fa5]+$/
    if (!usernameRegex.test(username)) {
      return '用户名只能包含字母、数字、下划线和中文'
    }
    
    return null
  },

  /**
   * 短信验证码验证
   * @param {string} code - 验证码
   * @returns {string|null} 错误信息或null
   */
  smsCode(code) {
    if (!code) {
      return '验证码不能为空'
    }
    
    // 验证码必须是6位数字
    const codeRegex = /^\d{6}$/
    if (!codeRegex.test(code)) {
      return '验证码必须是6位数字'
    }
    
    return null
  },

  /**
   * 邮箱验证
   * @param {string} email - 邮箱地址
   * @returns {string|null} 错误信息或null
   */
  email(email) {
    if (!email) {
      return '邮箱地址不能为空'
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return '请输入正确的邮箱格式'
    }
    
    return null
  },

  /**
   * 长度验证
   * @param {string} value - 待验证的值
   * @param {number} min - 最小长度
   * @param {number} max - 最大长度
   * @param {string} fieldName - 字段名称
   * @returns {string|null} 错误信息或null
   */
  length(value, min, max, fieldName = '此字段') {
    if (!value) {
      return null // 长度验证不检查必填，由required规则处理
    }
    
    const length = value.toString().length
    
    if (min !== undefined && length < min) {
      return `${fieldName}长度不能少于${min}位`
    }
    
    if (max !== undefined && length > max) {
      return `${fieldName}长度不能超过${max}位`
    }
    
    return null
  }
}

/**
 * 表单验证器类
 */
export class FormValidator {
  constructor() {
    this.rules = {}
    this.errors = {}
  }

  /**
   * 添加字段验证规则
   * @param {string} field - 字段名
   * @param {Array} rules - 验证规则数组
   */
  addField(field, rules) {
    this.rules[field] = rules
    this.errors[field] = null
  }

  /**
   * 验证单个字段
   * @param {string} field - 字段名
   * @param {any} value - 字段值
   * @param {Object} allValues - 所有字段值（用于关联验证）
   * @returns {string|null} 错误信息或null
   */
  validateField(field, value, allValues = {}) {
    const fieldRules = this.rules[field]
    if (!fieldRules) {
      return null
    }

    for (const rule of fieldRules) {
      let error = null

      if (typeof rule === 'function') {
        // 自定义验证函数
        error = rule(value, allValues)
      } else if (typeof rule === 'object') {
        // 规则对象 { rule: 'required', message: '自定义错误信息' }
        const { rule: ruleName, message, ...params } = rule
        if (validationRules[ruleName]) {
          error = validationRules[ruleName](value, ...Object.values(params))
          if (error && message) {
            error = message
          }
        }
      } else if (typeof rule === 'string') {
        // 规则名称字符串
        if (validationRules[rule]) {
          error = validationRules[rule](value)
        }
      }

      if (error) {
        this.errors[field] = error
        return error
      }
    }

    this.errors[field] = null
    return null
  }

  /**
   * 验证所有字段
   * @param {Object} values - 所有字段值
   * @returns {Object} 验证结果 { isValid: boolean, errors: Object }
   */
  validateAll(values) {
    const errors = {}
    let isValid = true

    for (const field in this.rules) {
      const error = this.validateField(field, values[field], values)
      if (error) {
        errors[field] = error
        isValid = false
      }
    }

    this.errors = errors
    return { isValid, errors }
  }

  /**
   * 获取字段错误信息
   * @param {string} field - 字段名
   * @returns {string|null} 错误信息或null
   */
  getFieldError(field) {
    return this.errors[field]
  }

  /**
   * 清除字段错误
   * @param {string} field - 字段名
   */
  clearFieldError(field) {
    this.errors[field] = null
  }

  /**
   * 清除所有错误
   */
  clearAllErrors() {
    for (const field in this.errors) {
      this.errors[field] = null
    }
  }

  /**
   * 检查是否有错误
   * @returns {boolean} 是否有错误
   */
  hasErrors() {
    return Object.values(this.errors).some(error => error !== null)
  }
}

/**
 * 创建常用的表单验证器
 */
export const createValidators = {
  /**
   * 创建登录表单验证器
   */
  login() {
    const validator = new FormValidator()
    validator.addField('username', ['required', 'username'])
    validator.addField('password', ['required'])
    return validator
  },

  /**
   * 创建注册表单验证器
   */
  register() {
    const validator = new FormValidator()
    validator.addField('username', ['required', 'username'])
    validator.addField('phoneNumber', ['required', 'phoneNumber'])
    validator.addField('password', ['required', 'password'])
    validator.addField('passwordConfirm', [
      'required',
      (value, allValues) => validationRules.confirmPassword(value, allValues.password)
    ])
    validator.addField('smsCode', ['required', 'smsCode'])
    return validator
  },

  /**
   * 创建忘记密码表单验证器
   */
  forgotPassword() {
    const validator = new FormValidator()
    validator.addField('phoneNumber', ['required', 'phoneNumber'])
    return validator
  },

  /**
   * 创建重置密码表单验证器
   */
  resetPassword() {
    const validator = new FormValidator()
    validator.addField('phoneNumber', ['required', 'phoneNumber'])
    validator.addField('smsCode', ['required', 'smsCode'])
    validator.addField('newPassword', ['required', 'password'])
    validator.addField('confirmPassword', [
      'required',
      (value, allValues) => validationRules.confirmPassword(value, allValues.newPassword)
    ])
    return validator
  },


}

/**
 * 工具函数
 */
export const validationUtils = {
  /**
   * 防抖验证函数
   * @param {Function} validateFn - 验证函数
   * @param {number} delay - 延迟时间（毫秒）
   * @returns {Function} 防抖后的验证函数
   */
  debounceValidation(validateFn, delay = 300) {
    let timeoutId = null
    return (...args) => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => validateFn(...args), delay)
    }
  },

  /**
   * 格式化手机号显示（隐藏中间4位）
   * @param {string} phoneNumber - 手机号
   * @returns {string} 格式化后的手机号
   */
  formatPhoneNumber(phoneNumber) {
    if (!phoneNumber || phoneNumber.length !== 11) {
      return phoneNumber
    }
    return `${phoneNumber.slice(0, 3)}****${phoneNumber.slice(7)}`
  }
}

export default {
  validationRules,
  FormValidator,
  createValidators,
  validationUtils
}
