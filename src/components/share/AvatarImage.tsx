"use client";

import Image, { ImageProps } from "next/image";
import { useState } from "react";

const fallbackAvatar = "/images/avatar-placeholder.svg";

export default function AvatarImage({ src, onError, ...props }: ImageProps) {
  const [failedSource, setFailedSource] = useState<ImageProps["src"] | null>(null);
  const isDefaultAvatar =
    typeof src === "string" &&
    /^https?:\/\/avatar\.iran\.liara\.run(?:\/|$)/i.test(src);
  const imageSource =
    !src || isDefaultAvatar || src === failedSource ? fallbackAvatar : src;

  return (
    <Image
      {...props}
      src={imageSource}
      onError={(event) => {
        if (imageSource !== fallbackAvatar) setFailedSource(src);
        onError?.(event);
      }}
    />
  );
}
