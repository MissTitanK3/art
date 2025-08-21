import * as React from 'react';

// Keep UI props framework-agnostic and a strict subset
export type ImageProps = {
  src: string; // keep simple; adapters can accept StaticImport but UI only requires string
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  style?: React.CSSProperties;

  // Optional features some adapters (Next) may use:
  fill?: boolean;
  sizes?: string;
  priority?: boolean;
  unoptimized?: boolean;

  // Plain <img> ops
  loading?: 'eager' | 'lazy';
  onLoad?: React.ReactEventHandler<HTMLImageElement>;
  onError?: React.ReactEventHandler<HTMLImageElement>;
};

export type ImageComponent = React.ComponentType<ImageProps>;
