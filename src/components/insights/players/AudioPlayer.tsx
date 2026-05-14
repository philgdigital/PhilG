"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * Custom audio player for the insight detail page's narration MP3.
 *
 * Two-instance pattern (driven by the parent — see [slug]/page.tsx):
 *   - INLINE instance sits at the top of the article body, fully
 *     expanded with all controls + an editorial "Listen to this
 *     article" eyebrow.
 *   - STICKY instance sits fixed at the bottom-right of the
 *     viewport, fades in once the inline player has scrolled past.
 *     Compact: play/pause + time + scrubber.
 *
 * Both instances share the SAME underlying <audio> element via a
 * module-level shared ref so playing in one syncs the other (you
 * can pause from the sticky pill and resume from the inline player).
 *
 * Implementation:
 *   - We mount ONE <audio> element (in the inline instance) and
 *     expose a tiny pub/sub for the sticky instance to read state
 *     and forward play/pause/seek commands.
 *
 * Controls: play/pause, scrubber, current time / total time,
 * playback rate (1x → 1.25x → 1.5x → 2x → 0.75x cycle).
 *
 * The IBM blue + emerald palette is reused; the player is styled
 * to read as a glass pill, not a generic browser <audio controls>.
 */

type Props = {
  /** MP3 URL — relative path under /public or absolute. */
  src: string;
  /** Title of the article — used for screen-reader labels + display. */
  title: string;
  /** Visual variant — fully expanded inline or compact sticky pill. */
  variant: "inline" | "sticky";
  /**
   * Shared <audio> element ref. The inline player creates it; the
   * sticky player only reads/writes via this ref. Pass the same
   * ref to both instances to keep them in sync.
   */
  audioRef: React.RefObject<HTMLAudioElement | null>;
  /** Whether the sticky variant should be visible. */
  stickyVisible?: boolean;
};

const PLAYBACK_RATES = [1, 1.25, 1.5, 2, 0.75] as const;

function fmt(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function AudioPlayer({
  src,
  title,
  variant,
  audioRef,
  stickyVisible = false,
}: Props) {
  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  const [rateIdx, setRateIdx] = useState(0);

  // Mount the <audio> element in the INLINE variant only — sticky
  // reads from the shared ref. This guarantees there's only one
  // audio source playing.
  const ownsAudio = variant === "inline";

  // Wire up listeners on the shared audio element. Effect runs on
  // both variants so each instance updates its own state when the
  // audio plays/pauses/seeks (driven by either instance's controls).
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    const onTime = () => setCurrent(audio.currentTime);
    const onDur = () => setDuration(audio.duration || 0);
    const onRate = () => {
      const idx = PLAYBACK_RATES.indexOf(
        audio.playbackRate as (typeof PLAYBACK_RATES)[number],
      );
      if (idx >= 0) setRateIdx(idx);
    };
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("durationchange", onDur);
    audio.addEventListener("loadedmetadata", onDur);
    audio.addEventListener("ratechange", onRate);
    // Initial snapshot in case the audio is already loaded
    onDur();
    onTime();
    return () => {
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("durationchange", onDur);
      audio.removeEventListener("loadedmetadata", onDur);
      audio.removeEventListener("ratechange", onRate);
    };
  }, [audioRef]);

  const toggle = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) audio.play().catch(() => {});
    else audio.pause();
  }, [audioRef]);

  const seekTo = useCallback(
    (frac: number) => {
      const audio = audioRef.current;
      if (!audio || !duration) return;
      audio.currentTime = Math.max(0, Math.min(duration, frac * duration));
    },
    [audioRef, duration],
  );

  const cycleRate = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const next = (rateIdx + 1) % PLAYBACK_RATES.length;
    audio.playbackRate = PLAYBACK_RATES[next];
    setRateIdx(next);
  }, [audioRef, rateIdx]);

  // Scrubber click → seek
  const onScrubberClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    seekTo((e.clientX - r.left) / r.width);
  };

  const progress = duration > 0 ? current / duration : 0;
  const currentRate = PLAYBACK_RATES[rateIdx];

  if (variant === "sticky") {
    return (
      <div
        aria-hidden={!stickyVisible}
        className={`fixed bottom-5 right-5 md:bottom-8 md:right-8 z-40 transition-all duration-500 ease-[var(--ease-out)] ${
          stickyVisible
            ? "opacity-100 translate-y-0 pointer-events-auto"
            : "opacity-0 translate-y-3 pointer-events-none"
        }`}
      >
        <div className="flex items-center gap-3 md:gap-4 px-4 md:px-5 py-3 md:py-3.5 rounded-full bg-[#0a0a0c]/85 backdrop-blur-xl border border-white/15 shadow-[0_20px_60px_-12px_rgba(0,0,0,0.7)] max-w-[calc(100vw-2.5rem)]">
          <button
            type="button"
            onClick={toggle}
            aria-label={playing ? "Pause narration" : "Play narration"}
            data-cursor-no-hint="true"
            className="shrink-0 hover-target w-9 h-9 md:w-10 md:h-10 rounded-full bg-[#0f62fe] hover:bg-[#4589ff] shadow-[0_4px_16px_rgba(15,98,254,0.5)] flex items-center justify-center transition-colors"
          >
            <PlayPauseIcon playing={playing} compact />
          </button>
          {/* Scrubber */}
          <div className="hidden md:flex flex-col gap-1 w-44 lg:w-56">
            <div className="font-mono text-[9px] tracking-[0.22em] uppercase text-zinc-400 flex items-center justify-between">
              <span className="truncate max-w-[8rem]">Listen</span>
              <span>
                {fmt(current)} / {fmt(duration)}
              </span>
            </div>
            <Scrubber progress={progress} onClick={onScrubberClick} />
          </div>
          {/* Mobile-only time chip when scrubber is hidden */}
          <span className="md:hidden font-mono text-[10px] tracking-[0.22em] uppercase text-zinc-400 whitespace-nowrap">
            {fmt(current)} / {fmt(duration)}
          </span>
        </div>
      </div>
    );
  }

  // INLINE variant — full-width, all controls, editorial framing
  return (
    <div className="relative">
      {ownsAudio && (
        <audio
          ref={audioRef}
          src={src}
          preload="metadata"
          aria-label={`Audio narration of ${title}`}
        />
      )}
      <div className="rounded-2xl md:rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.04] to-transparent backdrop-blur-sm p-5 md:p-7">
        {/* Eyebrow */}
        <div className="flex items-center gap-3 mb-4 md:mb-5">
          <span
            aria-hidden
            className="w-1.5 h-1.5 rounded-full bg-[#0f62fe] shadow-[0_0_8px_rgba(15,98,254,0.7)]"
          />
          <span className="font-mono text-[10px] md:text-[11px] tracking-[0.32em] uppercase text-zinc-400">
            Listen to this article
          </span>
        </div>

        <div className="flex items-center gap-4 md:gap-5">
          <button
            type="button"
            onClick={toggle}
            aria-label={playing ? "Pause narration" : "Play narration"}
            data-cursor-no-hint="true"
            className="shrink-0 hover-target w-14 h-14 md:w-16 md:h-16 rounded-full bg-[#0f62fe] hover:bg-[#4589ff] shadow-[0_8px_30px_rgba(15,98,254,0.4),inset_0_1px_0_rgba(255,255,255,0.2)] hover:shadow-[0_10px_40px_rgba(15,98,254,0.6),inset_0_1px_0_rgba(255,255,255,0.3)] flex items-center justify-center transition-all duration-300"
          >
            <PlayPauseIcon playing={playing} />
          </button>

          {/* Scrubber column */}
          <div className="flex-1 min-w-0 flex flex-col gap-2">
            <div className="flex items-center justify-between font-mono text-[10px] md:text-[11px] tracking-[0.22em] uppercase text-zinc-400">
              <span>{fmt(current)}</span>
              <span>{fmt(duration)}</span>
            </div>
            <Scrubber progress={progress} onClick={onScrubberClick} />
          </div>

          {/* Playback-rate cycle pill */}
          <button
            type="button"
            onClick={cycleRate}
            aria-label={`Playback speed ${currentRate}x — click to change`}
            data-cursor-no-hint="true"
            className="shrink-0 hover-target px-3 py-1.5 md:px-3.5 md:py-2 rounded-full border border-white/10 hover:border-[#0f62fe]/50 bg-white/[0.03] hover:bg-[#0f62fe]/10 font-mono text-[10px] md:text-[11px] tracking-[0.22em] uppercase text-zinc-300 hover:text-white transition-all"
          >
            {currentRate}x
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Visual scrubber. Track + filled portion + draggable thumb. Click
 * on the track seeks to that position; drag isn't implemented in
 * v1 (click-to-seek is enough for the editorial use case).
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
        // Simple keyboard accessibility — arrow keys seek ±5%
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
      className="group relative h-1.5 rounded-full bg-white/10 cursor-pointer overflow-hidden hover:h-2 transition-all duration-200"
    >
      <div
        className="absolute inset-y-0 left-0 bg-[#0f62fe] shadow-[0_0_8px_rgba(15,98,254,0.6)] rounded-full"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

function PlayPauseIcon({
  playing,
  compact,
}: {
  playing: boolean;
  compact?: boolean;
}) {
  const size = compact ? "w-4 h-4" : "w-6 h-6 md:w-7 md:h-7";
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
      className={`${size} text-white ${compact ? "ml-0.5" : "ml-1"}`}
      fill="currentColor"
    >
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}
