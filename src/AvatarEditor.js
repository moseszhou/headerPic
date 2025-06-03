/**
 * @fileoverview AvatarEditor 头像编辑器组件
 * 
 * 一个功能完整的React Native头像编辑器组件，支持：
 * - 图片选择（相机/相册）
 * - 图片手势操作（缩放、旋转、平移）
 * - 相框合成
 * - 图片裁剪
 * - 图片保存到相册
 * 
 * 基于以下第三方库构建：
 * - react-native-gesture-handler: 手势处理
 * - react-native-view-shot: 视图截图
 * - react-native-syan-image-picker: 图片选择
 * - @react-native-community/cameraroll: 相册操作
 * 
 * @author Your Name
 * @version 1.0.0
 * @since 2024
 */

import React, { useRef, useState, useImperativeHandle, forwardRef } from 'react';
import {
  View,
  Image,
  StyleSheet,
  Dimensions,
  Animated,
  Platform,
  PermissionsAndroid,
  Alert,
} from 'react-native';
import {
  PanGestureHandler,
  PinchGestureHandler,
  RotationGestureHandler,
  State,
} from 'react-native-gesture-handler';
import ViewShot from 'react-native-view-shot';
import ImagePicker from 'react-native-syan-image-picker';
import CameraRoll from '@react-native-community/cameraroll';

const { width: screenWidth } = Dimensions.get('window');

/**
 * AvatarEditor - 头像编辑器组件
 * 支持图片选择、裁剪、缩放、旋转、平移等功能，并可以与相框进行合成
 * 
 * @component
 * @param {Object} props - 组件属性
 * @param {import('react-native').ImageSourcePropType} [props.defaultAvatarUri] - 默认头像图片源
 * @param {import('react-native').ImageSourcePropType} [props.frameUri] - 相框图片源
 * @param {number} [props.width] - 编辑器宽度，默认为屏幕宽度-40
 * @param {number} [props.height] - 编辑器高度，默认为屏幕宽度-40
 * @param {import('react-native').ViewStyle} [props.clipStyle] - 裁剪样式
 * @param {Function} [props.onAvatarSelected] - 头像选择回调函数
 * @param {Function} [props.onImageCaptured] - 图片合成回调函数
 * @param {Function} [props.onImageSaved] - 图片保存回调函数
 * @param {import('react').Ref} ref - 组件引用，用于调用对外API
 * 
 * @example
 * import React, { useRef } from 'react';
 * import { View, Button } from 'react-native';
 * import AvatarEditor from './AvatarEditor';
 * 
 * const MyComponent = () => {
 *   const avatarEditorRef = useRef(null);
 * 
 *   return (
 *     <View>
 *       <AvatarEditor
 *         ref={avatarEditorRef}
 *         defaultAvatarUri={require('./default-avatar.png')}
 *         frameUri={require('./frame.png')}
 *         width={300}
 *         height={300}
 *         onAvatarSelected={(uri) => console.log('选择了头像:', uri)}
 *         onImageCaptured={(uri) => console.log('截图完成:', uri)}
 *         onImageSaved={(result) => console.log('保存成功:', result)}
 *       />
 *       <Button 
 *         title="选择头像" 
 *         onPress={() => avatarEditorRef.current?.selectAvatar()} 
 *       />
 *     </View>
 *   );
 * };
 */
const AvatarEditor = forwardRef(({
  defaultAvatarUri,
  frameUri,
  width = screenWidth - 40,
  height = screenWidth - 40,
  clipStyle = {},
  onAvatarSelected,
  onImageCaptured,
  onImageSaved
}, ref) => {
  // 状态管理
  const [avatarUri, setAvatarUri] = useState(defaultAvatarUri);

  // 使用React Native原生Animated值
  const scale = useRef(new Animated.Value(1)).current;
  const rotation = useRef(new Animated.Value(0)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;

  // 跟踪基础值以便累积变换
  const [baseScale, setBaseScale] = useState(1);
  const [baseRotation, setBaseRotation] = useState(0);
  const [baseTranslateX, setBaseTranslateX] = useState(0);
  const [baseTranslateY, setBaseTranslateY] = useState(0);

  // ViewShot引用
  const viewShotRef = useRef(null);

  // 请求相册权限
  const requestStoragePermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          {
            title: '相册权限',
            message: '应用需要相册权限来保存图片',
            buttonNeutral: '稍后询问',
            buttonNegative: '取消',
            buttonPositive: '确定',
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    return true;
  };

  /**
   * 选择头像图片（支持相机和相册）
   * @param {Object} [customOptions={}] - 自定义选项配置
   * @param {number} [customOptions.imageCount=1] - 最大选择图片数目
   * @param {boolean} [customOptions.isRecordSelected=false] - 记录当前已选中的图片
   * @param {boolean} [customOptions.isCamera=true] - 是否允许用户在内部拍照
   * @param {boolean} [customOptions.isCrop=false] - 是否允许裁剪，imageCount 为1才生效
   * @param {number} [customOptions.CropW=300] - 裁剪宽度
   * @param {number} [customOptions.CropH=300] - 裁剪高度
   * @param {boolean} [customOptions.isGif=false] - 是否允许选择GIF
   * @param {boolean} [customOptions.showCropCircle=false] - 是否显示圆形裁剪区域
   * @param {number} [customOptions.circleCropRadius] - 圆形裁剪半径
   * @param {boolean} [customOptions.showCropFrame=true] - 是否显示裁剪区域
   * @param {boolean} [customOptions.showCropGrid=false] - 是否显示裁剪区域网格
   * @param {boolean} [customOptions.compress=true] - 是否开启压缩
   * @param {boolean} [customOptions.compressFocusAlpha=false] - 压缩时保留图片透明度
   * @param {number} [customOptions.quality=90] - 压缩质量(0-100)
   * @param {number} [customOptions.minimumCompressSize=100] - 小于指定kb的图片不压缩（Android）
   * @param {boolean} [customOptions.enableBase64=false] - 是否返回base64编码
   * @param {boolean} [customOptions.freeStyleCropEnabled=false] - 裁剪框是否可拖拽（Android）
   * @param {boolean} [customOptions.rotateEnabled=true] - 裁剪是否可旋转图片（Android）
   * @param {boolean} [customOptions.scaleEnabled=true] - 裁剪是否可放大缩小图片（Android）
   * @param {boolean} [customOptions.showSelectedIndex=false] - 是否显示序号
   * @param {boolean} [customOptions.allowTakePhoto=true] - 允许拍照
   * @param {boolean} [customOptions.allowPickingPhoto=true] - 允许从相册选择
   * @param {boolean} [customOptions.allowPickingOriginalPhoto=true] - 允许选择原图
   * @param {boolean} [customOptions.allowPickingMultipleVideo=false] - 允许选择多个视频
   * 
   * @example
   * // 使用默认选项
   * avatarEditorRef.current?.selectAvatar();
   * 
   * @example
   * // 使用自定义选项
   * avatarEditorRef.current?.selectAvatar({
   *   quality: 80,
   *   isCrop: true,
   *   CropW: 400,
   *   CropH: 400,
   *   showCropCircle: true
   * });
   */
  const selectAvatar = (customOptions = {}) => {
    const defaultOptions = {
      imageCount: 1,
      isCamera: true, // 启用相机功能
      isCrop: false,
      CropW: 300,
      CropH: 300,
      showCropCircle: false,
      showCropFrame: true,
      showCropGrid: false,
      quality: 90,
      enableBase64: false,
      allowPickingOriginalPhoto: true,
      allowPickingMultipleVideo: false,
      showSelectedIndex: false,
      // 启用相机和相册选择
      allowTakePhoto: true, // 允许拍照
      allowPickingPhoto: true, // 允许从相册选择
    };

    const options = { ...defaultOptions, ...customOptions };

    ImagePicker.showImagePicker(options, (error, photos) => {
      if (error) {
        console.log('ImagePicker错误:', error);
        return;
      }

      if (photos && photos.length > 0) {
        const selectedPhoto = photos[0];
        const newAvatarUri = { uri: selectedPhoto.uri };
        setAvatarUri(newAvatarUri);
        onAvatarSelected?.(newAvatarUri);
        console.log('选择的图片:', selectedPhoto);
      }
    });
  };

  /**
   * 从相册选择头像
   * @param {Object} [customOptions={}] - 自定义选项配置，参数同selectAvatar，但默认禁用相机
   * @param {boolean} [customOptions.isCamera=false] - 禁用相机，只显示相册
   * @param {boolean} [customOptions.allowTakePhoto=false] - 不允许拍照
   * @param {boolean} [customOptions.allowPickingPhoto=true] - 允许从相册选择
   * 
   * @example
   * // 使用默认选项
   * avatarEditorRef.current?.selectAvatarFromGallery();
   * 
   * @example
   * // 使用自定义选项
   * avatarEditorRef.current?.selectAvatarFromGallery({
   *   quality: 95,
   *   isCrop: true,
   *   showCropGrid: true,
   *   enableBase64: true
   * });
   */
  const selectAvatarFromGallery = (customOptions = {}) => {
    const defaultOptions = {
      imageCount: 1,
      isCamera: false, // 禁用相机，只显示相册
      isCrop: false,
      CropW: 300,
      CropH: 300,
      showCropCircle: false,
      showCropFrame: true,
      showCropGrid: false,
      quality: 90,
      enableBase64: false,
      allowPickingOriginalPhoto: true,
      allowPickingMultipleVideo: false,
      showSelectedIndex: false,
    };

    const options = { ...defaultOptions, ...customOptions };

    ImagePicker.showImagePicker(options, (error, photos) => {
      if (error) {
        console.log('从相册选择图片错误:', error);
        return;
      }

      if (photos && photos.length > 0) {
        const selectedPhoto = photos[0];
        const newAvatarUri = { uri: selectedPhoto.uri };
        setAvatarUri(newAvatarUri);
        onAvatarSelected?.(newAvatarUri);
        console.log('从相册选择的图片:', selectedPhoto);
      }
    });
  };

  /**
   * 拍摄头像
   * @param {Object} [customOptions={}] - 自定义选项配置，参数同selectAvatar，但默认只允许拍照
   * @param {boolean} [customOptions.allowTakePhoto=true] - 只允许拍照
   * @param {boolean} [customOptions.allowPickingPhoto=false] - 禁用相册选择
   * @param {boolean} [customOptions.isCamera=true] - 启用相机
   * 
   * @example
   * // 使用默认选项
   * avatarEditorRef.current?.takeAvatarPhoto();
   * 
   * @example
   * // 使用自定义选项
   * avatarEditorRef.current?.takeAvatarPhoto({
   *   quality: 90,
   *   isCrop: false,
   *   allowPickingOriginalPhoto: false
   * });
   */
  const takeAvatarPhoto = (customOptions = {}) => {
    const defaultOptions = {
      imageCount: 1,
      isCamera: true,
      isCrop: false,
      CropW: 300,
      CropH: 300,
      showCropCircle: false,
      showCropFrame: true,
      showCropGrid: false,
      quality: 90,
      enableBase64: false,
      allowPickingOriginalPhoto: true,
      allowPickingMultipleVideo: false,
      showSelectedIndex: false,
      allowTakePhoto: true, // 只允许拍照
      allowPickingPhoto: false, // 禁用相册选择
    };

    const options = { ...defaultOptions, ...customOptions };

    ImagePicker.openCamera(options, (error, photos) => {
      if (error) {
        console.log('拍摄头像错误:', error);
        return;
      }

      if (photos && photos.length > 0) {
        const selectedPhoto = photos[0];
        const newAvatarUri = { uri: selectedPhoto.uri };
        setAvatarUri(newAvatarUri);
        onAvatarSelected?.(newAvatarUri);
        console.log('拍摄的图片:', selectedPhoto);
      }
    });
  };

  /**
   * 合成图片（截取当前编辑器内容）
   * @param {Object} [captureOptions={}] - 截图选项配置
   * @param {number} [captureOptions.quality=1] - 截图质量 (0-1)
   * @param {'png'|'jpg'|'webm'} [captureOptions.format='png'] - 输出格式
   * @param {'tmpfile'|'base64'|'zip-base64'|'data-uri'} [captureOptions.result='tmpfile'] - 结果类型
   * @param {boolean} [captureOptions.snapshotContentContainer=false] - 是否截图内容容器
   * 
   * @returns {Promise<string>} 返回截图的URI或base64字符串
   * @throws {Error} 截图失败时抛出错误
   * 
   * @example
   * // 使用默认选项
   * const imageUri = await avatarEditorRef.current?.captureImage();
   * 
   * @example
   * // 使用自定义选项
   * const imageUri = await avatarEditorRef.current?.captureImage({
   *   quality: 0.8,
   *   format: 'jpg',
   *   result: 'base64'
   * });
   */
  const captureImage = async (captureOptions = {}) => {
    try {
      if (viewShotRef.current) {
        const defaultOptions = { quality: 1, format: 'png' };
        const options = { ...defaultOptions, ...captureOptions };
        const uri = await viewShotRef.current.capture(options);
        onImageCaptured?.(uri);
        return uri;
      }
    } catch (error) {
      console.error('截图失败:', error);
      throw error;
    }
  };

  /**
   * 保存图片到相册
   * @param {string} imageUri - 要保存的图片URI
   * 
   * @returns {Promise<any>} 返回保存结果
   * @throws {Error} 保存失败时抛出错误
   * 
   * @example
   * try {
   *   const imageUri = await avatarEditorRef.current?.captureImage();
   *   const result = await avatarEditorRef.current?.saveToGallery(imageUri);
   *   console.log('保存成功:', result);
   * } catch (error) {
   *   console.error('保存失败:', error);
   * }
   */
  const saveToGallery = async (imageUri) => {
    try {
      // 请求权限
      const hasPermission = await requestStoragePermission();
      if (!hasPermission) {
        throw new Error('需要相册权限才能保存图片');
      }

      // 使用原版CameraRoll保存图片
      const result = await CameraRoll.save(imageUri);
      onImageSaved?.(result);
      return result;
    } catch (error) {
      console.error('保存失败:', error);
      throw error;
    }
  };

  /**
   * 重置头像到默认状态
   * 重置头像图片为默认图片，并清除所有变换（缩放、旋转、平移）
   * 
   * @example
   * avatarEditorRef.current?.resetAvatar();
   */
  const resetAvatar = () => {
    setAvatarUri(defaultAvatarUri);
    // 重置所有变换
    scale.setValue(1);
    rotation.setValue(0);
    translateX.setValue(0);
    translateY.setValue(0);
    setBaseScale(1);
    setBaseRotation(0);
    setBaseTranslateX(0);
    setBaseTranslateY(0);
  };

  /**
   * 获取当前头像URI
   * @returns {import('react-native').ImageSourcePropType} 当前头像的URI或图片源
   * 
   * @example
   * const currentAvatar = avatarEditorRef.current?.getCurrentAvatarUri();
   * console.log('当前头像:', currentAvatar);
   */
  const getCurrentAvatarUri = () => avatarUri;

  /**
   * 暴露给父组件的方法
   * @typedef {Object} AvatarEditorRef
   * @property {Function} selectAvatar - 选择头像图片（支持相机和相册）
   * @property {Function} selectAvatarFromGallery - 从相册选择头像
   * @property {Function} takeAvatarPhoto - 拍摄头像
   * @property {Function} captureImage - 合成图片
   * @property {Function} saveToGallery - 保存图片到相册
   * @property {Function} resetAvatar - 重置头像到默认状态
   * @property {Function} getCurrentAvatarUri - 获取当前头像URI
   */
  useImperativeHandle(ref, () => ({
    selectAvatar,
    selectAvatarFromGallery,
    takeAvatarPhoto,
    captureImage,
    saveToGallery,
    resetAvatar,
    getCurrentAvatarUri,
  }));

  // 缩放手势处理
  const onPinchGestureEvent = Animated.event(
    [{ nativeEvent: { scale: scale } }],
    { useNativeDriver: true }
  );

  const onPinchHandlerStateChange = (event) => {
    if (event.nativeEvent.oldState === State.ACTIVE) {
      setBaseScale(baseScale * event.nativeEvent.scale);
      scale.setValue(1);
    }
  };

  // 旋转手势处理
  const onRotateGestureEvent = Animated.event(
    [{ nativeEvent: { rotation: rotation } }],
    { useNativeDriver: true }
  );

  const onRotateHandlerStateChange = (event) => {
    if (event.nativeEvent.oldState === State.ACTIVE) {
      setBaseRotation(baseRotation + event.nativeEvent.rotation);
      rotation.setValue(0);
    }
  };

  // 平移手势处理
  const onPanGestureEvent = Animated.event(
    [{
      nativeEvent: {
        translationX: translateX,
        translationY: translateY
      }
    }],
    { useNativeDriver: true }
  );

  const onPanHandlerStateChange = (event) => {
    if (event.nativeEvent.oldState === State.ACTIVE) {
      setBaseTranslateX(baseTranslateX + event.nativeEvent.translationX);
      setBaseTranslateY(baseTranslateY + event.nativeEvent.translationY);
      translateX.setValue(0);
      translateY.setValue(0);
    }
  };

  // 手势处理器引用
  const pinchRef = useRef(null);
  const rotationRef = useRef(null);
  const panRef = useRef(null);

  // 合并所有变换
  const imageTransform = [
    { translateX: Animated.add(translateX, new Animated.Value(baseTranslateX)) },
    { translateY: Animated.add(translateY, new Animated.Value(baseTranslateY)) },
    {
      scale: Animated.multiply(
        scale,
        new Animated.Value(baseScale)
      )
    },
    {
      rotate: Animated.add(
        rotation,
        new Animated.Value(baseRotation)
      ).interpolate({
        inputRange: [-100, 100],
        outputRange: ['-100rad', '100rad']
      })
    },
  ];

  const containerStyle = {
    width,
    height,
  };

  const avatarImageStyle = {
    width: width * 0.9,
    height: height * 0.9,
  };

  const frameImageStyle = {
    width,
    height,
  };

  return (
    <ViewShot
      ref={viewShotRef}
      options={{ quality: 1, format: 'png' }}
      style={[styles.container, containerStyle]}
    >
      <View style={[styles.editorContainer, containerStyle]}>
        {/* 嵌套手势处理器以支持所有手势类型 */}
        <PanGestureHandler
          ref={panRef}
          onGestureEvent={onPanGestureEvent}
          onHandlerStateChange={onPanHandlerStateChange}
          minDist={10}
          simultaneousHandlers={[pinchRef, rotationRef]}
        >
          <Animated.View style={styles.gestureContainer}>
            <RotationGestureHandler
              ref={rotationRef}
              simultaneousHandlers={[pinchRef, panRef]}
              onGestureEvent={onRotateGestureEvent}
              onHandlerStateChange={onRotateHandlerStateChange}
            >
              <Animated.View style={styles.gestureContainer}>
                <PinchGestureHandler
                  ref={pinchRef}
                  simultaneousHandlers={[rotationRef, panRef]}
                  onGestureEvent={onPinchGestureEvent}
                  onHandlerStateChange={onPinchHandlerStateChange}
                >
                  <Animated.View style={styles.gestureContainer}>
                    {/* 使用两层视图叠加的方式 */}
                    <View style={styles.layerContainer}>
                      {/* 底层：头像图片，可以缩放、旋转和移动 */}
                      <View style={clipStyle}>
                        <Animated.Image
                          source={typeof avatarUri === 'object' && avatarUri.uri ? avatarUri : avatarUri}
                          style={[
                            styles.avatarImage,
                            avatarImageStyle,
                            { transform: imageTransform }
                          ]}
                          resizeMode="contain"
                        />
                      </View>
                      {/* 上层：相框图片，位置固定，头像只通过相框透明部分显示 */}
                      <Image
                        source={frameUri}
                        style={[styles.frameImage, frameImageStyle]}
                        resizeMode="contain"
                      />
                    </View>
                  </Animated.View>
                </PinchGestureHandler>
              </Animated.View>
            </RotationGestureHandler>
          </Animated.View>
        </PanGestureHandler>
      </View>
    </ViewShot>
  );
});

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  editorContainer: {
    overflow: 'hidden', // 确保头像超出部分不可见
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  gestureContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  layerContainer: {
    width: '100%',
    height: '100%',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarImage: {
    position: 'absolute',
    zIndex: 1,
  },
  frameImage: {
    position: 'absolute',
    zIndex: 2, // 确保框架在头像之上
  },
});

export default AvatarEditor; 