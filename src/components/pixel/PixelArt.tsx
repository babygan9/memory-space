import React from "react";

interface PixelArtProps {
  pattern: string[][];
  colorMap: Record<string, string>;
  pixelSize?: number;
  className?: string;
}

export default function PixelArt({
  pattern,
  colorMap,
  pixelSize = 6,
  className = "",
}: PixelArtProps) {
  const rows = pattern.length;
  const cols = pattern[0]?.length || 0;

  return (
    <div
      className={className}
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${cols}, ${pixelSize}px)`,
        gridTemplateRows: `repeat(${rows}, ${pixelSize}px)`,
        width: cols * pixelSize,
        height: rows * pixelSize,
      }}
    >
      {pattern.map((row, y) =>
        row.map((cell, x) => (
          <div
            key={`${x}-${y}`}
            style={{
              width: pixelSize,
              height: pixelSize,
              backgroundColor: colorMap[cell] || "transparent",
            }}
          />
        ))
      )}
    </div>
  );
}
