import PixelArt from "./PixelArt";
import { bunnyPattern, bunnyColorMap } from "./bunnyPattern";

interface BunnyProps {
  pixelSize?: number;
  className?: string;
}

export default function Bunny({ pixelSize = 6, className = "" }: BunnyProps) {
  return (
    <PixelArt
      pattern={bunnyPattern}
      colorMap={bunnyColorMap}
      pixelSize={pixelSize}
      className={className}
    />
  );
}
