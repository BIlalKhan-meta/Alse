declare module 'react-native-instagram-reels' {
  import {ComponentType, ReactNode} from 'react';
  import {FlatListProps} from 'react-native';

  export interface ReelsProps {
    videos: Array<Record<string, unknown> & {_id: string | number; uri: string}>;
    backgroundColor?: string;
    headerTitle?: string;
    headerIconName?: string;
    headerIconColor?: string;
    headerIconSize?: number;
    headerIcon?: unknown;
    headerComponent?: unknown;
    onHeaderIconPress?: () => void;
    optionsComponent?: unknown;
    pauseOnOptionsShow?: boolean;
    onSharePress?: (id: string | number) => void;
    onCommentPress?: (id: string | number) => void;
    onLikePress?: (id: string | number) => void;
    onDislikePress?: (id: string | number) => void;
    onFinishPlaying?: (index: number) => void;
    minimumTrackTintColor?: string;
    maximumTrackTintColor?: string;
    thumbTintColor?: string;
    timeElapsedColor?: string;
    totalTimeColor?: string;
    tapToToggleControls?: boolean;
    /** @deprecated Prefer videoDisplayMaxHeight. If set without videoDisplayMaxHeight, used as video cap only. */
    reelItemHeight?: number;
    /** Max height of video inside each full-screen row */
    videoDisplayMaxHeight?: number;
    showPlayPauseOnTap?: boolean;
    enableSeekZones?: boolean;
    renderPersistentOverlay?: (ctx: Record<string, unknown>) => ReactNode;
    onEndReached?: FlatListProps<unknown>['onEndReached'];
    onEndReachedThreshold?: number;
    ListFooterComponent?: FlatListProps<unknown>['ListFooterComponent'];
  }

  const Reels: ComponentType<ReelsProps>;
  export default Reels;
}
