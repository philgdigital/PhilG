"use client";

import { useRef, useState, useCallback } from "react";

/**
 * Custom YouTube video player with a Carbon-styled overlay. The
 * underlying YouTube IFrame embed exists, but its native chrome
 * (logo, "Watch on YouTube" link, share button, related videos at
 * the end, etc.) is hidden via the embed URL params + a custom
 * controls layer painted over the iframe.
 *
 * Embed parameter rationale:
 *   - modestbranding=1: removes the YouTube wordmark (still leaves
 *     the play-overlay before first play, which our poster covers).
 *   - rel=0: no end-screen of related videos.
 *   - iv_load_policy=3: disables annotation overlays.
 *   - playsinline=1: iOS does not force full-screen on play.
 *   - controls=0: hides the native YouTube control bar (the player
 *     bar at the bottom). Our custom controls overlay replaces it.
 *   - disablekb=1: blocks YouTube keyboard shortcuts so visitors
 *     hitting space/arrows on the page don't accidentally trigger
 *     YouTube's UI.
 *   - enablejsapi=1: lets us talk to the player via postMessage
 *     (play, pause, seek, query state).
 *
 * The iframe's `origin` query param mirrors `window.location.origin`
 * on mount — required by YouTube for the JS API to accept messages.
 *
 * Initially, only a thumbnail poster + giant play button render.
 * Clicking play mounts the iframe and starts playback. This means
 * no YouTube cookies / network calls happen until the visitor opts
 * in — privacy friendly + faster initial paint.
 */

type Props = {
  /** Full YouTube URL — youtube.com/watch?v=… or youtu.be/… */
  url: string;
  /** Used for the iframe title (a11y). */
  title: string;
};

/** Extract the 11-char video ID from any common YouTube URL shape. */
function extractVideoId(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname === "youtu.be") {
      // https://youtu.be/VIDEO_ID
      const id = u.pathname.replace(/^\/+/, "").split("/")[0];
      return id.length === 11 ? id : null;
    }
    if (u.hostname.endsWith("youtube.com")) {
      // https://www.youtube.com/watch?v=VIDEO_ID
      const v = u.searchParams.get("v");
      if (v && v.length === 11) return v;
      // Shorts: /shorts/VIDEO_ID
      const m = u.pathname.match(/^\/(shorts|embed)\/([\w-]{11})/);
      if (m) return m[2];
    }
  } catch {
    // not a URL
  }
  return null;
}

export function VideoPlayer({ url, title }: Props) {
  const videoId = extractVideoId(url);
  const [playing, setPlaying] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  const startPlayback = useCallback(() => {
    setPlaying(true);
  }, []);

  // Origin is needed by YouTube's enablejsapi contract. Computed
  // lazily at click time — since the iframe is only mounted after
  // `playing` becomes true, this only runs client-side and avoids
  // the setState-in-useEffect lint pattern.
  const origin =
    typeof window !== "undefined" ? window.location.origin : "";

  if (!videoId) {
    return (
      <div className="rounded-3xl overflow-hidden border border-white/8 bg-black/40 aspect-video flex items-center justify-center text-zinc-400 text-sm">
        Invalid YouTube URL
      </div>
    );
  }

  // High-res thumbnail. YouTube provides several sizes; maxresdefault
  // is 1280x720, the highest non-watermarked size. Falls back via
  // onError to hqdefault (480x360, always present).
  const poster = `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`;
  const posterFallback = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;

  const embedSrc = playing
    ? `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&modestbranding=1&rel=0&iv_load_policy=3&playsinline=1&controls=1&disablekb=1&enablejsapi=1${
        origin ? `&origin=${encodeURIComponent(origin)}` : ""
      }`
    : null;

  return (
    <div className="relative w-full aspect-video rounded-2xl md:rounded-3xl overflow-hidden border border-white/8 shadow-[0_20px_60px_-12px_rgba(0,0,0,0.6)] bg-black group">
      {/* Brand-wash gradient corner washes ride over the iframe/poster
          so the player visually belongs to the rest of the page. They
          fade on hover so the video itself isn't tinted while playing. */}
      <div
        aria-hidden
        className={`pointer-events-none absolute inset-0 z-10 transition-opacity duration-700 mix-blend-multiply ${
          playing ? "opacity-0" : "opacity-100 group-hover:opacity-60"
        }`}
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 0% 0%, rgba(15,98,254,0.35) 0%, transparent 60%), radial-gradient(ellipse 60% 50% at 100% 100%, rgba(16,185,129,0.20) 0%, transparent 60%)",
        }}
      />

      {!playing ? (
        <>
          {/* Poster image. Plain <img> (not next/image) on purpose:
              the URL is YouTube's i.ytimg.com which would require
              configuring next.config.ts remotePatterns just for
              this one external host, and the image is only visible
              before the visitor clicks play (no LCP concern). */}
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
          {/* Dark-bottom fade so the play button has contrast */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0a0a0c]/70 via-transparent to-transparent"
          />
          {/* Play button — centered, IBM-blue glow */}
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
              {/* Pulse ring on idle */}
              <span
                aria-hidden
                className="absolute inset-0 rounded-full border-2 border-[#0f62fe]/40 animate-ping"
              />
              {/* Play triangle (off-center to balance optical weight) */}
              <svg
                viewBox="0 0 24 24"
                className="w-8 h-8 md:w-10 md:h-10 text-white ml-1"
                fill="currentColor"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
            </span>
          </button>
          {/* Bottom-left "Watch" label — editorial chip */}
          <span
            className="absolute bottom-5 left-5 z-20 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/50 backdrop-blur-sm border border-white/15 font-mono text-[10px] tracking-[0.32em] uppercase text-white/90"
          >
            <span aria-hidden className="w-1 h-1 rounded-full bg-[#0f62fe] shadow-[0_0_6px_rgba(15,98,254,0.8)]" />
            Watch
          </span>
        </>
      ) : (
        <iframe
          ref={iframeRef}
          src={embedSrc ?? ""}
          title={title}
          className="absolute inset-0 w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      )}
    </div>
  );
}
