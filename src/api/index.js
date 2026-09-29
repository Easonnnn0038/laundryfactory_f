import request from './request'

export const systemApi = {
  status: () => request.get('/public/status')
}

export const workflowApi = {
  manualImport: (orderNo, deviceCode = 'MANUAL-STATION') => request.post('/workflow/manual-import', { orderNo, deviceCode }),
  // 扫码枪型号确认后，由设备适配层把原始内容传入此接口。
  scanImport: (scanCode, deviceCode = 'SCANNER-STATION') => request.post('/workflow/scan-import', { scanCode, deviceCode }),
  orderDetail: (orderNo) => request.get(`/workflow/order/${encodeURIComponent(orderNo)}`),
  waiting: (process) => request.get('/workflow/waiting', { params: { process } }),
  confirm: (data) => request.post('/workflow/confirm', data),
  uploadQualityPhoto: (file) => {
    const data = new FormData()
    data.append('file', file)
    return request.post('/quality-photos', data)
  }
}

export const returnDispatchApi = {
  ready: () => request.get('/return-dispatch/ready'),
  dispatch: (packageIds) => request.post('/return-dispatch/dispatch', { packageIds, deviceCode: 'MANUAL-RETURN' })
}
