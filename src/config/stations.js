import { Box, Check, Finished, Operation, Refresh, Search, Sunny, Van } from '@element-plus/icons-vue'

export const stations = [
  { key: 'receive', name: '到厂签收', icon: Search, color: '#1769aa', instruction: '先扫大件码，再逐件扫码核对' },
  { key: 'sort', name: '分拣工位', icon: Operation, color: '#7262a8', instruction: '扫描衣物，选择处理方式' },
  { key: 'wash', name: '洗涤工位', icon: Refresh, color: '#087f8c', instruction: '扫描衣物，确认洗涤完成' },
  { key: 'dry', name: '烘干工位', icon: Sunny, color: '#b55d12', instruction: '扫描衣物，确认烘干完成' },
  { key: 'iron', name: '熨烫工位', icon: Finished, color: '#9a4f65', instruction: '扫描衣物，确认熨烫完成' },
  { key: 'quality', name: '质检工位', icon: Check, color: '#39734d', instruction: '扫描衣物，选择合格或返工' },
  { key: 'pack', name: '打包工位', icon: Box, color: '#5d6570', instruction: '扫描大件，核对整单后打包' },
  { key: 'return', name: '回店发货', icon: Van, color: '#7a5b20', instruction: '扫描大件，加入回店批次' }
]

export const stationByKey = key => stations.find(station => station.key === key)

