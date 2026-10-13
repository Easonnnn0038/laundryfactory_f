const TOKEN_KEY = 'factory_token'
const DEVICE_KEY = 'factory_device_code'
const REASON_KEY = 'factory_auth_reason'

const tokenStorage = () => location.protocol === 'https:' ? localStorage : sessionStorage

export function getToken() {
  if (location.protocol !== 'https:') localStorage.removeItem(TOKEN_KEY)
  return tokenStorage().getItem(TOKEN_KEY)
}

export function saveDevice(code, token) {
  localStorage.setItem(DEVICE_KEY, code)
  localStorage.removeItem(TOKEN_KEY)
  sessionStorage.removeItem(TOKEN_KEY)
  tokenStorage().setItem(TOKEN_KEY, token)
  sessionStorage.removeItem(REASON_KEY)
}

export const getDeviceCode = () => localStorage.getItem(DEVICE_KEY) || ''
export function clearToken(reason = '') {
  localStorage.removeItem(TOKEN_KEY)
  sessionStorage.removeItem(TOKEN_KEY)
  if (reason) sessionStorage.setItem(REASON_KEY, reason)
}
export const getAuthReason = () => sessionStorage.getItem(REASON_KEY) || ''
