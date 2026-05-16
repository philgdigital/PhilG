/**
 * ImageSkeleton — a soft pulse placeholder that fills the same
 * aspect ratio as the image it stands in for.
 *
 * Used while images are loading or while data is being fetched to
 * populate them. Visually a low-contrast white/[0.04] surface that
 * gently pulses via Tailwind's built-in `animate-pulse` keyframe.
 * Pure CSS, zero JS cost.
 *
 * Pattern:
 *   <ImageSkeleton aspect="aspect-[16/9]" rounded="rounded-3xl" />
 */
type Props = {
  /** Tailwind aspect class, e.g. `aspect-[16/9]` or `aspect-[4/5]`. */
  aspect: string;
  /** Optional rounded class. Defaults to `rounded-2xl`. */
  rounded?: string;
  /** Optional extra classes for layout context. */
  className?: string;
};

export function ImageSkeleton({
  aspect,
  rounded = "rounded-2xl",
  className = "",
}: Props) {
  return (
    <div
      aria-hidden
      className={`relative w-full ${aspect} ${rounded} overflow-hidden bg-white/[0.04] animate-pulse ${className}`}
    />
  );
}
