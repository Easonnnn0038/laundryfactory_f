import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  { path: '/device-setup', component: () => import('@/views/DeviceSetup.vue'), meta: { title: '设备授权', public: true } },
  { path: '/', component: () => import('@/views/StationSelect.vue'), meta: { title: '选择工位' } },
  { path: '/station/:type', component: () => import('@/views/StationWork.vue'), meta: { title: '工位操作' } },
  { path: '/return-dispatch', component: () => import('@/views/ReturnDispatch.vue'), meta: { title: '回店发货' } },
  { path: '/:pathMatch(.*)*', redirect: '/' }
]

const router = createRouter({ history: createWebHashHistory(), routes })
router.beforeEach((to) => {
  document.title = `${to.meta.title || '工厂端'} - 小木棒洗衣`
  if (!to.meta.public && (!localStorage.getItem('factory_token') || !localStorage.getItem('factory_device_code'))) return '/device-setup'
})

export default router
