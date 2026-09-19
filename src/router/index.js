import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  { path: '/', component: () => import('@/views/StationSelect.vue'), meta: { title: '选择工位' } },
  { path: '/station/:type', component: () => import('@/views/StationWork.vue'), meta: { title: '工位操作' } },
  { path: '/return-dispatch', component: () => import('@/views/ReturnDispatch.vue'), meta: { title: '回店发货' } },
  { path: '/:pathMatch(.*)*', redirect: '/' }
]

const router = createRouter({ history: createWebHashHistory(), routes })
router.beforeEach((to) => {
  document.title = `${to.meta.title || '工厂端'} - 小木棒洗衣`
})

export default router
