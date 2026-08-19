"use client";

import Image from "next/image";

interface HamsterProps {
  size?: number;
  className?: string;
}

export default function Hamster({ size = 200, className = "" }: HamsterProps) {
  return (
    <Image
      src="/characters/hamster.jpg"
      alt="萌仓"
      width={size}
      height={size}
      className={className}
      style={{ width: size, height: size, objectFit: "contain" }}
      priority
    />
  );
}
