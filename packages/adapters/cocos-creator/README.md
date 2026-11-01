# Cocos Creator runtime adapter

维护源位于 runtime/LayoutBridge.ts。通过根目录 node scripts/sync-game-adapter.mjs three-kingdoms-city 显式复制到游戏并更新哈希锁。游戏运行时只使用 assets/scripts/LayoutBridge.ts；不可从根 packages 导入运行时源码。同步后重新编译和验证游戏。
