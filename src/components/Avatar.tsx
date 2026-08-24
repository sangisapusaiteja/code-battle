/* eslint-disable @next/next/no-img-element */

/**
 * User avatar: shows the Google profile picture when available,
 * otherwise falls back to the first letter of the username.
 */
export default function Avatar({
  src,
  name,
  className = "",
}: {
  src?: string | null;
  name?: string;
  className?: string;
}) {
  if (src) {
    return (
      <img
        src={src}
        alt={name ? `${name}'s avatar` : "avatar"}
        referrerPolicy="no-referrer"
        className={`${className} object-cover`}
      />
    );
  }

  return (
    <span className={`${className} flex items-center justify-center font-bold`}>
      {(name ?? "?")[0]?.toUpperCase()}
    </span>
  );
}
