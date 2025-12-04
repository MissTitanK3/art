"use client";
import { ImageProps } from "@workspace/store/utils/image";
import * as React from "react";

export const BasicImage: React.FC<ImageProps> = ({
  src,
  alt,
  width,
  height,
  className,
  style,
  loading = "lazy",
  ...rest
}) => (
  <img
    src={src}
    alt={alt}
    width={width}
    height={height}
    className={className}
    style={style}
    loading={loading}
    {...rest}
  />
);
