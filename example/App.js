import React, { useState, useRef } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Image,
  Dimensions,
  Alert,
  SafeAreaView,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import AvatarEditor from "react-native-avatar-editor";

const { width } = Dimensions.get("window");
const picWidth = width - 40;

// 使用本地图片资源
const defaultAvatarUri = require("./src/assets/header.png");
const frameUri = require("./src/assets/4-wow.png");

const App = () => {
  const [finalImage, setFinalImage] = useState(null);
  const avatarEditorRef = useRef(null);

  // 选择头像（相册+拍摄选择）
  const handleSelectAvatar = () => {
    avatarEditorRef.current?.selectAvatar();
  };

  // 从相册选择头像
  const handleSelectFromGallery = () => {
    avatarEditorRef.current?.selectAvatarFromGallery();
  };

  // 拍摄头像
  const handleTakePhoto = () => {
    avatarEditorRef.current?.takeAvatarPhoto();
  };

  // 合成图片
  const handleCaptureImage = async () => {
    try {
      const uri = await avatarEditorRef.current?.captureImage();
      if (uri) {
        setFinalImage(uri);
        Alert.alert("成功", "图片合成完成！您可以在预览中查看效果。");
      }
    } catch (error) {
      Alert.alert("错误", "图片合成失败");
    }
  };

  // 保存到相册
  const handleSaveToGallery = async () => {
    if (!finalImage) {
      Alert.alert("提示", "请先合成图片");
      return;
    }

    try {
      await avatarEditorRef.current.saveToGallery(finalImage);
      Alert.alert("成功", "图片已保存到相册");
    } catch (error) {
      Alert.alert("错误", "保存图片失败: " + error.message);
    }
  };

  // 重置编辑器
  const handleReset = () => {
    setFinalImage(null);
    avatarEditorRef.current?.resetAvatar();
  };

  // 头像选择回调
  const onAvatarSelected = (avatarUri) => {
    console.log("头像已选择:", avatarUri);
  };

  // 图片合成回调
  const onImageCaptured = (imageUri) => {
    console.log("图片已合成:", imageUri);
  };

  // 图片保存回调
  const onImageSaved = (imageUri) => {
    console.log("图片已保存:", imageUri);
  };


  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaView style={styles.container}>
        <Text style={styles.title}>头像编辑器</Text>

        <View style={styles.editorContainer}>
          <View style={styles.editorWrapper}>
            <AvatarEditor
              ref={avatarEditorRef}
              defaultAvatarUri={defaultAvatarUri}
              frameUri={frameUri}
              clipStyle={{ width: picWidth * 5 / 6, height: picWidth * 5 / 6, borderRadius: picWidth * 5 / 12, overflow: "hidden" }}
              width={picWidth}
              height={picWidth}
              onAvatarSelected={onAvatarSelected}
              onImageCaptured={onImageCaptured}
              onImageSaved={onImageSaved}
            />
          </View>
          {finalImage && (
            <View style={styles.finalImageWrapper}>
              <Image
                source={{ uri: finalImage }}
                style={styles.finalImage}
              />
            </View>
          )}
        </View>

        <View style={styles.buttonContainer}>
          {!finalImage ? (
            <>
              <TouchableOpacity
                style={styles.button}
                onPress={handleSelectFromGallery}
              >
                <Text style={styles.buttonText}>选择相册</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.button} onPress={handleTakePhoto}>
                <Text style={styles.buttonText}>拍摄头像</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.primaryButton}
                onPress={handleCaptureImage}
              >
                <Text style={styles.buttonText}>合成图片</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <TouchableOpacity
                style={styles.button}
                onPress={() => setFinalImage(null)}
              >
                <Text style={styles.buttonText}>重新编辑</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.primaryButton}
                onPress={handleSaveToGallery}
              >
                <Text style={styles.buttonText}>保存到相册</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={handleReset}
              >
                <Text style={styles.secondaryButtonText}>重置头像</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* 操作说明 */}
        <View style={styles.instructionContainer}>
          <Text style={styles.instructionText}>操作说明：</Text>
          <Text style={styles.instructionDetail}>
            • 单指拖动：移动头像位置{"\n"}• 双指缩放：调整头像大小{"\n"}•
            双指旋转：旋转头像角度
          </Text>
        </View>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    margin: 20,
    color: "#333",
  },
  editorContainer: {
    alignSelf: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    position: 'relative',
    width: picWidth,
    height: picWidth,
  },
  editorWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 30,
    paddingHorizontal: 20,
    flexWrap: "wrap",
  },
  button: {
    backgroundColor: "#2196F3",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    minWidth: 100,
    marginVertical: 5,
  },
  primaryButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    minWidth: 100,
    marginVertical: 5,
  },
  secondaryButton: {
    backgroundColor: "#757575",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    minWidth: 100,
    marginVertical: 5,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
  secondaryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
  finalImageWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  finalImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  instructionContainer: {
    marginTop: 20,
    paddingHorizontal: 30,
    alignItems: "center",
  },
  instructionText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  instructionDetail: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default App;
