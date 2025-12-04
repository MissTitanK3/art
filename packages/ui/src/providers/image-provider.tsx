// packages/ui/src/providers/ImageProvider.tsx
"use client";
import { createContext, useContext } from "react";
import { ImageComponent } from "@workspace/store/utils/image";
import { BasicImage } from "../patterns/common";
const ImageContext = createContext<ImageComponent>(BasicImage);
export const useImage = () => useContext(ImageContext);
export function ImageProvider({
  component,
  children,
}: {
  component: ImageComponent;
  children: React.ReactNode;
}) {
  return (
    <ImageContext.Provider value={component}>{children}</ImageContext.Provider>
  );
}
