import { Box, Check, Refresh, Search, Van } from '@element-plus/icons-vue'

export const stations = [
  { key: 'receive', name: '到厂签收', icon: Search, color: '#1769aa', instruction: '先扫大件码，再逐件扫码核对' },
  { key: 'processing', name: '衣物加工', icon: Refresh, color: '#087f8c', instruction: '按实际操作记录洗涤、烘干或熨烫' },
  { key: 'shoe-wash', name: '洗鞋工位', icon: Refresh, color: '#7262a8', instruction: '鞋子只记录清洗，不进入烘干和熨烫' },
  { key: 'quality', name: '质检工位', icon: Check, color: '#39734d', instruction: '可拍照留档，直接标记合格或返工' },
  { key: 'pack', name: '打包工位', icon: Box, color: '#5d6570', instruction: '同单衣物和鞋子可装在同一个大件' },
  { key: 'return', name: '回店发货', icon: Van, color: '#7a5b20', instruction: '扫描大件，加入回店批次' }
]

export const stationByKey = key => stations.find(station => station.key === key)
