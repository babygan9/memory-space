import PixelArt from "./PixelArt";
import { hamsterPattern, hamsterColorMap } from "./hamsterPattern";

interface HamsterProps {
  pixelSize?: number;
  className?: string;
}

export default function Hamster({ pixelSize = 6, className = "" }: HamsterProps) {
  return (
    <PixelArt
      pattern={hamsterPattern}
      colorMap={hamsterColorMap}
      pixelSize={pixelSize}
      className={className}
    />
  );
}
