/**
 * The shop's kufic mark, rebuilt on a 10-unit grid (one stroke = 10 units).
 * It inherits `currentColor`, so set the color with a text-* class.
 */
export const LOGO_PATH =
  "M0 62h10v18h-10zM20 50h10v30h-10zM40 50h10v30h-10zM60 50h10v30h-10zM80 50h30v10h-30zM80 60h10v20h-10zM0 70h90v10h-90z" +
  "M0 90h70v10h-70zM0 100h10v35h-10zM60 100h10v5h-10zM0 105h110v10h-110zM80 90h10v15h-10zM100 90h10v15h-10zM0 125h70v10h-70z" +
  "M88.5 25l8 8-8 8-8-8zM106.5 25l8 8-8 8-8-8zM106.5 67l8 8-8 8-8-8zM88.5 122l8 8-8 8-8-8zM106.5 122l8 8-8 8-8-8z" +
  "M0 62A60 60 0 0 1 102.43 19.57L95.36 26.64A50 50 0 0 0 10 62z";

export const LOGO_VIEWBOX = "0 2 114.5 136";

export function LogoMark({
  className,
  title = "Shop logo",
}: {
  className?: string;
  title?: string;
}) {
  return (
    <svg
      viewBox={LOGO_VIEWBOX}
      fill="currentColor"
      role="img"
      aria-label={title}
      className={className}
    >
      <path d={LOGO_PATH} />
    </svg>
  );
}
