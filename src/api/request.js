import axios from 'axios'
import { ElMessage } from 'element-plus'
import router from '@/router'

const request = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api/factory',
  timeout: 15000
})

request.interceptors.request.use((config) => {
  const token = localStorage.getItem('factory_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  const deviceCode = localStorage.getItem('factory_device_code')
  if (deviceCode) config.headers['X-Factory-Device'] = deviceCode
  return config
})

request.interceptors.response.use(
  (response) => {
    const body = response.data
    if (body?.code === 200) return body.data
    return Promise.reject(new Error(body?.message || '请求失败'))
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('factory_token')
      localStorage.removeItem('factory_device_code')
      if (router.currentRoute.value.path !== '/device-setup') router.push('/device-setup')
    }
    const message = error.response?.data?.message || (error.message === 'Network Error'
      ? '无法连接工厂后端，请确认 8081 服务已启动'
      : error.message)
    ElMessage.error(message)
    return Promise.reject(error)
  }
)

export default request
