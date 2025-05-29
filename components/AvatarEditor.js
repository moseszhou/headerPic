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

const AvatarEditor = forwardRef(({ 
  defaultAvatarUri, 
  frameUri, 
  width = screenWidth - 40,
  height = screenWidth - 40,
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

  // 选择头像图片（支持相机和相册）
  const selectAvatar = () => {
    const options = {
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

  // 从相册选择头像
  const selectAvatarFromGallery = () => {
    const options = {
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

  // 拍摄头像
  const takeAvatarPhoto = () => {
    const options = {
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

    ImagePicker.showImagePicker(options, (error, photos) => {
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

  // 合成图片
  const captureImage = async () => {
    try {
      if (viewShotRef.current) {
        const uri = await viewShotRef.current.capture();
        onImageCaptured?.(uri);
        return uri;
      }
    } catch (error) {
      console.error('截图失败:', error);
      throw error;
    }
  };

  // 保存图片到相册
  const saveToGallery = async (imageUri) => {
    try {
      // 请求权限
      const hasPermission = await requestStoragePermission();
      if (!hasPermission) {
        throw new Error('需要相册权限才能保存图片');
      }

      // 使用原版CameraRoll保存图片
      await CameraRoll.save(imageUri);
      onImageSaved?.(imageUri);
      
    } catch (error) {
      console.error('保存失败:', error);
      throw error;
    }
  };

  // 重置头像到默认状态
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

  // 暴露给父组件的方法
  useImperativeHandle(ref, () => ({
    selectAvatar,
    selectAvatarFromGallery,
    takeAvatarPhoto,
    captureImage,
    saveToGallery,
    resetAvatar,
    getCurrentAvatarUri: () => avatarUri,
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
                      <Animated.Image
                        source={typeof avatarUri === 'object' && avatarUri.uri ? avatarUri : avatarUri}
                        style={[
                          styles.avatarImage,
                          avatarImageStyle,
                          { transform: imageTransform }
                        ]}
                        resizeMode="contain"
                      />
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