"use client";

import Image from "next/image";

interface BunnyProps {
  size?: number;
  className?: string;
}

export default function Bunny({ size = 200, className = "" }: BunnyProps) {
  return (
    <Image
      src="/characters/bunny.jpg"
      alt="兔兔圆"
      width={size}
      height={size}
      className={className}
      style={{ width: size, height: size, objectFit: "contain" }}
      priority
    />
  );
}
