# AvatarEditor 使用示例

本文档展示如何使用 AvatarEditor 的各种方法，并传入自定义的 options 参数。

## 基本使用

```jsx
import React, { useRef } from 'react';
import { View, Button } from 'react-native';
import AvatarEditor from '@your-package/avatar-editor';

const MyComponent = () => {
  const avatarEditorRef = useRef(null);

  return (
    <View>
      <AvatarEditor
        ref={avatarEditorRef}
        defaultAvatarUri={require('./default-avatar.png')}
        frameUri={require('./frame.png')}
        width={300}
        height={300}
      />
      
      {/* 使用默认选项 */}
      <Button 
        title="选择头像（默认选项）" 
        onPress={() => avatarEditorRef.current?.selectAvatar()} 
      />
      
      {/* 使用自定义选项 */}
      <Button 
        title="选择头像（自定义选项）" 
        onPress={() => avatarEditorRef.current?.selectAvatar({
          quality: 80,
          isCrop: true,
          CropW: 400,
          CropH: 400,
          showCropCircle: true
        })} 
      />
    </View>
  );
};
```

## API 方法示例

### 0. option

组件调用时，支持传入一个 `options` 对象，可设置的属性如下：

| 属性名 | 类型 | 是否可选 | 默认值 | 描述 |
|--------|------|----------|--------|------|
| imageCount | int | 是 | 6 | 最大选择图片数目 |
| isRecordSelected | bool | 是 | false | 记录当前已选中的图片 |
| isCamera | bool | 是 | true | 是否允许用户在内部拍照 |
| isCrop | bool | 是 | false | 是否允许裁剪，imageCount 为1才生效 |
| CropW | int | 是 | screenW * 0.6 | 裁剪宽度，默认屏幕宽度60% |
| CropH | int | 是 | screenW * 0.6 | 裁剪高度，默认屏幕宽度60% |
| isGif | bool | 是 | false | 是否允许选择GIF，暂无回调GIF数据 |
| showCropCircle | bool | 是 | false | 是否显示圆形裁剪区域 |
| circleCropRadius | float | 是 | screenW * 0.5 | 圆形裁剪半径，默认屏幕宽度一半 |
| showCropFrame | bool | 是 | true | 是否显示裁剪区域 |
| showCropGrid | bool | 是 | false | 是否隐藏裁剪区域网格 |
| compress | bool | 是 | true | 是否开启压缩（不开启压缩部分图片属性无法获得） |
| compressFocusAlpha | bool | 是 | false | 压缩时保留图片透明度（开启后png压缩后尺寸会变大但是透明度会保留） |
| quality | int | 是 | 90 | 压缩质量(安卓无效，固定鲁班压缩) |
| minimumCompressSize | int | 是 | 100 | 小于100kb的图片不压缩（Android） |
| enableBase64 | bool | 是 | false | 是否返回base64编码，默认不返回 |
| freeStyleCropEnabled | bool | 是 | false | 裁剪框是否可拖拽（Android） |
| rotateEnabled | bool | 是 | true | 裁剪是否可旋转图片（Android） |
| scaleEnabled | bool | 是 | true | 裁剪是否可放大缩小图片（Android） |
| showSelectedIndex | bool | 是 | false | 是否显示序号 |

**注意事项：**
- 部分选项可能仅在特定平台（Android/iOS）上有效
- 裁剪相关选项需要 `isCrop` 为 `true` 且 `imageCount` 为 1 时才生效
- 压缩选项会影响最终图片的大小和质量

### 1. selectAvatar(options?)

选择头像（支持相机和相册）

```javascript
// 使用默认选项
avatarEditorRef.current?.selectAvatar();

// 使用自定义选项
avatarEditorRef.current?.selectAvatar({
  quality: 80,           // 图片质量
  isCrop: true,          // 启用裁剪
  CropW: 400,            // 裁剪宽度
  CropH: 400,            // 裁剪高度
  showCropCircle: true,  // 显示圆形裁剪框
  allowTakePhoto: true,  // 允许拍照
  allowPickingPhoto: true // 允许从相册选择
});
```

### 2. selectAvatarFromGallery(options?)

从相册选择头像

```javascript
// 使用默认选项
avatarEditorRef.current?.selectAvatarFromGallery();

// 使用自定义选项
avatarEditorRef.current?.selectAvatarFromGallery({
  quality: 95,
  isCrop: true,
  showCropGrid: true,
  enableBase64: true
});
```

### 3. takeAvatarPhoto(options?)

拍摄头像

```javascript
// 使用默认选项
avatarEditorRef.current?.takeAvatarPhoto();

// 使用自定义选项
avatarEditorRef.current?.takeAvatarPhoto({
  quality: 90,
  isCrop: false,
  allowPickingOriginalPhoto: false
});
```

### 4. captureImage(options?)

合成并截图

```javascript
// 使用默认选项
const imageUri = await avatarEditorRef.current?.captureImage();

// 使用自定义选项
const imageUri = await avatarEditorRef.current?.captureImage({
  quality: 0.8,
  format: 'jpg',
  result: 'base64'
});
```

### 5. saveToGallery(imageUri)

保存到相册

```javascript
try {
  const imageUri = await avatarEditorRef.current?.captureImage();
  const result = await avatarEditorRef.current?.saveToGallery(imageUri);
  console.log('保存成功:', result);
} catch (error) {
  console.error('保存失败:', error);
}
```

## 完整使用示例

```jsx
import React, { useRef } from 'react';
import { View, Button, Alert } from 'react-native';
import AvatarEditor from '@your-package/avatar-editor';

const AdvancedAvatarEditor = () => {
  const avatarEditorRef = useRef(null);

  const handleSelectWithCrop = () => {
    avatarEditorRef.current?.selectAvatar({
      quality: 90,
      isCrop: true,
      CropW: 300,
      CropH: 300,
      showCropCircle: true,
      showCropFrame: true,
      showCropGrid: false
    });
  };

  const handleCaptureAndSave = async () => {
    try {
      // 高质量截图
      const imageUri = await avatarEditorRef.current?.captureImage({
        quality: 1.0,
        format: 'png'
      });
      
      // 保存到相册
      await avatarEditorRef.current?.saveToGallery(imageUri);
      Alert.alert('成功', '头像已保存到相册');
    } catch (error) {
      Alert.alert('错误', '保存失败: ' + error.message);
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
        onAvatarSelected={(uri) => console.log('选择了头像:', uri)}
        onImageCaptured={(uri) => console.log('截图完成:', uri)}
        onImageSaved={(result) => console.log('保存成功:', result)}
      />
      
      <Button title="选择并裁剪头像" onPress={handleSelectWithCrop} />
      <Button title="合成并保存" onPress={handleCaptureAndSave} />
    </View>
  );
};

export default AdvancedAvatarEditor;
```

## 选项参数说明

### ImagePickerOptions

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| imageCount | number | 6 | 最大选择图片数目 |
| isRecordSelected | boolean | false | 记录当前已选中的图片 |
| isCamera | boolean | true | 是否允许用户在内部拍照 |
| isCrop | boolean | false | 是否允许裁剪，imageCount 为1才生效 |
| CropW | number | screenW * 0.6 | 裁剪宽度，默认屏幕宽度60% |
| CropH | number | screenW * 0.6 | 裁剪高度，默认屏幕宽度60% |
| isGif | boolean | false | 是否允许选择GIF，暂无回调GIF数据 |
| showCropCircle | boolean | false | 是否显示圆形裁剪区域 |
| circleCropRadius | number | screenW * 0.5 | 圆形裁剪半径，默认屏幕宽度一半 |
| showCropFrame | boolean | true | 是否显示裁剪区域 |
| showCropGrid | boolean | false | 是否隐藏裁剪区域网格 |
| compress | boolean | true | 是否开启压缩（不开启压缩部分图片属性无法获得） |
| compressFocusAlpha | boolean | false | 压缩时保留图片透明度（开启后png压缩后尺寸会变大但是透明度会保留） |
| quality | number | 90 | 压缩质量(安卓无效，固定鲁班压缩) |
| minimumCompressSize | number | 100 | 小于100kb的图片不压缩（Android） |
| enableBase64 | boolean | false | 是否返回base64编码，默认不返回 |
| freeStyleCropEnabled | boolean | false | 裁剪框是否可拖拽（Android） |
| rotateEnabled | boolean | true | 裁剪是否可旋转图片（Android） |
| scaleEnabled | boolean | true | 裁剪是否可放大缩小图片（Android） |
| showSelectedIndex | boolean | false | 是否显示序号 |
| allowPickingOriginalPhoto | boolean | true | 允许选择原图 |
| allowPickingMultipleVideo | boolean | false | 允许选择多个视频 |
| allowTakePhoto | boolean | true | 允许拍照 |
| allowPickingPhoto | boolean | true | 允许从相册选择 |

### CaptureOptions

| 参数 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| quality | number | 1 | 截图质量 (0-1) |
| format | string | 'png' | 输出格式: 'png', 'jpg', 'webm' |
| result | string | 'tmpfile' | 结果类型: 'tmpfile', 'base64', 'zip-base64', 'data-uri' |
| snapshotContentContainer | boolean | false | 是否截图内容容器 |

## 高级选项使用示例

### 单图裁剪示例

```javascript
// 启用单图裁剪，显示圆形裁剪框
avatarEditorRef.current?.selectAvatar({
  imageCount: 1,          // 只选择一张图片
  isCrop: true,           // 启用裁剪
  showCropCircle: true,   // 显示圆形裁剪框
  circleCropRadius: 150,  // 设置圆形裁剪半径
  quality: 95,            // 高质量压缩
  compress: true,         // 启用压缩
  compressFocusAlpha: true, // 保留透明度
  showCropGrid: true,     // 显示网格辅助线
  freeStyleCropEnabled: true, // 允许自由拖拽裁剪框 (Android)
  rotateEnabled: true,    // 允许旋转 (Android)
  scaleEnabled: true      // 允许缩放 (Android)
});
```

### 多图选择示例

```javascript
// 选择多张图片，不裁剪
avatarEditorRef.current?.selectAvatar({
  imageCount: 9,          // 最多选择9张图片
  isRecordSelected: true, // 记录已选中的图片
  isCamera: true,         // 允许拍照
  isCrop: false,          // 不启用裁剪
  isGif: true,           // 允许选择GIF
  quality: 80,           // 中等质量压缩
  enableBase64: false,   // 不返回base64
  showSelectedIndex: true, // 显示选择序号
  minimumCompressSize: 200 // 小于200kb的图片不压缩
});
```

### 相册专用示例

```javascript
// 只从相册选择，不显示相机
avatarEditorRef.current?.selectAvatarFromGallery({
  imageCount: 1,
  isCamera: false,        // 不显示相机选项
  allowTakePhoto: false,  // 不允许拍照
  allowPickingPhoto: true, // 只允许从相册选择
  isCrop: true,
  CropW: 400,            // 自定义裁剪宽度
  CropH: 400,            // 自定义裁剪高度
  showCropFrame: true,   // 显示裁剪框
  quality: 90
});
```

### 拍照专用示例

```javascript
// 只允许拍照，不显示相册
avatarEditorRef.current?.takeAvatarPhoto({
  allowTakePhoto: true,   // 只允许拍照
  allowPickingPhoto: false, // 不允许从相册选择
  isCrop: true,
  showCropCircle: false,  // 使用方形裁剪框
  showCropFrame: true,
  showCropGrid: false,
  quality: 85,
  compress: true
});
```

