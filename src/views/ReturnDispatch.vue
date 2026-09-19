<template>
  <div class="return-page">
    <header><button @click="router.push('/')">← 选择工位</button><h1>回店发货</h1><button @click="reload">刷新待发货</button></header>
    <main>
      <p class="hint">选择同一门店的一批大件；若一个订单拆成多个大件，请将该订单全部大件一起勾选发货。</p>
      <div v-if="!packages.length" class="empty">暂无已打包、待发货的大件</div>
      <div v-for="group in groups" :key="group.storeCode" class="store-group">
        <h2>门店 {{ group.storeCode }} <small>{{ group.packages.length }} 个待发大件</small></h2>
        <label v-for="pkg in group.packages" :key="pkg.id" class="package-row">
          <input v-model="selected" type="checkbox" :value="pkg.id" :disabled="selectedStore && selectedStore !== group.storeCode" />
          <span><b>{{ pkg.packageNo }}</b><small>订单 {{ pkg.orderNo }} · {{ pkg.itemCount }} 件 · 原送厂批次 {{ pkg.sourceBatchNo }}</small></span>
        </label>
      </div>
      <div class="dispatch-bar"><strong>已选 {{ selected.length }} 个大件</strong><button :disabled="!selected.length || busy" @click="dispatch">确认装车发货</button></div>
    </main>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { returnDispatchApi } from '@/api'
const router = useRouter()
const packages = ref([])
const selected = ref([])
const busy = ref(false)
const groups = computed(() => {
  const byStore = packages.value.reduce((result, pkg) => {
    ;(result[pkg.storeCode] ||= []).push(pkg)
    return result
  }, {})
  return Object.entries(byStore).map(([storeCode, entries]) => ({ storeCode, packages: entries }))
})
const selectedStore = computed(() => packages.value.find(p => selected.value.includes(p.id))?.storeCode)
async function reload() { packages.value = await returnDispatchApi.ready(); selected.value = [] }
async function dispatch() {
  await ElMessageBox.confirm(`确认向门店 ${selectedStore.value} 发出 ${selected.value.length} 个大件吗？`, '装车发货', { type: 'warning' })
  busy.value = true
  try {
    const result = await returnDispatchApi.dispatch(selected.value)
    ElMessage.success(`发货成功，回店批次 ${result.batchNo}`)
    await reload()
  } finally { busy.value = false }
}
onMounted(reload)
</script>

<style scoped>
.return-page { min-height: 100vh; background: #f1f3f4; color: #20252b; }
header { height: 100px; display: flex; align-items: center; justify-content: space-between; padding: 0 36px; border-bottom: 7px solid #7a5b20; background: white; }
header h1 { font-size: 32px; } button { min-height: 54px; padding: 0 24px; border: 2px solid #aeb5b8; border-radius: 8px; background: white; font-size: 19px; font-weight: 700; }
main { max-width: 1150px; margin: auto; padding: 22px 28px 110px; }.hint { font-size: 20px; }.empty { padding: 70px; text-align: center; background: white; font-size: 22px; }
.store-group { margin: 24px 0; padding: 20px; border: 2px solid #d6dadd; background: white; border-radius: 10px; }.store-group h2 { margin: 0 0 15px; font-size: 25px; }.store-group h2 small { margin-left: 14px; font-size: 16px; color: #69737a; }
.package-row { display: flex; align-items: center; gap: 18px; min-height: 78px; border-top: 1px solid #e0e4e7; cursor: pointer; }.package-row input { width: 30px; height: 30px; }.package-row span { display: grid; gap: 5px; }.package-row b { font-size: 21px; }.package-row small { color: #66717a; font-size: 16px; }
.dispatch-bar { position: fixed; bottom: 0; left: 0; right: 0; padding: 14px 8%; background: white; border-top: 2px solid #d6dadd; display: flex; align-items: center; justify-content: space-between; font-size: 22px; }.dispatch-bar button { background: #7a5b20; color: white; border: 0; }.dispatch-bar button:disabled { background: #aeb5b8; }
</style>
