/**
 * Platform-correct Agora video renderer.
 *
 * Android MUST use RtcTextureView. RtcSurfaceView maps to a native SurfaceView,
 * which renders black on a large share of Android devices once it is composited
 * under/over other views (overlays, picture-in-picture tiles, scroll parents).
 * RtcTextureView is Android-only, so iOS keeps RtcSurfaceView.
 *
 * Always render video through this component so that platform choice can never
 * drift again.
 */
import React from 'react';
import {Platform, StyleProp, ViewStyle} from 'react-native';
import {
  RenderModeType,
  RtcSurfaceView,
  RtcTextureView,
  VideoMirrorModeType,
  VideoSourceType,
} from 'react-native-agora';

type AgoraVideoViewProps = {
  /** 0 renders the local camera; any other value renders that remote user. */
  uid: number;
  style?: StyleProp<ViewStyle>;
  /** Fill (crop) by default; set false to letterbox the whole frame. */
  fill?: boolean;
  mirror?: boolean;
  /** iOS SurfaceView only — lift this layer above a sibling SurfaceView. */
  overlay?: boolean;
  onLayout?: () => void;
};

const AgoraVideoView: React.FC<AgoraVideoViewProps> = ({
  uid,
  style,
  fill = true,
  mirror,
  overlay,
  onLayout,
}) => {
  const isLocal = uid === 0;
  const canvas = {
    uid,
    sourceType: isLocal
      ? VideoSourceType.VideoSourceCamera
      : VideoSourceType.VideoSourceRemote,
    renderMode: fill
      ? RenderModeType.RenderModeHidden
      : RenderModeType.RenderModeFit,
    // Remote video must never be mirrored; only the local self-view is.
    mirrorMode:
      mirror === undefined
        ? isLocal
          ? VideoMirrorModeType.VideoMirrorModeAuto
          : VideoMirrorModeType.VideoMirrorModeDisabled
        : mirror
          ? VideoMirrorModeType.VideoMirrorModeEnabled
          : VideoMirrorModeType.VideoMirrorModeDisabled,
  };

  if (Platform.OS === 'android') {
    return <RtcTextureView style={style} canvas={canvas} onLayout={onLayout} />;
  }

  return (
    <RtcSurfaceView
      style={style}
      canvas={canvas}
      zOrderMediaOverlay={overlay}
      onLayout={onLayout}
    />
  );
};

export default AgoraVideoView;
