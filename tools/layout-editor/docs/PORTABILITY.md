# 可移植布局与接入

## 静态部署

复制整个 `dist/` 到任意支持 ES module 的静态 HTTP 服务即可；无打包步骤、无第三方运行依赖。推荐 HTTPS 或本机 loopback，供浏览器 crypto.randomUUID 等 API 使用。不要依赖双击 file:// 方式加载模块。

独立部署时没有 `/api/projects/city`、`/api/projects/city/layout` 或 `/project-assets/`。空白编辑、图片导入和包含图片的布局导入/导出仍可使用；主城示例和参考图开关需要本机适配服务。dist/city-layout.json 中的初始资源 URL 不是自包含素材包，复制该文件不会同时携带主城图片。先在本机服务中导出 JSON，导出过程会把图片嵌入 data URL，再拿到静态站点导入。

对外部图片 URL，导出需要 fetch 能读到资源；远程服务器的 CORS 或失效链接会导致打包失败。导入图片当前限制单图小于 15MB，浏览器保存使用 IndexedDB，仍受浏览器存储配额和清理策略约束；大型素材应使用导出文件保存。主城写回请求当前另有 5MB 上限，和一般编辑文档不是同一容量范围。

## Version 1 schema

顶层字段：version=1、id、name、canvas、assets、layers、nodes。canvas 为 width、height、background。assets 为 id、name、src、width、height；尺寸是原始图像像素尺寸，src 可为可读取 URL 或受支持的 raster base64 data URL。

每个 node 包含 id、name、type（image/text）、x/y、width/height、rotation、scaleX/scaleY、z、visible、locked、opacity、anchorX/anchorY、parentId。image 节点引用 assetId；text 节点包含 text。ID 唯一，图片引用必须存在，父节点必须存在且不能形成环。未知字段会在校验时丢弃。

画布坐标从左上开始，X 向右、Y 向下，单位为设计画布单位。x/y 是锚点位置；锚点在 0..1 内，默认 0.5/0.5。宽高为未应用 scale 的尺寸；rotation 是顺时针角度。子节点相对父节点左上局部空间表达，父级缩放/旋转共同作用。z 在同一父级内决定绘制顺序；透明度为 0..1。locked 仅用于编辑，不是游戏业务锁。

## 无引擎数据核心

`dist/layout-core.mjs` 导出 validateLayout 和 LayoutStore。模型可直接在 Node 或浏览器中导入，document 返回复制值，写入需调用 commit/updateNode 等接口。布局历史与选中状态分离；最多保存 100 个历史快照，拖动通过 beginTransaction/endTransaction 合并为一次撤销。模型支持父子关系并校验循环，删除/复制行为以核心实现与测试为准。

`app.mjs` 将该模型渲染为 DOM 图片/文字，负责手柄、指针变换、检查器、快捷键、JSON 打包和浏览器保存。`window.layoutStudio.store` 可供开发时诊断，正式跨工具集成应以 schema 和独立适配器为边界。

## 可选的本机 API

| API | 行为 |
|---|---|
| GET /api/projects/city | 优先返回 city-project.json，否则导出当前主城布局 |
| GET /project-assets/art/{name}.png | 读取限定目录下的主城素材 |
| GET /project-assets/reference.png | 读取主城参考图 |
| POST /api/projects/city/layout | 校验后写入固定主城布局文件及本机草稿，返回 requiresRebuild |

本机服务限制 Host/Origin，不接收任意文件目标路径；这些 API 是开发机适配接口，不是用于公网部署的账户/权限服务。浏览器“保存到浏览器”和 API 写回是两条不同流程。

为另一个游戏或引擎接入时，单独实现文档导出和受限写回适配器，映射稳定节点 ID、坐标、锚点、排序、可见性及图片引用。不要把浏览器 DOM 状态当作引擎场景序列化。对于 Cocos，Y 轴与旋转方向转换、运行时输入关联以及重编译流程见 cocos-adapter.md。

## 图层扩展与兼容迁移

layers 是非空有序容器数组，每项 id、name、z、visible、locked；node.layerId 必须引用已存在图层。图层 z 先决定排序，再按节点 z 排同父节点内元素。parentId 是局部变换父子关系，不等于图层归属；跨父节点的子元素仍受到父级堆叠上下文限制。图层显隐/锁定与节点及其祖先状态共同决定有效状态。

删除图层删除该层元素及其后代；跨层后代也会随父级删除。移动元素到图层会一起迁移其子树。最后一个图层不能删除。活动图层属于编辑器会话状态，不是引擎业务场景状态。

旧 version=1 文档若缺 layers，校验补默认层；识别到主城节点时补背景/建筑/角色/旗帜/界面五层。旧 Art_hud-bottom 合并底栏迁移依赖本机 /api/projects/city 获得最新六个素材定义，因此旧文档在独立静态部署前应先本机迁移、导出内嵌图片。

本轮主城默认集合更新为38个元素。通用图层与任意图片继续可独立编辑；Cocos适配器仍只应用支持的既有根级元素，新图层不等于创建任意Cocos场景或Prefab。

## 工作区容器（与单布局分离）

工作区 JSON 顶层 kind=layout-workspace、version=1、activeId、screens。每项 screen 包含 id、document（完整版本1布局）、reference（null或{name,src}）。screen.id用于工作区切换；document.id是布局业务标识，两者不可混淆。每界面保留独立文档与参考图。

IndexedDB 的 documents 对象仓库以 workspace 键保存完整界面集，同时以 current 键保存当前布局兼容旧版读取。启动优先恢复workspace；旧localStorage布局仅作回退。切换保留各界面内存状态，但重置当前撤销/重做历史；未显式保存的修改不保证刷新后存在，没有自动保存。

当前布局导出仅打包该文档assets；界面集导出遍历全部screens并打包assets和reference为data URL，迁移多界面时应选后者。导入根据kind检测工作区，旧单布局继续可用。参考图由PNG/JPG/WebP/GIF上传，15MB以内，每界面一张可替换；参考图透明度与叠加开关是视图控制，不是游戏节点。

缩略图条用于切换与识别界面，不是引擎级场景导出器；Cocos适配仍只处理当前已支持主城根级Sprite集合。其他界面须先实现各自引擎适配才能写回游戏。
