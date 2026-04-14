## React-Notes 项目介绍

**Forest Note** 是一个使用 React + TypeScript + Webpack 构建的现代化前端笔记应用，支持完整的开发和生产环境配置。 [youtube](https://www.youtube.com/watch?v=_3ooazcK4TI)

## 🎯 项目特性
- **现代技术栈**：React 17+、TypeScript、Webpack 5 自定义配置
- **开发体验**：热重载、类型检查、ESLint + Prettier
- **生产优化**：Tree Shaking、代码分割、Source Map
- **GitHub Pages 部署**：支持 gh-pages 分支自动发布
- **跨平台**：Windows/macOS/Linux 开发环境兼容

## 🚀 快速开始

```bash
# 克隆项目
git clone https://github.com/Ferry201/React-Notes.git
cd React-Notes

# 安装依赖
npm install

# 开发模式 (localhost:8080)
npm start

# 生产构建
npm run build

# 本地预览生产环境
npm run serve
```

## 🛠️ 项目结构
```
React-Notes/
├── src/                 # React 源码
├── tools/webpack/       # 自定义 Webpack 配置
│   ├── webpack.config.dev.js
│   └── webpack.config.prod.js
├── dist/               # 生产构建输出
├── gh-pages/           # GitHub Pages 静态文件
└── package.json        # 项目配置
```

## 🌐 在线体验
**[访问部署站点](https://ferry201.github.io/React-Notes/)**

## 📋 部署说明
```
1. 构建：npm run build
2. 部署：npm run deploy (gh-pages 包自动推送到 gh-pages 分支)
3. Pages：Settings → Pages → Source: gh-pages 分支
```

**⚠️ 注意**：确保 `package.json` 中 `homepage` 配置正确：
```json
"homepage": "https://ferry201.github.io/React-Notes"
```

## 🔧 开发配置亮点
- **零配置 TypeScript**：开箱即用类型支持
- **Webpack 生产优化**：Terser 压缩、HTML 插件自动注入
- **开发服务器**：HMR + 源码映射
- **环境变量**：`NODE_ENV` 自动切换

## 📈 简历亮点
```
✅ 完整的前端工程化实践
✅ GitHub Pages + gh-pages 部署
✅ Webpack 自定义配置 + 生产优化
✅ React + TypeScript 类型安全
✅ 从私有仓库恢复公开部署
```

***

⭐ **欢迎 Star 和 Fork！**  
📬 **有问题？请开 Issue**

```
MIT License - 免费商用 • 欢迎贡献代码 • 保留作者署名
```

**直接复制这段内容 → 仓库根目录 → 新建 README.md → 粘贴 → Commit 即可！**
