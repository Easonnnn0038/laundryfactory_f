import axios from 'axios'
import { ElMessage } from 'element-plus'
import router from '@/router'
import { clearToken, getDeviceCode, getToken } from './deviceSession'
import { connection } from './connection'

const request = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api/factory',
  timeout: 15000
})

request.interceptors.request.use((config) => {
  const token = getToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  const deviceCode = getDeviceCode()
  if (deviceCode) config.headers['X-Factory-Device'] = deviceCode
  return config
})

request.interceptors.response.use(
  (response) => {
    connection.online = true
    connection.lastSync = new Date()
    const body = response.data
    if (body?.code === 200) return body.data
    const message = body?.message || '请求失败，请重试'
    if (!response.config.silent) ElMessage.error(message)
    return Promise.reject(new Error(message))
  },
  async (error) => {
    const retryable = !error.response || error.response.status === 503
    if (retryable && error.config?.method?.toLowerCase() === 'get' && !error.config._retried) {
      error.config._retried = true
      await new Promise(resolve => setTimeout(resolve, 400))
      return request(error.config)
    }
    if (retryable) connection.online = false
    else if (error.response) connection.online = true
    if (error.response?.status === 401) {
      clearToken('设备授权已失效。')
      if (router.currentRoute.value.path !== '/device-setup') router.push('/device-setup')
    }
    const message = error.response?.status === 401 ? '设备授权已失效，请重新输入令牌'
      : retryable ? '连接中断，请检查网络或服务状态后重试'
        : error.response?.data?.message || error.message
    if (!error.config?.silent) ElMessage.error(message)
    return Promise.reject(error)
  }
)

export default request
