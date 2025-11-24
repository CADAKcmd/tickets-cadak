"use client";

import React, { useState } from "react";
import Image, { type StaticImageData } from "next/image";

type Props = {
  src: string | StaticImageData;
  alt?: string;
  className?: string;
  fill?: boolean;
  priority?: boolean;
  sizes?: string;
};

export default function ImageFade({ src, alt, className = "", fill = false, priority = false, sizes }: Props) {
  const [loaded, setLoaded] = useState(false);
  const isRemote = typeof src === "string" && /^https?:\/\//i.test(src);

  const commonClasses = `${className} transition-opacity duration-700 ease-out ${loaded ? "opacity-100" : "opacity-0"}`;

  if (!isRemote && !fill) {
    // local static import as img tag
    return (
      <div className={`relative overflow-hidden ${className}`}>
        <Image
          src={src as StaticImageData}
          alt={alt || ""}
          onLoad={() => setLoaded(true)}
          priority={priority}
          sizes={sizes}
          className={commonClasses}
        />
      </div>
    );
  }

  if (!isRemote && fill) {
    return (
      <div className={`relative ${className}`}>
        <Image
          src={src as StaticImageData}
          alt={alt || ""}
          fill
          onLoad={() => setLoaded(true)}
          priority={priority}
          sizes={sizes}
          className={commonClasses + " object-cover"}
        />
      </div>
    );
  }

  // Remote images: use <img> with a simple blurred placeholder (CSS backdrop)
  return (
    <div className={`relative overflow-hidden ${className}`} style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.12), rgba(0,0,0,0.04))" }}>
      <img
        src={src as string}
        alt={alt || ""}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        onLoad={() => setLoaded(true)}
        className={`${commonClasses} object-cover w-full h-full`} 
      />
      {!loaded && (
        <div className="absolute inset-0 animate-pulse bg-[rgba(0,0,0,0.08)]" />
      )}
    </div>
  );
}
