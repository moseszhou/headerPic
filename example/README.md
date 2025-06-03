# Avatar Editor Example

这是 React Native Avatar Editor 组件的示例应用。

## 运行示例

1. 安装依赖：
```bash
npm install
```

2. 安装iOS依赖（仅限iOS）：
```bash
cd ios && pod install && cd ..
```

3. 运行应用：
```bash
# iOS
npx react-native run-ios

# Android
npx react-native run-android
```

## 功能演示

此示例应用展示了 AvatarEditor 组件的以下功能：

- 从相册选择头像图片
- 拍摄头像照片
- 使用手势调整头像（拖拽、缩放、旋转）
- 合成最终图片
- 保存图片到相册
- 重置头像编辑

## 注意事项

- 确保设备已连接或模拟器正在运行
- iOS需要真机测试相机功能
- Android需要授予相机和存储权限 