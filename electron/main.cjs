const { app, BrowserWindow, Menu, ipcMain } = require('electron')
const path = require('path')
const { productionUrl } = require('./app-config.json')

const isDev = !app.isPackaged
ipcMain.handle('factory:get-version', () => app.getVersion())

function appUrl() {
  const url = new URL(process.env.LAUNDRY_FACTORY_APP_URL || productionUrl)
  if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) {
    throw new Error('工厂端地址必须是不含账号密码的 HTTP(S) URL')
  }
  return url.href
}

function createWindow() {
  const window = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 1024,
    minHeight: 600,
    title: '小木棒洗衣工厂端',
    icon: path.join(__dirname, '../build/icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      webSecurity: true
    }
  })

  if (isDev) window.loadURL('http://localhost:5174')
  else window.loadURL(appUrl())
}

if (!isDev) Menu.setApplicationMenu(null)

app.whenReady().then(() => {
  createWindow()
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

app.on('web-contents-created', (_event, contents) => {
  contents.setWindowOpenHandler(() => ({ action: 'deny' }))
})
