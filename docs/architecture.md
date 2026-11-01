# 工作区架构

## 维护源与交付边界

根仓库统一管理游戏、编辑器与技能历史，但不要求运行时依赖根仓库。games/three-kingdoms-city 是可移植的 Cocos 项目；其中 LayoutBridge、图像和 layouts JSON 都是本地副本。编辑器 dist 同样带自己的布局核心模块，可作为普通静态网站部署。

packages/layout-core/src 是校验、历史与对齐的维护源；scripts/sync-layout-core.mjs 显式复制到 tools/layout-editor/dist 并生成 framework-lock.json。packages/adapters/cocos-creator/runtime 是桥的维护源；游戏保留其运行副本。采用显式同步和哈希记录，允许游戏在确定版本上独立迭代，不使用跨根目录 import 或运行时软链接。

projects/three-kingdoms-city.json 定义游戏/编辑器根路径、资源与布局位置、画布和构建预览命令。本地编辑器服务读取配置并做受限写回。该服务是创作工具，游戏发布运行不得请求它。

## 数据流

维护包 → 显式同步/记录哈希 → 编辑器独立dist与游戏本地桥。

图像与布局编辑 → 当前文档或工作区JSON → 主城适配写入游戏本地布局 → Cocos重新构建 → 独立Web输出。

技能文档指导工作流，不加入游戏运行包。skills/custom 为本地扩展，skills/vendor 保留上游快照和许可。

## 历史与产物

原游戏与编辑器历史采用非 squash subtree 导入，可在根 Git 查看原提交。旧仓库保留在 artifacts/legacy-repositories 作为备份，避免与新路径同时编辑。artifacts/standalone 是独立性验证复制件；构建缓存、报告大图与日志按项目忽略策略处理。维护文档和必要验证摘要应存源码，产物路径不能作为未来开发入口。

## 可移植性验证

scripts/verify-game-standalone.mjs 检查游戏assets导入只指向游戏本地或Cocos引擎，并准备 artifacts/standalone/three-kingdoms-city。此扫描只覆盖可识别的源码引用，不能证明动态URL、绝对路径和所有平台行为正确。必须在复制目录完成引擎构建，启动输出并验证资源、布局与点击，停止编辑器服务后再次试玩。

编辑器独立性则复制dist到其他静态服务，导入内嵌素材/参考图界面集；没有主城API也应可编辑、保存、导入导出。应用主城按钮可报告不可用，不能影响通用编辑功能。

适配器显式更新命令：node scripts/sync-game-adapter.mjs three-kingdoms-city。第三方技能采用 .gitmodules 固定上游提交；自定义Cocos技能、路由与原修改补丁在 skills/custom 中保存。
