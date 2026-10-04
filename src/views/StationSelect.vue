<template>
  <div class="select-page">
    <header class="simple-header">
      <div class="factory-brand"><img :src="brandLogo" alt="小木棒洗衣 Logo"><div><h1>小木棒洗衣工厂</h1><p>请选择当前工位</p></div></div>
      <div :class="['connection', backendOnline ? 'ok' : 'off']"><span></span>{{ backendOnline ? '系统已连接' : '系统未连接' }}</div>
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
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { stations } from '@/config/stations'
import { systemApi } from '@/api'
import brandLogo from '@/assets/brand-logo.png'
const router = useRouter()
const backendOnline = ref(false)
onMounted(async () => { try { await systemApi.status(); backendOnline.value = true } catch { backendOnline.value = false } })
</script>
