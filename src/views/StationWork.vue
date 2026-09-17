<template>
  <div v-if="station" class="work-page" :style="{ '--station-color': station.color }">
    <header class="work-header">
      <button class="back-button" @click="router.push('/')"><el-icon><ArrowLeft /></el-icon><span>选择工位</span></button>
      <div class="work-title"><el-icon><component :is="station.icon" /></el-icon><div><h1>{{ station.name }}</h1><p>{{ station.instruction }}</p></div></div>
      <div class="device-status"><span></span>手动录入</div>
    </header>
    <main class="work-content">
      <section class="scan-panel">
        <div class="scan-symbol"><el-icon><EditPen /></el-icon></div>
        <h2>输入订单号</h2>
        <p>{{ station.key === 'receive' ? '输入门店已打包送厂的订单号，将整单导入工厂' : `输入已经到达${station.name}的订单号` }}</p>
        <form class="scan-form" @submit.prevent="loadOrder">
          <input ref="orderInput" v-model.trim="orderNo" placeholder="请输入完整订单号" autocomplete="off" autofocus />
          <button type="submit" :disabled="!orderNo || loading">{{ loading ? '正在查询...' : station.key === 'receive' ? '导入订单信息' : '查询订单信息' }}</button>
        </form>
        <div class="scanner-reserved"><el-icon><Aim /></el-icon><span>扫码枪接口已预留<br><small>确认设备型号后接入</small></span></div>
      </section>
      <section class="result-panel">
        <div v-if="!order" class="empty-state"><el-icon><Document /></el-icon><strong>等待输入订单号</strong><span>订单导入后将在这里显示全部衣物</span></div>
        <template v-else>
          <div class="success-line"><el-icon><CircleCheckFilled /></el-icon><span>{{ station.key === 'receive' ? '订单导入成功' : '订单查询成功' }}</span></div>
          <div class="order-summary">
            <div><span>订单号</span><strong>{{ order.orderNo }}</strong></div><div><span>衣物数量</span><strong>{{ order.totalCount }} 件</strong></div>
            <div><span>订单类型</span><strong :class="{ urgent: order.urgentFlag === 1 }">{{ order.urgentFlag === 1 ? '加急订单' : '普通订单' }}</strong></div><div><span>当前工序</span><strong>{{ processLabel(order.currentProcess) }}</strong></div>
          </div>
          <div class="item-list">
            <h3>衣物明细（{{ order.items?.length || 0 }}件）</h3>
            <div v-for="(item, index) in order.items" :key="item.id" class="item-row"><b>{{ index + 1 }}</b><div><strong>{{ item.categoryName }}</strong><span>{{ [item.brand, item.color, item.special].filter(Boolean).join(' · ') || '无补充信息' }}</span></div><em>{{ item.barcode }}</em></div>
          </div>
          <div v-if="station.key === 'sort'" class="choice-area">
            <h3>1. 选择处理方式</h3><div class="choice-grid"><button v-for="type in sortTypes" :key="type.code" :class="{ selected: selectedSort === type.code }" @click="selectedSort = type.code">{{ type.name }}</button></div>
            <h3 class="route-title">2. 选择后续工序</h3><div class="route-options"><label><input v-model="needDry" type="checkbox">需要烘干</label><label><input v-model="needIron" type="checkbox">需要熨烫</label></div>
          </div>
          <div v-if="wrongStation" class="wrong-station"><el-icon><WarningFilled /></el-icon><span>该订单当前应进入“{{ processLabel(order.currentProcess) }}”，不能在本工位操作</span></div>
          <div class="action-area" v-if="!wrongStation && station.key !== 'receive'">
            <template v-if="station.key === 'quality'"><button class="danger-action" :disabled="submitting" @click="confirmQuality('REWORK')"><el-icon><RefreshLeft /></el-icon>不合格，退回洗涤</button><button class="primary-action" :disabled="submitting" @click="confirmQuality('PASSED')"><el-icon><Check /></el-icon>质检合格</button></template>
            <button v-else class="primary-action" :disabled="!canConfirm || submitting" @click="confirmCurrent"><el-icon><Check /></el-icon>{{ actionText }}</button>
          </div>
        </template>
      </section>
    </main>
    <div class="bottom-tip">每一步确认后，订单才会进入下一个工位</div>
  </div>
</template>

<script setup>
import { computed, nextTick, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Aim, ArrowLeft, Check, CircleCheckFilled, Document, EditPen, RefreshLeft, WarningFilled } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { stationByKey } from '@/config/stations'
import { workflowApi } from '@/api'

const route = useRoute(); const router = useRouter(); const orderInput = ref(null); const orderNo = ref(''); const order = ref(null)
const loading = ref(false); const submitting = ref(false); const selectedSort = ref(''); const needDry = ref(true); const needIron = ref(true)
const station = computed(() => stationByKey(route.params.type))
const processMap = { receive: 'WAIT_IMPORT', sort: 'SORT', wash: 'WASH', dry: 'DRY', iron: 'IRON', quality: 'QUALITY', pack: 'PACK', return: 'RETURN' }
const sortTypes = [{ code: 'WATER_WASH', name: '水洗' }, { code: 'DRY_CLEAN', name: '干洗' }, { code: 'IRON_ONLY', name: '单烫' }, { code: 'SPECIAL', name: '特殊处理' }]
const wrongStation = computed(() => !!order.value && station.value?.key !== 'receive' && order.value.currentProcess !== processMap[station.value.key])
const canConfirm = computed(() => station.value?.key !== 'sort' || !!selectedSort.value)
const actionText = computed(() => ({ sort: '确认分拣完成', wash: '确认洗涤完成', dry: '确认烘干完成', iron: '确认熨烫完成', pack: '确认打包完成', return: '确认发回门店' })[station.value?.key] || '确认完成')
async function loadOrder() { loading.value = true; order.value = null; try { order.value = station.value.key === 'receive' ? await workflowApi.manualImport(orderNo.value) : await workflowApi.orderDetail(orderNo.value); if (station.value.key === 'receive') ElMessage.success('订单及全部衣物已导入工厂') } finally { loading.value = false; nextTick(() => orderInput.value?.focus()) } }
async function confirmCurrent() { await ElMessageBox.confirm(`确认${actionText.value.replace('确认', '')}，并将订单传到下一工位吗？`, '工序确认', { type: 'warning' }); await submitConfirm({ sortTypeCode: selectedSort.value || null, needDry: needDry.value, needIron: needIron.value }) }
async function confirmQuality(result) { const text = result === 'REWORK' ? '退回洗涤重新处理' : '质检合格并进入打包'; await ElMessageBox.confirm(`确认${text}吗？`, '质检确认', { type: result === 'REWORK' ? 'error' : 'success' }); await submitConfirm({ qualityResult: result }) }
async function submitConfirm(extra) { submitting.value = true; try { await workflowApi.confirm({ orderNo: order.value.orderNo, process: processMap[station.value.key], deviceCode: `MANUAL-${station.value.key.toUpperCase()}`, ...extra }); ElMessage.success('操作成功，订单已进入下一工位'); orderNo.value = ''; order.value = null; selectedSort.value = ''; needDry.value = true; needIron.value = true } finally { submitting.value = false; nextTick(() => orderInput.value?.focus()) } }
function processLabel(code) { return ({ WAIT_IMPORT: '等待到厂导入', SORT: '分拣', WASH: '洗涤', DRY: '烘干', IRON: '熨烫', QUALITY: '质检', PACK: '打包', RETURN: '回店发货', DONE: '已发回门店', MIXED: '衣物状态不一致' })[code] || code || '等待导入' }
watch(() => route.params.type, () => { order.value = null; orderNo.value = ''; selectedSort.value = '' })
</script>
