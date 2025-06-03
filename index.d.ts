import React from 'react';
import { ImageSourcePropType, ViewStyle } from 'react-native';

// ImagePicker的选项类型
export interface ImagePickerOptions {
  imageCount?: number;
  isRecordSelected?: boolean;
  isCamera?: boolean;
  isCrop?: boolean;
  CropW?: number;
  CropH?: number;
  isGif?: boolean;
  showCropCircle?: boolean;
  circleCropRadius?: number;
  showCropFrame?: boolean;
  showCropGrid?: boolean;
  compress?: boolean;
  compressFocusAlpha?: boolean;
  quality?: number;
  minimumCompressSize?: number;
  enableBase64?: boolean;
  freeStyleCropEnabled?: boolean;
  rotateEnabled?: boolean;
  scaleEnabled?: boolean;
  showSelectedIndex?: boolean;
  allowPickingOriginalPhoto?: boolean;
  allowPickingMultipleVideo?: boolean;
  allowTakePhoto?: boolean;
  allowPickingPhoto?: boolean;
}

// ViewShot的截图选项类型
export interface CaptureOptions {
  quality?: number;
  format?: 'png' | 'jpg' | 'webm';
  result?: 'tmpfile' | 'base64' | 'zip-base64' | 'data-uri';
  snapshotContentContainer?: boolean;
}

export interface AvatarEditorRef {
  selectAvatar: (options?: ImagePickerOptions) => void;
  selectAvatarFromGallery: (options?: ImagePickerOptions) => void;
  takeAvatarPhoto: (options?: ImagePickerOptions) => void;
  captureImage: (options?: CaptureOptions) => Promise<string>;
  saveToGallery: (imageUri: string) => Promise<any>;
  resetAvatar: () => void;
  getCurrentAvatarUri: () => ImageSourcePropType;
}

export interface AvatarEditorProps {
  defaultAvatarUri?: ImageSourcePropType;
  frameUri?: ImageSourcePropType;
  width?: number;
  height?: number;
  clipStyle?: ViewStyle;
  onAvatarSelected?: (avatarUri: ImageSourcePropType) => void;
  onImageCaptured?: (imageUri: string) => void;
  onImageSaved?: (imageUri: any) => void;
}

declare const AvatarEditor: React.ForwardRefExoticComponent<
  AvatarEditorProps & React.RefAttributes<AvatarEditorRef>
>;

export default AvatarEditor;
export { AvatarEditor }; 