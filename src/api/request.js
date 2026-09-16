import axios from 'axios'
import { ElMessage } from 'element-plus'

const request = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api/factory',
  timeout: 15000
})

request.interceptors.request.use((config) => {
  const token = localStorage.getItem('factory_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

request.interceptors.response.use(
  (response) => {
    const body = response.data
    if (body?.code === 200) return body.data
    return Promise.reject(new Error(body?.message || '请求失败'))
  },
  (error) => {
    const message = error.response?.data?.message || (error.message === 'Network Error'
      ? '无法连接工厂后端，请确认 8081 服务已启动'
      : error.message)
    ElMessage.error(message)
    return Promise.reject(error)
  }
)

export default request

