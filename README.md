# 小木棒洗衣 · 工厂前端

面向洗衣工厂各工位的轻量 Web 客户端，通过设备编号和设备令牌连接工厂后端。

## 工位

- 到厂签收：扫描大件与衣物并核对
- 衣物加工：按实际情况记录洗涤、烘干和熨烫
- 洗鞋：鞋类独立清洗
- 质检：合格、返工、备注与拍照
- 打包：大件内全部衣物质检通过后打包
- 回店发货：扫描大件并生成回店批次

## 技术栈

Vue 3、Vite 6、Vue Router、Element Plus、Axios。

## 本地运行

要求：Node.js 18+，并先启动端口 `8081` 的工厂后端。

```bash
npm install
npm run dev
```

开发地址：<http://localhost:5174>。Vite 会将 `/api` 代理到 `http://localhost:8081`。

首次进入时填写后端已配置的设备编号和设备令牌。

## 构建与部署

```bash
npm run build
npm run preview
```

生产产物位于 `dist/`，默认部署基路径为 `/factory/`。API 默认使用同域地址；独立部署时可设置 `VITE_API_BASE_URL`。

## 安全说明

- 设备令牌只保存在运行设备中，不要写入源码、README、截图或构建产物。
- 正式环境应使用 HTTPS，并为不同工位分配独立设备编号和令牌。
- 质检照片属于业务数据，应由后端鉴权和受控存储。

## 相关仓库

- [工厂后端](https://github.com/Easonnnn0038/laundryfactory_b)
- [门店后端](https://github.com/Easonnnn0038/laundry-backend)
- [门店前端](https://github.com/Easonnnn0038/lanudry-frontend)
