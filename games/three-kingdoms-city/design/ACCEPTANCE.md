# 交付验收记录

2026-10-31，Creator 3.8.8，Web Desktop。

- Creator 最终构建完成，stderr 为空；见 build-result.json 与 build-reviewed 日志。
- TypeScript 应用检查通过（skipLibCheck 跳过引擎自带声明问题）。
- 浏览器无 pageerror/console error；真实点击建筑升级、关闭、武将招募、刷新存档通过。
- 真实点击建塔并按正常帧速完成三波，10 点城门耐久获胜；返回主城通过。
- 1672×941 与 1280×720 截图已保存。适配使用 SHOW_ALL，其他比例允许留边。
- 模型测试覆盖资源不足、重复领取、无塔失败、三波胜利和一次领奖。
- 动态单位/箭塔为 Graphics 示意图；这是可玩单机演示，非完整商业游戏。

## 内部审核处理

已修复：素材强制宽高造成拉伸；导航裁图含文字；弹窗背景抢占嵌套触摸；战斗提示遮挡；每帧创建销毁单位节点；启动场景与 SceneGlobals 序列化。

## 图层和复用边界

背景底板含远景、地形、部分城墙与树木；五栋建筑和关羽为独立透明 PNG。
头像和导航图标为参考图裁片。标签、资源数值、按钮、弹窗为原生节点。
World/HUD/Overlay/BattleScreen 分层。建筑详情、按钮、资源条、导航、弹窗通过通用构建函数复用；GameState/BattleModel 与引擎分离。未制作可拖拽独立 Prefab，详见 README。

## 视觉差异

参考图不是源图层。背景和建筑经参考重绘，所以轮廓、城墙细节、角色数量存在差异；UI 边框和出征按钮装饰较简洁。关羽仅浮动，没有行走骨骼动画。联盟为说明页。
对照图 comparison-side-by-side.jpg，叠加图 comparison-overlay.png，详见 COMPARISON.md。
