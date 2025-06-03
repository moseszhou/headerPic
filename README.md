# 头像编辑器

这是一个React Native应用程序，用于编辑头像并将其与相框合成。采用组件化设计，将核心功能封装在AvatarEditor组件中。

## 功能

- 显示头像图片和相框图片
- **支持从相册选择头像图片**
- **支持拍摄头像图片**
- 支持头像图片的缩放、旋转和移动操作
- 使用相框裁剪头像图片（相框覆盖在头像上方，头像只通过相框透明区域显示）
- 将裁剪后的头像与相框合成一张最终图片
- **保存合成图片到设备相册**
- 预览合成结果
- **支持自定义编辑器尺寸**

## 架构设计

### AvatarEditor组件

核心编辑组件，封装了所有头像编辑相关的功能：

#### Props
- `defaultAvatarUri`: 默认头像图片资源
- `frameUri`: 相框图片资源
- `width`: 编辑器宽度（可选，默认为屏幕宽度-40）
- `height`: 编辑器高度（可选，默认为屏幕宽度-40）
- `clipStyle`: 头像裁剪容器的样式（可选，默认为空对象）。用于定义头像显示区域的样式，支持设置宽度、高度、圆角等属性，例如：
  ```javascript
  clipStyle={{
    width: 300,
    height: 300,
    borderRadius: 150,
    overflow: "hidden"
  }}
  ```
- `onAvatarSelected`: 头像选择回调函数
- `onImageCaptured`: 图片合成回调函数
- `onImageSaved`: 图片保存回调函数

#### API方法（通过ref调用）
```javascript
// 选择头像（显示相册+拍摄选项）
avatarEditorRef.current.selectAvatar();

// 仅从相册选择头像
avatarEditorRef.current.selectAvatarFromGallery();

// 仅拍摄头像
avatarEditorRef.current.takeAvatarPhoto();

// 合成图片
const imageUri = await avatarEditorRef.current.captureImage();

// 保存到相册
await avatarEditorRef.current.saveToGallery(imageUri);

// 重置头像
avatarEditorRef.current.resetAvatar();

// 获取当前头像URI
const currentUri = avatarEditorRef.current.getCurrentAvatarUri();
```

#### 使用示例
```javascript
import AvatarEditor from './components/AvatarEditor';

const MyComponent = () => {
  const avatarEditorRef = useRef(null);
  
  const handleSelectAvatar = () => {
    avatarEditorRef.current?.selectAvatar();
  };
  
  return (
    <AvatarEditor 
      ref={avatarEditorRef}
      defaultAvatarUri={require('./assets/avatar.png')}
      frameUri={require('./assets/frame.png')}
      width={300}
      height={300}
      onAvatarSelected={(uri) => console.log('头像已选择', uri)}
      onImageCaptured={(uri) => console.log('图片已合成', uri)}
      onImageSaved={(uri) => console.log('图片已保存', uri)}
    />
  );
};
```

## 使用的第三方库

- react-native-gesture-handler：处理手势操作
- react-native-view-shot：截图功能，用于合成最终图像
- react-native-syan-image-picker：从相册选择图片
- @react-native-community/cameraroll：稳定可靠的相册操作库

## 安装依赖

由于依赖版本兼容性，项目中包含了`.npmrc`文件来处理版本冲突：

```bash
npm install
```

如果遇到依赖冲突，也可以使用：
```bash
npm install --legacy-peer-deps
```

## 使用方法

1. 打开应用后，将显示默认头像和相框
2. 选择头像来源：
   - 点击"选择相册"按钮从相册选择头像图片
   - 点击"拍摄头像"按钮使用相机拍摄头像
3. 使用手势调整头像的位置、大小和角度：
   - 单指拖动：移动头像位置
   - 双指缩放：调整头像大小
   - 双指旋转：旋转头像角度
4. 调整满意后点击"合成图片"按钮
5. 预览合成结果，可以选择：
   - "重新编辑"：返回编辑模式
   - "保存到相册"：将合成图片保存到设备相册
   - "重置头像"：重置为默认头像

## 权限要求

### Android
- **相机权限**：用于拍摄头像
- 存储权限：用于保存图片到相册
- 相册访问权限：用于选择头像图片

### iOS  
- **相机权限**：用于拍摄头像（系统会自动请求）
- 相册访问权限：用于选择和保存图片（系统会自动请求）

应用会在需要时自动请求相应权限。

## 技术特点

- **组件化设计**：核心功能封装在AvatarEditor组件中
- **API接口**：通过ref提供方法调用，而不是按钮UI
- **可自定义尺寸**：支持设置编辑器的宽度和高度
- **裁剪边界**：头像超出编辑器边界的部分不可见
- 相框图片覆盖在头像图片上方
- 头像只在相框的透明区域可见，实现真正的"相框裁剪"效果
- 支持多种手势同时操作（平移、缩放、旋转）
- 使用ViewShot进行高质量截图合成
- 使用稳定版本的CameraRoll库，确保保存功能正常工作

## 故障排除

### 保存到相册后看不到图片？

1. **检查权限**：确保应用有相册写入权限
2. **重启相册应用**：有时需要刷新相册才能看到新图片
3. **检查Android版本**：Android 10+可能需要额外配置

### 依赖安装问题？

使用以下命令强制安装：
```bash
npm install --legacy-peer-deps --force
```

### 手势不响应？

确保使用了GestureHandlerRootView包裹应用：
```javascript
import { GestureHandlerRootView } from 'react-native-gesture-handler';

return (
  <GestureHandlerRootView style={{flex: 1}}>
    {/* 你的应用内容 */}
  </GestureHandlerRootView>
);
```

## 自定义

应用使用了src/assets目录中的本地图片：
- header.png - 默认头像图片
- kfc.png - 相框图片（必须是带透明区域的PNG格式）

如果要更换相框，请替换kfc.png文件，或在App.js中修改相框导入路径：

```javascript
const frameUri = require('./src/assets/kfc.png');
```

注意：相框图片必须是PNG格式，且包含透明区域，透明部分将显示头像内容。 