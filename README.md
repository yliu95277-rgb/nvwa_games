# 游戏开发工作区

本地 Git 管理的游戏、图形编辑工具与可维护技能集合。游戏运行项目保持可单独复制，公共包仅用于维护与显式同步，不作为游戏运行时的仓库外部依赖。

```sh
npm run editor
npm test
npm run game:build
npm run game:serve
```

Node.js 22+；主城构建需要 Cocos Creator 3.8.8。编辑器默认 http://127.0.0.1:8820，游戏预览 http://127.0.0.1:8818。根命令当前选定 projects/three-kingdoms-city.json，并非自动扫描所有游戏。

| 路径 | 内容 |
|---|---|
| games/three-kingdoms-city | 可独立使用的主城游戏源码与本地资源 |
| tools/layout-editor | 独立浏览器布局编辑器、静态 dist 与可选本地写回桥 |
| packages/layout-core | 布局校验、历史、对齐的维护源 |
| packages/adapters/cocos-creator | Cocos 桥维护源；游戏内保留副本 |
| skills/custom | 本工作区自定义技能 |
| skills/vendor | 上游技能仓库快照，保留来源 |
| projects | 游戏路径与适配配置 |
| scripts | 启动、同步、测试与独立性检查 |
| artifacts | 忽略的构建/交付副本和旧仓库备份，不是维护源 |

编辑器说明见 tools/layout-editor/README.md；游戏说明见 games/three-kingdoms-city/README.md。架构见 [docs/architecture.md](docs/architecture.md)，新游戏与发布流程见 docs/workflows。各原项目 Git 历史通过非 squash subtree 导入根仓库；旧目录备份不应成为并行修改入口。
