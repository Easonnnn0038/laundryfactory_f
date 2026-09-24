<template>
  <main class="setup-page">
    <el-card class="setup-card">
      <h1>工厂设备授权</h1>
      <p>请输入管理员提供的设备令牌。令牌只保存在当前设备。</p>
      <el-form @submit.prevent="save">
        <el-form-item>
          <el-input v-model="deviceCode" placeholder="设备编号，例如 wash-01" autocomplete="off" />
        </el-form-item>
        <el-form-item>
          <el-input v-model="token" type="password" show-password placeholder="设备令牌" autocomplete="off" />
        </el-form-item>
        <el-button type="primary" native-type="submit" :loading="loading" class="submit">验证并进入</el-button>
      </el-form>
    </el-card>
  </main>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import request from '@/api/request'

const router = useRouter()
const deviceCode = ref('')
const token = ref('')
const loading = ref(false)

async function save() {
  if (!/^[A-Za-z0-9_-]{2,40}$/.test(deviceCode.value.trim())) return ElMessage.warning('请输入有效设备编号')
  if (token.value.trim().length < 24) return ElMessage.warning('设备令牌至少24个字符')
  loading.value = true
  localStorage.setItem('factory_device_code', deviceCode.value.trim())
  localStorage.setItem('factory_token', token.value.trim())
  try {
    await request.get('/public/device-check')
    ElMessage.success('设备授权成功')
    router.replace('/')
  } catch {
    localStorage.removeItem('factory_device_code')
    localStorage.removeItem('factory_token')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.setup-page { min-height: 100vh; display: grid; place-items: center; background: #f3f6fa; padding: 24px; }
.setup-card { width: min(420px, 100%); }
h1 { margin: 0 0 12px; font-size: 24px; }
p { margin: 0 0 24px; color: #606266; line-height: 1.6; }
.submit { width: 100%; }
</style>
