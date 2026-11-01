# 目录迁移记录

游戏迁至 games/three-kingdoms-city；编辑器迁至 tools/layout-editor。二者通过不压缩历史的 Git subtree 合入根仓库，原提交历史可查询。

旧仓库完整保留在 artifacts/legacy-repositories，对应目录包含原 .git、忽略文件、旧构建和技能本地修改。该目录默认不入 Git，不应在其中继续开发。

第三方技能固定上游提交，由 .gitmodules 记录官方地址。自建 Cocos 技能与扩展路由置于 skills/custom；旧修改另保存为 skills/custom/upstream-patches/gamedev-cocos.patch。

公共源位于 packages，编辑器dist和游戏assets均保留固定副本。显式同步命令与哈希锁管理更新，游戏运行不导入仓库根包。

验证入口：node scripts/test.mjs；根项目游戏构建、预览由 scripts/game-command.mjs 提供。独立副本验证、完整交互和框架迁移报告见 docs/reports。

本地服务：编辑器8820、游戏8818、独立副本8831。服务为创作预览，不是游戏发布依赖。
