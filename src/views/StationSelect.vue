<template>
  <div class="select-page">
    <header class="simple-header">
      <div class="factory-brand"><img :src="brandLogo" alt="小木棒洗衣 Logo"><div><h1>小木棒洗衣工厂</h1><p>请选择当前工位</p></div></div>
      <div class="header-status">
        <div :class="['connection', connection.online ? 'ok' : 'off']"><span></span>{{ connection.online ? '系统已连接' : '系统未连接' }}</div>
        <small>设备 {{ deviceCode }} · {{ version }}</small>
        <small>上次同步：{{ connection.lastSync ? connection.lastSync.toLocaleTimeString('zh-CN') : '尚未同步' }}</small>
        <button type="button" class="check-connection" @click="checkStatus">检查连接</button>
      </div>
    </header>
    <main class="station-grid">
      <button v-for="(station, index) in stations" :key="station.key" class="station-card" :style="{ '--station-color': station.color }" @click="router.push(`/station/${station.key}`)">
        <span class="station-number">{{ String(index + 1).padStart(2, '0') }}</span>
        <el-icon><component :is="station.icon" /></el-icon>
        <strong>{{ station.name }}</strong><small>{{ station.instruction }}</small>
      </button>
    </main>
    <footer>每台设备进入对应工位后，将保持在该工位页面</footer>
  </div>
</template>

<script setup>
import { onMounted, onBeforeUnmount, ref } from 'vue'
import { useRouter } from 'vue-router'
import { stations } from '@/config/stations'
import { systemApi } from '@/api'
import brandLogo from '@/assets/brand-logo.png'
import { connection } from '@/api/connection'
import { getDeviceCode } from '@/api/deviceSession'
import { version as webVersion } from '../../package.json'
const router = useRouter()
const deviceCode = getDeviceCode()
const version = ref(`网页版 ${webVersion}`)
let timer
async function checkStatus() { try { await systemApi.status(true) } catch { /* Status is shown above. */ } }
onMounted(async () => {
  checkStatus()
  timer = setInterval(checkStatus, 30000)
  if (window.electronAPI?.getVersion) version.value = `客户端 ${await window.electronAPI.getVersion()}`
})
onBeforeUnmount(() => clearInterval(timer))
</script>
