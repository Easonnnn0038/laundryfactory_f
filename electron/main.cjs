const { app, BrowserWindow, Menu } = require('electron')
const path = require('path')

const isDev = !app.isPackaged

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
  else window.loadURL('http://124.220.168.222/factory/')
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
