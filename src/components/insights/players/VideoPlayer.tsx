"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Inline article video player with a fully-custom brand chrome on
 * top of YouTube's iframe.
 *
 * Why custom? `controls=1` keeps the YouTube title bar (with its
 * clickable link to youtube.com), the copy-link / share icons, and
 * the YouTube wordmark visible. Those break the editorial feel and
 * leak to the browser's status bar on hover. Switching to
 * `controls=0` removes EVERY native UI element from the iframe —
 * the video frame becomes a pure canvas — and we re-add a Carbon
 * Black + IBM-blue control bar of our own.
 *
 * Implementation:
 *   1. Poster + giant play button before first interaction (privacy-
 *      friendly: no YouTube cookies/network until click).
 *   2. On click, mount the iframe with controls=0 + enablejsapi=1.
 *   3. Lazy-load YouTube's IFrame Player API JS (once per page,
 *      shared across multiple player instances via a singleton
 *      promise) and instantiate `YT.Player`.
 *   4. Drive playback (`playVideo`, `pauseVideo`, `seekTo`,
 *      `mute`/`unMute`) through the API.
 *   5. Poll `getCurrentTime()` + `getDuration()` at 5 Hz for the
 *      scrubber. YT doesn't push time events; polling is the
 *      sanctioned pattern.
 *   6. Build the bottom control bar in the same visual language as
 *      AudioPlayer (Scrubber, font-mono time chips, IBM-blue accent
 *      circle for play/pause) so the two media players read as one
 *      family.
 *
 * Embed param rationale (sanctioned YT IFrame API):
 *   controls=0       hide every native YouTube UI element
 *   modestbranding=1 legacy/no-op (YouTube deprecated this in 2023)
 *                     but kept as a defensive measure for older
 *                     YouTube backends
 *   rel=0            no related-video end screen
 *   iv_load_policy=3 disable annotation overlays
 *   playsinline=1    inline playback on iOS (no forced-fullscreen)
 *   disablekb=1      disable YouTube's keyboard shortcuts
 *   enablejsapi=1    enable the postMessage / JS Player API
 *   fs=0             hide YouTube's fullscreen button (we render
 *                     our own that calls requestFullscreen on the
 *                     iframe element)
 */

type Props = {
  /** Full YouTube URL — youtube.com/watch?v=… or youtu.be/… */
  url: string;
  /** Used for the iframe title (a11y) + screen-reader labels. */
  title: string;
};

/** Extract the 11-char video ID from any common YouTube URL shape. */
function extractVideoId(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname === "youtu.be") {
      const id = u.pathname.replace(/^\/+/, "").split("/")[0];
      return id.length === 11 ? id : null;
    }
    if (
      u.hostname.endsWith("youtube.com") ||
      u.hostname.endsWith("youtube-nocookie.com")
    ) {
      const v = u.searchParams.get("v");
      if (v && v.length === 11) return v;
      const m = u.pathname.match(/^\/(shorts|embed)\/([\w-]{11})/);
      if (m) return m[2];
    }
  } catch {
    /* not a URL */
  }
  return null;
}

/**
 * Load the YouTube IFrame API exactly once across the page, even if
 * multiple <VideoPlayer> instances mount. Subsequent callers await
 * the same Promise.
 *
 * The API JS calls `window.onYouTubeIframeAPIReady` when loaded;
 * we hook that to resolve the Promise.
 */
let ytApiPromise: Promise<typeof YT> | null = null;
function loadYouTubeApi(): Promise<typeof YT> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("window unavailable (SSR)"));
  }
  if (ytApiPromise) return ytApiPromise;
  if (window.YT && window.YT.Player) {
    ytApiPromise = Promise.resolve(window.YT);
    return ytApiPromise;
  }
  ytApiPromise = new Promise<typeof YT>((resolve) => {
    // YouTube's loader calls this global when YT.Player is ready.
    // If another loader on the page already set it, chain our own
    // callback after theirs.
    const prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      try {
        prev?.();
      } catch {
        /* non-fatal */
      }
      if (window.YT) resolve(window.YT);
    };
    const script = document.createElement("script");
    script.src = "https://www.youtube.com/iframe_api";
    script.async = true;
    document.head.appendChild(script);
  });
  return ytApiPromise;
}

function fmtTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

/**
 * Cycle of playback rates exposed via the bottom-bar speed pill.
 * Mirrors AudioPlayer's PLAYBACK_RATES so the two media players
 * share one mental model for the visitor.
 */
const PLAYBACK_RATES = [1, 1.25, 1.5, 2, 0.75] as const;

export function VideoPlayer({ url, title }: Props) {
  const videoId = extractVideoId(url);
  const [active, setActive] = useState(false); // has the visitor clicked play yet?
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  const [rateIdx, setRateIdx] = useState(0);

  /** Wrapper that owns fullscreen — putting fullscreen on the
   *  wrapper (instead of the iframe) keeps our custom controls bar
   *  inside the fullscreen viewport. */
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const playerRef = useRef<YT.Player | null>(null);

  // Once the iframe is mounted, instantiate YT.Player and wire its
  // events. The iframe carries enablejsapi=1 so the API can attach.
  useEffect(() => {
    if (!active) return;
    const iframe = iframeRef.current;
    if (!iframe) return;
    let cancelled = false;
    let pollId: number | null = null;

    loadYouTubeApi().then((YT_) => {
      if (cancelled) return;
      playerRef.current = new YT_.Player(iframe, {
        events: {
          onReady: () => {
            if (cancelled) return;
            const p = playerRef.current;
            if (!p) return;
            setDuration(p.getDuration() || 0);
            setMuted(p.isMuted());
            // Poll currentTime + duration at 5 Hz for the scrubber.
            // YT's API doesn't expose time updates as events.
            pollId = window.setInterval(() => {
              const player = playerRef.current;
              if (!player) return;
              setCurrent(player.getCurrentTime() || 0);
              const d = player.getDuration() || 0;
              if (d > 0) setDuration((prev) => (prev === d ? prev : d));
            }, 200);
          },
          onStateChange: (e) => {
            // PLAYING(1) → playing=true, every other state → false.
            setPlaying(e.data === 1);
          },
        },
      });
    });

    return () => {
      cancelled = true;
      if (pollId !== null) window.clearInterval(pollId);
      try {
        playerRef.current?.destroy();
      } catch {
        /* iframe may already be torn down */
      }
      playerRef.current = null;
    };
  }, [active]);

  const startPlayback = useCallback(() => {
    setActive(true);
  }, []);

  const toggle = useCallback(() => {
    const p = playerRef.current;
    if (!p) return;
    if (p.getPlayerState() === 1) p.pauseVideo();
    else p.playVideo();
  }, []);

  const seekTo = useCallback(
    (fraction: number) => {
      const p = playerRef.current;
      if (!p || duration <= 0) return;
      const target = Math.max(0, Math.min(duration, fraction * duration));
      p.seekTo(target, true);
      setCurrent(target);
    },
    [duration],
  );

  const onScrubberClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    seekTo((e.clientX - r.left) / r.width);
  };

  const toggleMute = useCallback(() => {
    const p = playerRef.current;
    if (!p) return;
    if (p.isMuted()) {
      p.unMute();
      setMuted(false);
    } else {
      p.mute();
      setMuted(true);
    }
  }, []);

  const toggleFullscreen = useCallback(() => {
    const wrap = wrapperRef.current;
    if (!wrap) return;
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    } else {
      wrap.requestFullscreen().catch(() => {});
    }
  }, []);

  const cycleRate = useCallback(() => {
    const p = playerRef.current;
    if (!p) return;
    const next = (rateIdx + 1) % PLAYBACK_RATES.length;
    p.setPlaybackRate(PLAYBACK_RATES[next]);
    setRateIdx(next);
  }, [rateIdx]);

  // Origin must mirror window.location.origin for YT enablejsapi.
  const origin =
    typeof window !== "undefined" ? window.location.origin : "";

  if (!videoId) {
    return (
      <div className="rounded-3xl overflow-hidden border border-white/8 bg-black/40 aspect-video flex items-center justify-center text-zinc-400 text-sm">
        Invalid YouTube URL
      </div>
    );
  }

  const poster = `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`;
  const posterFallback = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;

  // controls=0 hides every native YouTube UI element. fs=0 hides
  // the fullscreen button — we render our own.
  const embedSrc = active
    ? `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&controls=0&modestbranding=1&rel=0&iv_load_policy=3&playsinline=1&disablekb=1&enablejsapi=1&fs=0&showinfo=0${
        origin ? `&origin=${encodeURIComponent(origin)}` : ""
      }`
    : null;

  const progress = duration > 0 ? current / duration : 0;

  return (
    <div
      ref={wrapperRef}
      className="relative w-full aspect-video rounded-2xl md:rounded-3xl overflow-hidden border border-white/8 shadow-[0_20px_60px_-12px_rgba(0,0,0,0.6)] bg-black group"
    >
      {/* Brand-wash gradient corner washes ride over the iframe/poster
          so the player visually belongs to the rest of the page. They
          fade out once the video is playing so the imagery isn't
          tinted. */}
      <div
        aria-hidden
        className={`pointer-events-none absolute inset-0 z-10 transition-opacity duration-700 mix-blend-multiply ${
          active ? "opacity-0" : "opacity-100 group-hover:opacity-60"
        }`}
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 0% 0%, rgba(15,98,254,0.35) 0%, transparent 60%), radial-gradient(ellipse 60% 50% at 100% 100%, rgba(16,185,129,0.20) 0%, transparent 60%)",
        }}
      />

      {!active ? (
        <>
          {/* Poster image (YouTube thumbnail). Plain <img> on purpose
              — it's an external host that would otherwise need a
              next.config remotePattern entry just for this. The
              image is only visible before play; no LCP concern. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={poster}
            alt={title}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1500ms] ease-[var(--ease-out)] group-hover:scale-[1.04]"
            onError={(e) => {
              if (e.currentTarget.src !== posterFallback) {
                e.currentTarget.src = posterFallback;
              }
            }}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0a0a0c]/70 via-transparent to-transparent"
          />
          <button
            type="button"
            onClick={startPlayback}
            aria-label={`Play video: ${title}`}
            data-cursor-no-hint="true"
            className="absolute inset-0 z-20 flex items-center justify-center hover-target"
          >
            <span
              aria-hidden
              className="relative inline-flex items-center justify-center w-20 h-20 md:w-24 md:h-24 rounded-full bg-[#0f62fe] shadow-[0_10px_40px_rgba(15,98,254,0.5),inset_0_1px_0_rgba(255,255,255,0.2)] transition-all duration-500 group-hover:scale-110 group-hover:shadow-[0_15px_60px_rgba(15,98,254,0.7),inset_0_1px_0_rgba(255,255,255,0.3)]"
            >
              <span
                aria-hidden
                className="absolute inset-0 rounded-full border-2 border-[#0f62fe]/40 animate-ping"
              />
              <svg
                viewBox="0 0 24 24"
                className="w-8 h-8 md:w-10 md:h-10 text-white ml-1"
                fill="currentColor"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
            </span>
          </button>
          <span className="absolute bottom-5 left-5 z-20 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/50 backdrop-blur-sm border border-white/15 font-mono text-[10px] tracking-[0.32em] uppercase text-white/90">
            <span
              aria-hidden
              className="w-1 h-1 rounded-full bg-[#0f62fe] shadow-[0_0_6px_rgba(15,98,254,0.8)]"
            />
            Watch
          </span>
        </>
      ) : (
        <>
          {/* The iframe — no native chrome since controls=0. We sit
              on top with our own controls bar below. pointer-events
              are allowed so YouTube's tap-to-pause behaviour still
              works inside the player area. */}
          <iframe
            ref={iframeRef}
            src={embedSrc ?? ""}
            title={title}
            className="absolute inset-0 w-full h-full"
            allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />

          {/* Click-shield. Sits above the iframe so:
              (a) the custom magnetic cursor keeps tracking — without
                  this overlay the iframe captures pointer events and
                  the parent window's `mousemove` listener (which the
                  CustomCursor relies on) stops firing.
              (b) clicks anywhere on the video area toggle play/pause
                  — replaces YouTube's native tap-to-toggle which is
                  gone with controls=0.
              Sits behind the controls bar (z-10 vs z-20) so the
              bottom-bar buttons keep their own click semantics. */}
          <button
            type="button"
            onClick={toggle}
            aria-label={playing ? "Pause video" : "Play video"}
            data-cursor-no-hint="true"
            className="absolute inset-0 z-10 w-full h-full bg-transparent cursor-default"
          />

          {/* Custom controls bar. Sits flush at the bottom of the
              player frame. Always visible while the video is loaded;
              no auto-hide because editorial readers want predictable
              controls, not a gaming-style overlay that hides on idle. */}
          <div
            className="absolute inset-x-0 bottom-0 z-20 flex items-center gap-3 md:gap-4 px-3 md:px-4 py-2.5 md:py-3 bg-[#0a0a0c]/85 backdrop-blur-sm border-t border-white/8"
            // Block the iframe's tap-to-play passthrough so clicks
            // inside the bar don't double-toggle playback.
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={toggle}
              aria-label={playing ? "Pause video" : "Play video"}
              data-cursor-no-hint="true"
              className="shrink-0 hover-target w-9 h-9 md:w-10 md:h-10 rounded-full bg-[#0f62fe] hover:bg-[#4589ff] shadow-[0_4px_16px_rgba(15,98,254,0.5)] flex items-center justify-center transition-colors"
            >
              <PlayPauseIcon playing={playing} />
            </button>

            <span className="hidden sm:inline font-mono text-[10px] md:text-[11px] tracking-[0.22em] uppercase text-zinc-300 whitespace-nowrap">
              {fmtTime(current)} / {fmtTime(duration)}
            </span>

            <Scrubber progress={progress} onClick={onScrubberClick} />

            <button
              type="button"
              onClick={toggleMute}
              aria-label={muted ? "Unmute" : "Mute"}
              data-cursor-no-hint="true"
              className="shrink-0 hover-target w-9 h-9 rounded-full border border-white/10 hover:border-[#0f62fe]/50 bg-white/[0.03] hover:bg-[#0f62fe]/10 text-zinc-300 hover:text-white flex items-center justify-center transition-colors"
            >
              <SpeakerIcon muted={muted} />
            </button>

            {/* Playback-speed cycle pill. Same UX as the AudioPlayer
                — click to cycle through 1x → 1.25x → 1.5x → 2x →
                0.75x → back to 1x. The current rate is displayed
                so the control reads as a value, not just an icon. */}
            <button
              type="button"
              onClick={cycleRate}
              aria-label={`Playback speed ${PLAYBACK_RATES[rateIdx]}x — click to change`}
              data-cursor-no-hint="true"
              className="shrink-0 hover-target px-2.5 md:px-3 py-1.5 rounded-full border border-white/10 hover:border-[#0f62fe]/50 bg-white/[0.03] hover:bg-[#0f62fe]/10 font-mono text-[10px] md:text-[11px] tracking-[0.22em] uppercase text-zinc-300 hover:text-white transition-colors"
            >
              {PLAYBACK_RATES[rateIdx]}x
            </button>

            <button
              type="button"
              onClick={toggleFullscreen}
              aria-label="Toggle fullscreen"
              data-cursor-no-hint="true"
              className="shrink-0 hover-target w-9 h-9 rounded-full border border-white/10 hover:border-[#0f62fe]/50 bg-white/[0.03] hover:bg-[#0f62fe]/10 text-zinc-300 hover:text-white flex items-center justify-center transition-colors"
            >
              <FullscreenIcon />
            </button>
          </div>
        </>
      )}
    </div>
  );
}

/**
 * Scrubber mirrors the AudioPlayer's pattern — track + filled portion,
 * click-to-seek, keyboard arrows for ±5%. Shared visual identity
 * across the two media players so the article reads as one design.
 */
function Scrubber({
  progress,
  onClick,
}: {
  progress: number;
  onClick: (e: React.MouseEvent<HTMLDivElement>) => void;
}) {
  const pct = Math.max(0, Math.min(1, progress)) * 100;
  return (
    <div
      role="slider"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(pct)}
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        const synth = (frac: number) => {
          const r = e.currentTarget.getBoundingClientRect();
          onClick({
            clientX: r.left + r.width * frac,
            currentTarget: e.currentTarget,
          } as unknown as React.MouseEvent<HTMLDivElement>);
        };
        if (e.key === "ArrowRight") synth(Math.min(1, progress + 0.05));
        else if (e.key === "ArrowLeft") synth(Math.max(0, progress - 0.05));
      }}
      className="group/scrubber relative h-1.5 rounded-full bg-white/10 cursor-pointer overflow-hidden hover:h-2 transition-all duration-200 flex-1 min-w-0"
    >
      <div
        className="absolute inset-y-0 left-0 bg-[#0f62fe] shadow-[0_0_8px_rgba(15,98,254,0.6)] rounded-full"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

function PlayPauseIcon({ playing }: { playing: boolean }) {
  const size = "w-4 h-4 md:w-5 md:h-5";
  if (playing) {
    return (
      <svg viewBox="0 0 24 24" className={`${size} text-white`} fill="currentColor">
        <rect x="6" y="5" width="4" height="14" rx="1" />
        <rect x="14" y="5" width="4" height="14" rx="1" />
      </svg>
    );
  }
  return (
    <svg
      viewBox="0 0 24 24"
      className={`${size} text-white ml-0.5`}
      fill="currentColor"
    >
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

function SpeakerIcon({ muted }: { muted: boolean }) {
  if (muted) {
    return (
      <svg
        viewBox="0 0 24 24"
        className="w-4 h-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M11 5L6 9H2v6h4l5 4V5z" />
        <line x1="23" y1="9" x2="17" y2="15" />
        <line x1="17" y1="9" x2="23" y2="15" />
      </svg>
    );
  }
  return (
    <svg
      viewBox="0 0 24 24"
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M11 5L6 9H2v6h4l5 4V5z" />
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
    </svg>
  );
}

function FullscreenIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M8 3H5a2 2 0 0 0-2 2v3" />
      <path d="M21 8V5a2 2 0 0 0-2-2h-3" />
      <path d="M3 16v3a2 2 0 0 0 2 2h3" />
      <path d="M16 21h3a2 2 0 0 0 2-2v-3" />
    </svg>
  );
}
