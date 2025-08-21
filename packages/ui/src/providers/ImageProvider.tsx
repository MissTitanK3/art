// packages/ui/src/providers/ImageProvider.tsx
"use client";
import * as React from "react";
import { ImageComponent } from "../types/image.ts";
import { BasicImage } from "../components/BasicImage.tsx";

const ImageContext = React.createContext<ImageComponent>(BasicImage);
export const useImage = () => React.useContext(ImageContext);

export function ImageProvider({
  component,
  children,
}: {
  component: ImageComponent;
  children: React.ReactNode;
}) {
  return <ImageContext.Provider value={component}>{children}</ImageContext.Provider>;
}
