import Image from 'next/image';

// components/mdx/Photo.tsx
type PhotoProps = {
  src: string; // relative to /public
  alt: string;
  caption?: string;
  className?: string;
  height?: number;
  width?: number;
};

export function Photo({ src, alt, caption, className = '', height = 100, width = 100 }: PhotoProps) {
  return (
    <figure className={`my-6 text-center ${className}`}>
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        className="mx-auto rounded-lg shadow-md max-w-full h-auto"
      />
      {caption && (
        <figcaption
          style={{
            maxWidth: width,
          }}
          className="mt-2 text-center m-auto text-sm text-muted-foreground">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
