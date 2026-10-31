# 可借鉴的开源图形编辑基础

核对日期：2026-11-01。以下区分“画布交互库”与“完整可发布编辑器”，许可证以采用时的官方仓库版本为准。本次没有替换现有 DOM 渲染器，也没有添加第三方依赖。

## 候选比较

| 项目 | 相关能力 | 对本项目的用途 |
|---|---|---|
| Konva | Stage / Layer / Group 场景树、事件命中、拖拽、变换；Transformer 负责选择、缩放和旋转 | 若后续需要更成熟的多选、复杂父子变换和 Canvas 性能，可作为渲染/交互层候选；仍需自建图层列表、属性面板、业务 JSON 和 Cocos 适配 |
| Fabric.js | 对象化 Canvas、交互控制与 SVG 导入导出 | 偏通用图形/排版编辑时有价值；其对象序列化不能直接代替游戏引擎布局协议 |
| tldraw | React 无限画布 SDK、形状、分组、历史与 UI | 更偏白板工具；其 SDK 许可不应直接等同 MIT 开源，生产使用需先核对官方许可与 key 要求 |

Konva 与 Fabric.js 官方仓库 LICENSE 均采用 MIT，可在保留相应版权与许可文本的条件下使用。见 [Konva LICENSE](https://github.com/konvajs/konva/blob/master/LICENSE)、[Fabric.js LICENSE](https://github.com/fabricjs/fabric.js/blob/master/LICENSE)。

## 为什么优先观察 Konva

Konva 的 Stage → Layer → Group/Shape 模型与“图层包含元素、元素可以分组”接近；官方明确区分 Layer 与 Group，而不是将每一个图片元素都称为一个独立图层。每层有场景与命中检测画布，可按层绘制。见 [官方概览](https://konvajs.org/docs/overview.html)。

Transformer 可作用于单个或多个节点，支持缩放和旋转；其缩放默认修改 scaleX/scaleY 而非 width/height。这一点若未来接入，需要与当前布局 JSON 和引擎桥的尺寸语义统一。见 [官方变换示例](https://konvajs.org/docs/select_and_transform/Basic_demo.html)。

这只是后续技术选型建议，不是当前实现已经使用 Konva 的声明。现有独立 schema、历史和适配器应继续保持为边界，避免把某个库的内部序列化格式直接固化为游戏数据。

## Fabric 与 tldraw 的边界

Fabric.js 适合 SVG/Canvas 对象工作流，官方仓库提供能力和使用入口：[Fabric.js](https://github.com/fabricjs/fabric.js)。若采用它，仍需定义图层分组、游戏热区和引擎资源引用，不能仅加载 SVG 就认为完成 Cocos 接入。

tldraw 的源码可查看，但“源码可读”与宽松开源许可证不同；发布商业或生产应用前应根据 [官方许可说明](https://tldraw.dev/community/license) 确认适用授权与 license key。这里不将其无条件归类为 MIT 开源替代品。

## 本次实现原则

保留现有轻量编辑器，补足显式图层、元素归属、活动层隔离、图层显隐/锁定和排序。库可以帮助图形交互，业务结构仍需在文档模型中明确：图层是有序容器，图片/文字是层内元素；父子关系用于局部变换，不与图层归属混为一谈。迁移渲染器应由实际复杂度、性能或交互缺陷驱动，本次不进行架构替换。
