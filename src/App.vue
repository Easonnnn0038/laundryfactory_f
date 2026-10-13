<template>
  <div v-if="!connection.online" class="connection-alert" role="alert">
    <span>工厂服务暂时无法连接。已填写的内容会保留，请检查网络后重试。</span>
    <button type="button" @click="retry">重试连接</button>
  </div>
  <router-view />
</template>

<script setup>
import { connection } from '@/api/connection'
import { systemApi } from '@/api'
async function retry() { try { await systemApi.status(true) } catch { /* Keep the offline notice visible. */ } }
</script>

