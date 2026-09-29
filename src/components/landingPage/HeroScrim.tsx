/* Light wash over photographic hero backgrounds so the dark hero copy stays
   legible whatever colours the photo has behind it. Strong on the left where
   the copy sits, clearing towards the right so the image still reads. On
   mobile the copy spans the full width, so the wash is even instead.
   The parent must be `relative isolate`: that keeps this layer above the
   parent's background image but below the hero content. */
export default function HeroScrim() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 -z-10 bg-white/65 md:bg-transparent md:bg-linear-to-r md:from-white/90 md:via-white/60 md:via-45% md:to-transparent"
    />
  );
}
