export function Photo({
  src,
  alt,
  caption,
  className = "",
  height = 100,
  width = 100,
}: {
  src: string;
  alt: string;
  caption?: string;
  className?: string;
  height?: number;
  width?: number;
}) {
  return (
    <figure className={`my-6 text-center ${className}`}>
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        className="mx-auto h-auto max-w-full rounded-lg shadow-md"
        loading="lazy"
      />
      {caption ? (
        <figcaption
          className="mx-auto mt-2 text-center text-sm text-muted-foreground"
          style={{ maxWidth: width }}
        >
          {caption}
        </figcaption>
      ) : null}
    </figure>
  );
}
