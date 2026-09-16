<template>
  <div v-if="station" class="work-page" :style="{ '--station-color': station.color }">
    <header class="work-header">
      <button class="back-button" @click="router.push('/')"><el-icon><ArrowLeft /></el-icon><span>选择工位</span></button>
      <div class="work-title"><el-icon><component :is="station.icon" /></el-icon><div><h1>{{ station.name }}</h1><p>{{ station.instruction }}</p></div></div>
      <div class="device-status"><span></span>本机设备</div>
    </header>
    <main class="work-content">
      <section class="scan-panel">
        <div class="scan-symbol"><el-icon><Aim /></el-icon></div>
        <h2>{{ scanTitle }}</h2><p>{{ scanHint }}</p>
        <form class="scan-form" @submit.prevent="handleScan">
          <input ref="scanInput" v-model.trim="scanCode" :placeholder="scanPlaceholder" autocomplete="off" autofocus />
          <button type="submit" :disabled="!scanCode">确认扫码</button>
        </form>
      </section>
      <section class="result-panel">
        <div v-if="!currentItem" class="empty-state"><el-icon><Scan /></el-icon><strong>等待扫码</strong><span>请使用扫码枪，或在左侧输入编码</span></div>
        <template v-else>
          <div class="success-line"><el-icon><CircleCheckFilled /></el-icon><span>扫码成功</span></div>
          <div class="code-display">{{ currentItem.code }}</div>
          <div class="info-list"><div><span>当前工位</span><strong>{{ station.name }}</strong></div><div><span>当前状态</span><strong>{{ currentStatus }}</strong></div><div><span>扫描时间</span><strong>{{ currentItem.time }}</strong></div></div>
          <div v-if="station.key === 'sort'" class="choice-area"><h3>请选择处理方式</h3><div class="choice-grid"><button v-for="type in sortTypes" :key="type" :class="{ selected: selectedSort === type }" @click="selectedSort = type">{{ type }}</button></div></div>
          <div v-if="station.key === 'receive'" class="receive-progress"><h3>衣物核对</h3><div class="big-progress"><strong>{{ checkedCount }}</strong><span>/ {{ expectedCount }} 件</span></div><el-progress :percentage="progress" :stroke-width="18" :show-text="false" /><p>{{ checkedCount < expectedCount ? '请继续扫描大件内的衣物标签' : '全部衣物已核对，可以整包签收' }}</p></div>
          <div class="action-area">
            <template v-if="station.key === 'quality'"><button class="danger-action" @click="complete('退回洗涤')"><el-icon><RefreshLeft /></el-icon>不合格，退回洗涤</button><button class="primary-action" @click="complete('质检合格')"><el-icon><Check /></el-icon>质检合格</button></template>
            <button v-else class="primary-action" :disabled="!canComplete" @click="complete(actionText)"><el-icon><Check /></el-icon>{{ actionText }}</button>
          </div>
        </template>
      </section>
    </main>
    <div class="bottom-tip">扫码后请核对屏幕信息，再点击确认按钮</div>
  </div>
</template>

<script setup>
import { computed, nextTick, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Aim, ArrowLeft, Check, CircleCheckFilled, RefreshLeft, Search as Scan } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { stationByKey } from '@/config/stations'
const route = useRoute(); const router = useRouter(); const scanInput = ref(null); const scanCode = ref(''); const currentItem = ref(null)
const selectedSort = ref(''); const checkedCount = ref(0); const expectedCount = ref(5); const sortTypes = ['水洗', '干洗', '单烫', '特殊处理']
const station = computed(() => stationByKey(route.params.type))
const scanTitle = computed(() => station.value?.key === 'receive' && !currentItem.value ? '扫描大件包装码' : '扫描衣物标签')
const scanHint = computed(() => station.value?.key === 'receive' ? '签收必须核对大件内的全部衣物' : '一次只处理一件衣物，操作完成后继续扫描')
const scanPlaceholder = computed(() => station.value?.key === 'receive' ? '请扫描大件码或衣物码' : '请扫描衣物条码')
const currentStatus = computed(() => station.value?.key === 'receive' ? '核对中' : '等待本工位确认')
const progress = computed(() => Math.min(100, Math.round(checkedCount.value / expectedCount.value * 100)))
const canComplete = computed(() => station.value?.key === 'sort' ? !!selectedSort.value : station.value?.key === 'receive' ? checkedCount.value >= expectedCount.value : true)
const actionText = computed(() => ({ receive: '确认整包签收', sort: '确认分拣完成', wash: '确认洗涤完成', dry: '确认烘干完成', iron: '确认熨烫完成', pack: '确认打包完成', return: '加入回店批次' })[station.value?.key] || '确认完成')
function handleScan() { if (!scanCode.value) return; if (station.value?.key === 'receive' && currentItem.value) checkedCount.value = Math.min(expectedCount.value, checkedCount.value + 1); currentItem.value = { code: scanCode.value, time: new Date().toLocaleTimeString('zh-CN', { hour12: false }) }; scanCode.value = ''; nextTick(() => scanInput.value?.focus()) }
function complete(message) { ElMessage.success(`${message}成功`); currentItem.value = null; selectedSort.value = ''; checkedCount.value = 0; nextTick(() => scanInput.value?.focus()) }
watch(() => route.params.type, () => { currentItem.value = null; selectedSort.value = ''; checkedCount.value = 0 })
</script>

