<template>
  <div v-if="station" class="work-page" :style="{ '--station-color': station.color }">
    <header class="work-header"><button class="back-button" @click="router.push('/')"><el-icon><ArrowLeft /></el-icon><span>选择工位</span></button><div class="work-title"><el-icon><component :is="station.icon" /></el-icon><div><h1>{{ station.name }}</h1><p>{{ station.instruction }}</p></div></div><div class="device-status"><span></span>手动录入</div></header>
    <main class="work-content">
      <section class="scan-panel"><div class="scan-symbol"><el-icon><EditPen /></el-icon></div><h2>输入订单号</h2><p>{{ station.key === 'receive' ? '输入门店已打包送厂的订单号，将整单导入工厂' : `输入需要在${station.name}处理的订单号` }}</p><form class="scan-form" @submit.prevent="loadOrder"><input ref="orderInput" v-model.trim="orderNo" placeholder="请输入完整订单号" autocomplete="off" autofocus><button type="submit" :disabled="!orderNo || loading">{{ loading ? '正在查询...' : station.key === 'receive' ? '导入订单信息' : '查询订单信息' }}</button></form><div class="scanner-reserved"><el-icon><Aim /></el-icon><span>扫码枪接口已预留<br><small>确认设备型号后接入</small></span></div></section>
      <section class="result-panel">
        <div v-if="!order" class="empty-state"><el-icon><Document /></el-icon><strong>等待输入订单号</strong><span>订单导入后将在这里显示全部物品</span></div>
        <template v-else>
          <div class="success-line"><el-icon><CircleCheckFilled /></el-icon><span>{{ station.key === 'receive' ? '订单导入成功' : '订单查询成功' }}</span></div>
          <div class="order-summary"><div><span>订单号</span><strong>{{ order.orderNo }}</strong></div><div><span>物品数量</span><strong>{{ order.totalCount }} 件</strong></div><div><span>订单类型</span><strong :class="{ urgent: order.urgentFlag === 1 }">{{ order.urgentFlag === 1 ? '加急订单' : '普通订单' }}</strong></div><div><span>当前状态</span><strong>{{ processLabel(order.currentProcess) }}</strong></div></div>
          <div class="item-list"><h3>物品明细（{{ order.items?.length || 0 }}件）</h3><div v-for="(item, index) in order.items" :key="item.id" class="item-row"><b>{{ index + 1 }}</b><div><strong>{{ item.categoryName }} <small v-if="item.categoryGroup === 'SHOES'" class="kind-tag">鞋</small></strong><span>{{ [item.brand, item.color, item.special].filter(Boolean).join(' · ') || '无补充信息' }} · 当前 {{ processLabel(item.currentProcess) }}</span><span v-if="item.categoryGroup !== 'SHOES'" class="process-flags"><i :class="{ done: item.washed }">洗涤</i><i :class="{ done: item.dried }">烘干</i><i :class="{ done: item.ironed }">熨烫</i></span></div><em>{{ item.barcode }}</em></div></div>
          <div v-if="wrongStation" class="wrong-station"><el-icon><WarningFilled /></el-icon><span>该订单没有可在本工位处理的物品</span></div>
          <div v-if="!wrongStation && station.key === 'processing'" class="action-area processing-actions"><button class="primary-action" :disabled="submitting" @click="recordProcess('WASH')">记录已洗涤</button><button class="primary-action" :disabled="submitting" @click="recordProcess('DRY')">记录已烘干</button><button class="primary-action" :disabled="submitting" @click="recordProcess('IRON')">记录已熨烫</button></div>
          <div v-if="!wrongStation && station.key === 'quality'" class="quality-area"><label class="photo-picker"><input type="file" accept="image/jpeg,image/png" multiple @change="selectPhotos"><el-icon><Camera /></el-icon><span>拍照或选择质检照片（可选，最多 9 张）</span></label><div v-if="photoPreviews.length" class="photo-grid"><div v-for="(photo, index) in photoPreviews" :key="photo.url"><img :src="photo.url" alt="质检照片预览"><button type="button" aria-label="删除照片" @click="removePhoto(index)">×</button></div></div><textarea v-model.trim="remark" maxlength="200" placeholder="质检备注（可选）"></textarea></div>
          <div v-if="!wrongStation && !['receive', 'processing'].includes(station.key)" class="action-area"><template v-if="station.key === 'quality'"><button class="danger-action" :disabled="submitting" @click="confirmQuality('REWORK')"><el-icon><RefreshLeft /></el-icon>不合格返工</button><button class="primary-action" :disabled="submitting" @click="confirmQuality('PASSED')"><el-icon><Check /></el-icon>质检合格</button></template><button v-else class="primary-action" :disabled="submitting" @click="confirmCurrent"><el-icon><Check /></el-icon>{{ actionText }}</button></div>
        </template>
      </section>
    </main><div class="bottom-tip">按现场实际操作直接记录；仅装车发货需要二次确认</div>
  </div>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Aim, ArrowLeft, Camera, Check, CircleCheckFilled, Document, EditPen, RefreshLeft, WarningFilled } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { stationByKey } from '@/config/stations'
import { workflowApi } from '@/api'

const route = useRoute(); const router = useRouter(); const orderInput = ref(null); const orderNo = ref(''); const order = ref(null)
const loading = ref(false); const submitting = ref(false); const photos = ref([]); const photoPreviews = ref([]); const remark = ref('')
const station = computed(() => stationByKey(route.params.type))
if (route.params.type === 'return') router.replace('/return-dispatch')
const eligible = computed(() => order.value?.items?.filter(item => {
  if (station.value?.key === 'processing') return item.currentProcess === 'PROCESSING' && item.categoryGroup !== 'SHOES'
  if (station.value?.key === 'shoe-wash') return item.currentProcess === 'SHOE_WASH' && item.categoryGroup === 'SHOES'
  if (station.value?.key === 'quality') return (item.currentProcess === 'PROCESSING' && item.categoryGroup !== 'SHOES') || (item.currentProcess === 'QUALITY' && item.categoryGroup === 'SHOES')
  return item.currentProcess === 'PACK'
}) || [])
const wrongStation = computed(() => !!order.value && station.value?.key !== 'receive' && eligible.value.length === 0)
const actionText = computed(() => ({ 'shoe-wash': '完成洗鞋', pack: '整件打包完成' })[station.value?.key] || '确认完成')

async function loadOrder() { loading.value = true; order.value = null; clearPhotos(); try { order.value = station.value.key === 'receive' ? await workflowApi.manualImport(orderNo.value) : await workflowApi.orderDetail(orderNo.value); if (station.value.key === 'receive') ElMessage.success('订单及全部物品已导入工厂') } finally { loading.value = false; nextTick(() => orderInput.value?.focus()) } }
async function recordProcess(process) { await submitConfirm({ process }, false, '已记录') }
async function confirmCurrent() { await submitConfirm({ process: station.value.key === 'shoe-wash' ? 'SHOE_WASH' : 'PACK' }, true, station.value.key === 'pack' ? '整件已打包' : '洗鞋完成') }
async function confirmQuality(qualityResult) { const photoPaths = []; submitting.value = true; try { for (const file of photos.value) photoPaths.push((await workflowApi.uploadQualityPhoto(file)).path); await sendConfirm({ process: 'QUALITY', qualityResult, photoPaths, remark: remark.value }, true, qualityResult === 'PASSED' ? '质检合格' : '已退回返工') } finally { submitting.value = false } }
async function submitConfirm(extra, clear, message) { submitting.value = true; try { await sendConfirm(extra, clear, message) } finally { submitting.value = false } }
async function sendConfirm(extra, clear, message) { order.value = await workflowApi.confirm({ orderNo: order.value.orderNo, deviceCode: `MANUAL-${station.value.key.toUpperCase()}`, ...extra }); ElMessage.success(message); if (clear) { orderNo.value = ''; order.value = null; clearPhotos() } nextTick(() => orderInput.value?.focus()) }
function selectPhotos(event) { const selected = [...event.target.files]; if (selected.some(file => file.size > 10 * 1024 * 1024)) { ElMessage.error('单张照片不能超过 10MB'); event.target.value = ''; return } const available = 9 - photos.value.length; selected.slice(0, available).forEach(file => { photos.value.push(file); photoPreviews.value.push({ url: URL.createObjectURL(file) }) }); if (selected.length > available) ElMessage.warning('最多上传 9 张照片'); event.target.value = '' }
function removePhoto(index) { URL.revokeObjectURL(photoPreviews.value[index].url); photoPreviews.value.splice(index, 1); photos.value.splice(index, 1) }
function clearPhotos() { photoPreviews.value.forEach(photo => URL.revokeObjectURL(photo.url)); photoPreviews.value = []; photos.value = []; remark.value = '' }
function processLabel(code) { return ({ WAIT_IMPORT: '等待到厂导入', PROCESSING: '衣物加工', SHOE_WASH: '洗鞋', QUALITY: '质检', PACK: '待打包', RETURN: '待发回门店', DONE: '已发回门店', MIXED: '多种处理状态' })[code] || code || '等待导入' }
watch(() => route.params.type, () => { order.value = null; orderNo.value = ''; clearPhotos() })
onBeforeUnmount(clearPhotos)
</script>
