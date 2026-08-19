import PixelArt from "./PixelArt";
import {
  balloonPattern,
  balloonColorMap,
  balloonPinkColorMap,
  balloonGreenColorMap,
  balloonYellowColorMap,
} from "./balloonPattern";

interface BalloonProps {
  pixelSize?: number;
  className?: string;
  color?: "blue" | "pink" | "green" | "yellow";
}

const colorMaps = {
  blue: balloonColorMap,
  pink: balloonPinkColorMap,
  green: balloonGreenColorMap,
  yellow: balloonYellowColorMap,
};

export default function Balloon({
  pixelSize = 4,
  className = "",
  color = "blue",
}: BalloonProps) {
  return (
    <PixelArt
      pattern={balloonPattern}
      colorMap={colorMaps[color]}
      pixelSize={pixelSize}
      className={className}
    />
  );
}
