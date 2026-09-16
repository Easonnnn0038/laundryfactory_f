import request from './request'

export const systemApi = {
  status: () => request.get('/public/status')
}

