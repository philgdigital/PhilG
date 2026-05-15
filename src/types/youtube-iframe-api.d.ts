/**
 * Minimal type stubs for the YouTube IFrame Player API.
 *
 * We don't pull in the full @types/youtube package because we only
 * use a small slice of the API — the IFrame Player constructor, a
 * handful of playback methods, and the state-change enum. Keeping
 * the surface small makes the dependency easier to reason about and
 * avoids 800+ lines of types we'd never call.
 *
 * Loaded at runtime via `<script src="https://www.youtube.com/iframe_api">`.
 * YouTube invokes `window.onYouTubeIframeAPIReady` once the global
 * `window.YT` namespace is available.
 */

// The `YT` namespace must live INSIDE `declare global` — otherwise
// it'd be scoped to this module and `VideoPlayer.tsx`'s use of
// `typeof YT` would fail with `Cannot find name 'YT'.` at compile
// time. `export {}` at the bottom is what marks this file as a
// module, which is what lets `declare global` augment the global
// scope rather than redeclare it.
declare global {
  interface Window {
    YT?: typeof YT;
    onYouTubeIframeAPIReady?: () => void;
  }

  namespace YT {
    /** Numeric player states emitted by `onStateChange`. */
    enum PlayerState {
      UNSTARTED = -1,
      ENDED = 0,
      PLAYING = 1,
      PAUSED = 2,
      BUFFERING = 3,
      CUED = 5,
    }

    interface OnStateChangeEvent {
      data: PlayerState;
      target: Player;
    }

    interface PlayerOptions {
      videoId?: string;
      width?: string | number;
      height?: string | number;
      playerVars?: Record<string, string | number>;
      events?: {
        onReady?: (event: { target: Player }) => void;
        onStateChange?: (event: OnStateChangeEvent) => void;
        onError?: (event: { data: number; target: Player }) => void;
      };
    }

    /** Subset of YT.Player methods we actually call. */
    class Player {
      constructor(element: HTMLElement | string, options: PlayerOptions);
      playVideo(): void;
      pauseVideo(): void;
      seekTo(seconds: number, allowSeekAhead: boolean): void;
      mute(): void;
      unMute(): void;
      isMuted(): boolean;
      setPlaybackRate(suggestedRate: number): void;
      getPlaybackRate(): number;
      getAvailablePlaybackRates(): number[];
      getCurrentTime(): number;
      getDuration(): number;
      getPlayerState(): PlayerState;
      destroy(): void;
      getIframe(): HTMLIFrameElement;
    }
  }
}

export {};
