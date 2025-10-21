"use client";
import * as React from "react";
import NextImage from "next/image";
import { ImageComponent } from "@workspace/store/utils/image";

export const NextImageAdapter: ImageComponent = ({
  src,
  alt,
  width,
  height,
  className,
  style,
  fill,
  sizes,
  priority,
  unoptimized,
}) => {
  // Next/Image requires either fill OR numeric width+height
  const hasDims = typeof width === "number" && typeof height === "number";

  return (
    <NextImage
      src={src as any}               // Next can accept StaticImport if you pass one
      alt={alt}
      className={className}
      style={style}
      {...(fill
        ? { fill: true, sizes }
        : { width: hasDims ? width : 64, height: hasDims ? height : 64 })}
      priority={priority}
      unoptimized={unoptimized}
    />
  );
};
