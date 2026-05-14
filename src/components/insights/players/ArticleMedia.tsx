"use client";

import { useEffect, useRef, useState } from "react";
import { VideoPlayer } from "./VideoPlayer";
import { AudioPlayer } from "./AudioPlayer";

/**
 * Wraps the optional video + audio companions for an insight article
 * and coordinates the two AudioPlayer instances:
 *   - One INLINE player mounts at the top of the article (with the
 *     <audio> source element it owns)
 *   - One STICKY pill mounts fixed to the bottom-right of the
 *     viewport, fades in once the inline player has scrolled off
 *     the top of the viewport.
 *
 * IntersectionObserver on a sentinel placed just below the inline
 * audio player flips the sticky visibility. When the sentinel
 * intersects the viewport, the inline player is on-screen and the
 * sticky is hidden; when it scrolls off, the sticky appears.
 *
 * If a post has no video, no <VideoPlayer> renders. If a post has
 * no audio, no audio players render. If both are absent, the whole
 * component renders nothing — the article body sits directly after
 * the hero image as before.
 */

type Props = {
  title: string;
  video?: string;
  audio?: string;
};

export function ArticleMedia({ title, video, audio }: Props) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const [showSticky, setShowSticky] = useState(false);

  // Wire the sticky-visibility intersection observer. The sentinel
  // sits just below the inline AudioPlayer. When it's visible, the
  // inline player is on-screen and the sticky stays hidden. When it
  // intersects out (visitor scrolled past), the sticky fades in.
  useEffect(() => {
    if (!audio) return;
    const node = sentinelRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        // showSticky = sentinel is NOT visible (we've scrolled past)
        setShowSticky(!entry.isIntersecting);
      },
      // rootMargin negative top so the sticky doesn't trigger the
      // INSTANT the inline player leaves the very top — gives a
      // ~80px buffer so the handoff feels smooth.
      { rootMargin: "-80px 0px 0px 0px", threshold: 0 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [audio]);

  if (!video && !audio) return null;

  return (
    <div className="max-w-5xl mx-auto mb-12 md:mb-16 flex flex-col gap-8 md:gap-10">
      {video && <VideoPlayer url={video} title={title} />}
      {audio && (
        <>
          <AudioPlayer
            src={audio}
            title={title}
            variant="inline"
            audioRef={audioRef}
          />
          {/* Sentinel — invisible. Sits just below the inline player
              so when it scrolls past the top of the viewport, the
              sticky pill fades in. */}
          <div ref={sentinelRef} aria-hidden className="h-px w-full" />
          <AudioPlayer
            src={audio}
            title={title}
            variant="sticky"
            audioRef={audioRef}
            stickyVisible={showSticky}
          />
        </>
      )}
    </div>
  );
}
