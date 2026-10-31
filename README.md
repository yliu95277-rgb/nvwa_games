# 蜀汉主城 · Cocos Creator 演示工程

本项目是参考 `design/reference.png` 制作的 Q 版三国主城与单机塔防演示。它使用 Cocos Creator 3.8.8，包含独立建筑素材、代码生成 UI、本地经营状态和三波守城战。编译与运行结论以最终交付检查记录为准；本文不将代码存在视为运行验收通过。

## 打开与构建

在 Cocos Dashboard 中导入本目录，选择 **Creator 3.8.8**。保留 assets 中的 `.meta` 文件；首次打开需等待编辑器导入完成。不要导入同名嵌套目录或只导入 assets 子目录。

Windows PowerShell 在项目根目录执行：

```powershell
powershell -ExecutionPolicy Bypass -File tools/build.ps1
```

脚本默认编辑器位置是 `C:/ProgramData/cocos/editors/Creator/3.8.8/CocosCreator.exe`，其他安装位置可设置 COCOS_CREATOR 环境变量。构建配置见 `build-config.json`，目标输出为 `build/web-desktop`。

构建完成后用 HTTP 服务打开，不能直接双击输出目录的 index.html：

```powershell
python -m http.server 8818 --directory build/web-desktop
```

浏览器访问 `http://127.0.0.1:8818`。如果系统没有可用的 python 命令，使用已安装 Python 的完整路径运行同样参数。也可运行 `npm run serve`，使用项目附带的 Node 静态服务。

## 试玩操作

- 点击城主府、招贤馆、兵营、集市或铁匠铺，查看等级并消耗铜钱、粮草升级；最高 10 级。
- 招贤馆或武将页用 100 玉璧依次招募武将；不会重复招募本期名单。当前招募影响武将列表，尚未绑定不同战斗技能。
- 活动、邮件奖励各可领取一次；任务展示守城胜利次数。这里的“活动”不是服务器每日重置。
- 背包展示军资；联盟是单机演示说明，不含联网联盟、聊天或多人玩法。
- “布阵”展示守城说明并进入同一战斗；它不是独立武将编队系统。
- 点击“出征”进入三波塔防；初始军资 220，每座箭塔 60。建议先在编号 **0、1、3** 的塔位建造（从左向右辨认前三处推荐塔位；内部编号从 0 开始），再点击迎战。后续利用击杀奖励补塔。
- 敌人到达终点扣城门耐久；守住三波获胜，铜钱 +3000、粮草 +1200。失败可再战；返回主城退出本次战斗。

战斗当前只有一种箭塔，尚无塔升级、暂停或多武将技能；这些是后续扩展点，不应按完整商业塔防验收。

## 本地保存

`GameState` 管理铜钱、粮草、玉璧、建筑等级、武将、奖励领取状态和胜利次数；`CityGame.persist()` 写入浏览器 localStorage 的 `three-kingdoms-city-v1`。同一地址刷新后保留；切换浏览器或端口可能属于不同存储空间。清除网站数据会重置。无账号同步、支付、离线收益或防作弊承诺。

## 图层与复用

| 运行层 | 当前内容 | 独立程度 |
|---|---|---|
| World 底层 | city-ground 地形、河流、植被、远景、部分墙体 | 一张背景底板；远处城墙不是可移动独立层 |
| World 建筑 | palace、tavern、barracks、market、forge | 五个透明 PNG，分别创建 Sprite 和点击事件 |
| World 角色 | guanyu | 独立透明 PNG；浮动 tween，非完整走路/战斗动画 |
| World 标签 | 建筑名底板和文字 | Graphics + Label，代码生成 |
| HUD | 资源条、右侧工具、导航、出征 | Graphics + Label 与事件，非烘焙在底图 |
| Overlay | 详情弹窗、遮罩、提示 | 统一生成，关闭销毁 |
| BattleScreen | 战场、塔位、单位、弹道和信息 | 独立根节点；塔、敌兵和弹道用 Graphics 绘制 |

`CityGame.ts` 中 layer、box、text、button、image、modal 是共享 UI 构建助手；五种建筑通过同一 building 流程，资源条和导航由数组生成。**这些是代码复用，还不是已制作好的引擎 Prefab 或各自独立 Component 类。** 后续可将 ResourceBar、BuildingPanel、NavBar、ModalHost 从该类提取为可序列化组件和 Prefab，再保留现有数据接口。

`GameState.ts` 中 `GameState` 与 `BattleModel` 不依赖渲染组件，可单独测试和复用；当前存储由界面层负责。建筑成本、武将名单和关卡路径已集中在数据逻辑文件内，但尚未拆成外部配置资产。

## 验收入口

- [设计目标](design/IMPLEMENTATION.md)：目标规格，不代表全部已实现。
- [差异说明](design/COMPARISON.md)：参考图与当前实现的明确差异。
- `design/reference.png`：原始视觉参考；最终截图/检查证据由交付检查记录补充。

建议逐项验收：主城素材加载无错误；所有入口能打开/关闭；升级扣费正确；奖励防重复；刷新存档保留；出征可胜利和失败；返回主城无残留输入；重开战斗不继承旧敌人；同宽高比截图对比；窗口缩放无拉伸及点击错位。未执行的检查必须标为待验证。
