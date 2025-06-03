# React Native Avatar Editor

一个功能强大的React Native头像编辑组件，支持拖拽、缩放、旋转和相框叠加功能。

## 功能特性

- 📸 支持从相册选择或拍摄照片
- ✋ 手势操作：拖拽移动、双指缩放、旋转
- 🖼️ 相框叠加功能
- 💾 图片合成和保存到相册
- 🔄 重置和重新编辑功能
- 📱 支持iOS和Android平台

## 安装

```bash
npm install react-native-avatar-editor
# 或
yarn add react-native-avatar-editor
```

### 依赖安装

此组件依赖以下库，请确保已正确安装：

```bash
npm install react-native-gesture-handler react-native-view-shot react-native-syan-image-picker @react-native-community/cameraroll
```

### iOS配置

在`ios/Podfile`中添加：

```ruby
pod 'RNCameraRoll', :path => '../node_modules/@react-native-community/cameraroll'
```

在`Info.plist`中添加权限：

```xml
<key>NSCameraUsageDescription</key>
<string>需要访问相机来拍摄头像</string>
<key>NSPhotoLibraryUsageDescription</key>
<string>需要访问相册来选择头像</string>
<key>NSPhotoLibraryAddUsageDescription</key>
<string>需要保存图片到相册</string>
```

### Android配置

在`android/app/src/main/AndroidManifest.xml`中添加权限：

```xml
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
```

## 使用方法

### 基础使用

```jsx
import React, { useRef } from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import AvatarEditor from 'react-native-avatar-editor';

const App = () => {
  const avatarEditorRef = useRef(null);

  const handleSelectAvatar = () => {
    avatarEditorRef.current?.selectAvatarFromGallery();
  };

  const handleCaptureImage = async () => {
    try {
      const imageUri = await avatarEditorRef.current?.captureImage();
      console.log('合成的图片URI:', imageUri);
    } catch (error) {
      console.error('合成失败:', error);
    }
  };

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <AvatarEditor
        ref={avatarEditorRef}
        defaultAvatarUri={require('./assets/default-avatar.png')}
        frameUri={require('./assets/frame.png')}
        width={300}
        height={300}
        clipStyle={{
          width: 250,
          height: 250,
          borderRadius: 125,
          overflow: 'hidden'
        }}
        onAvatarSelected={(uri) => console.log('头像已选择:', uri)}
        onImageCaptured={(uri) => console.log('图片已合成:', uri)}
      />
      
      <TouchableOpacity onPress={handleSelectAvatar}>
        <Text>选择头像</Text>
      </TouchableOpacity>
      
      <TouchableOpacity onPress={handleCaptureImage}>
        <Text>合成图片</Text>
      </TouchableOpacity>
    </View>
  );
};

export default App;
```

## API 文档

### Props

| 属性 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| `defaultAvatarUri` | `ImageSourcePropType` | - | 默认头像图片 |
| `frameUri` | `ImageSourcePropType` | - | 相框图片 |
| `width` | `number` | `screenWidth - 40` | 编辑器宽度 |
| `height` | `number` | `screenWidth - 40` | 编辑器高度 |
| `clipStyle` | `ViewStyle` | `{}` | 裁剪区域样式 |
| `onAvatarSelected` | `(uri: ImageSourcePropType) => void` | - | 头像选择回调 |
| `onImageCaptured` | `(uri: string) => void` | - | 图片合成回调 |
| `onImageSaved` | `(uri: any) => void` | - | 图片保存回调 |

### Ref 方法

| 方法 | 描述 |
|------|------|
| `selectAvatar()` | 选择头像（相册+拍摄选择） |
| `selectAvatarFromGallery()` | 从相册选择头像 |
| `takeAvatarPhoto()` | 拍摄头像 |
| `captureImage()` | 合成图片，返回Promise\<string\> |
| `saveToGallery(imageUri: string)` | 保存图片到相册 |
| `resetAvatar()` | 重置头像到初始状态 |
| `getCurrentAvatarUri()` | 获取当前头像URI |

## 示例项目

在 `example` 目录中包含了完整的示例项目。运行示例：

```bash
cd example
npm install
# iOS
npx react-native run-ios
# Android
npx react-native run-android
```

## 手势操作

- **单指拖拽**：移动头像位置
- **双指缩放**：调整头像大小
- **双指旋转**：旋转头像角度

## 许可证

MIT License

## 贡献

欢迎提交 Issues 和 Pull Requests！

## 更新日志

### 1.0.0
- 初始版本发布
- 支持基础的头像编辑功能
- 支持手势操作
- 支持相框叠加 