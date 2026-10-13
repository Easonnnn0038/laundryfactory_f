import test from 'node:test'
import assert from 'node:assert/strict'
import { clearToken, getAuthReason, getDeviceCode, getToken, saveDevice } from '../src/api/deviceSession.js'

function storage() {
  const values = new Map()
  return {
    getItem: key => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
    removeItem: key => values.delete(key)
  }
}

test('HTTP keeps token for current session and removes old persistent token', () => {
  globalThis.location = { protocol: 'http:' }
  globalThis.localStorage = storage()
  globalThis.sessionStorage = storage()
  localStorage.setItem('factory_token', 'legacy-token')
  assert.equal(getToken(), null)
  saveDevice('wash-01', 'new-token')
  assert.equal(getToken(), 'new-token')
  assert.equal(localStorage.getItem('factory_token'), null)
  assert.equal(getDeviceCode(), 'wash-01')
  clearToken('设备授权已失效。')
  assert.equal(getToken(), null)
  assert.equal(getAuthReason(), '设备授权已失效。')
})

test('HTTPS may keep token across sessions', () => {
  globalThis.location = { protocol: 'https:' }
  globalThis.localStorage = storage()
  globalThis.sessionStorage = storage()
  saveDevice('pack-02', 'secure-token')
  assert.equal(localStorage.getItem('factory_token'), 'secure-token')
  assert.equal(getToken(), 'secure-token')
  assert.equal(sessionStorage.getItem('factory_token'), null)
})
