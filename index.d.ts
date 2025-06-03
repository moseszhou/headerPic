import React from 'react';
import { ImageSourcePropType, ViewStyle } from 'react-native';

export interface AvatarEditorRef {
  selectAvatar: () => void;
  selectAvatarFromGallery: () => void;
  takeAvatarPhoto: () => void;
  captureImage: () => Promise<string>;
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