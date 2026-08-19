import PixelArt from "./PixelArt";
import { birthdayCakePattern, birthdayCakeColorMap } from "./birthdayCakePattern";

interface BirthdayCakeProps {
  pixelSize?: number;
  className?: string;
}

export default function BirthdayCake({ pixelSize = 5, className = "" }: BirthdayCakeProps) {
  return (
    <PixelArt
      pattern={birthdayCakePattern}
      colorMap={birthdayCakeColorMap}
      pixelSize={pixelSize}
      className={className}
    />
  );
}
