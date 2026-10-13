import { reactive } from 'vue'

export const connection = reactive({ online: navigator.onLine, lastSync: null })

window.addEventListener('offline', () => { connection.online = false })
window.addEventListener('online', () => { connection.online = true })
