// 像素风装饰元素 - 用于主题场景

interface PixelDecorationProps {
  size?: number;
  className?: string;
}

// ===== 像素星星 =====
export function PixelStar({ size = 24, className = "" }: PixelDecorationProps) {
  const starPattern = [
    [".", ".", ".", "Y", ".", ".", "."],
    [".", ".", ".", "Y", ".", ".", "."],
    [".", ".", "Y", "Y", "Y", ".", "."],
    ["Y", "Y", "Y", "Y", "Y", "Y", "Y"],
    [".", ".", "Y", "Y", "Y", ".", "."],
    [".", "Y", "Y", ".", "Y", "Y", "."],
    ["Y", "Y", ".", ".", ".", "Y", "Y"],
  ];

  const colorMap: Record<string, string> = {
    ".": "transparent",
    "Y": "#F0D060",
  };

  return <PixelGrid pattern={starPattern} colorMap={colorMap} pixelSize={size / 7} className={className} />;
}

// ===== 像素气球 =====
export function PixelBalloon({ size = 32, className = "", color = "pink" }: PixelDecorationProps & { color?: "pink" | "blue" | "yellow" | "green" }) {
  const colors = {
    pink: { main: "#F5B8B8", light: "#FAD4D4" },
    blue: { main: "#7CA8D8", light: "#A8CCF0" },
    yellow: { main: "#F0D060", light: "#F5E090" },
    green: { main: "#7CB87C", light: "#A8D8A8" },
  };

  const balloonPattern = [
    [".", ".", ".", "K", "K", ".", ".", "."],
    [".", ".", "B", "B", "B", "B", ".", "."],
    [".", "B", "L", "L", "L", "L", "B", "."],
    ["B", "L", "L", "L", "L", "L", "L", "B"],
    ["B", "L", "L", "L", "L", "L", "L", "B"],
    [".", "B", "B", "B", "B", "B", "B", "."],
    [".", ".", ".", "K", "K", ".", ".", "."],
    [".", ".", ".", ".", "K", ".", ".", "."],
  ];

  const colorMap: Record<string, string> = {
    ".": "transparent",
    "B": colors[color].main,
    "L": colors[color].light,
    "K": "#3D3226",
  };

  return <PixelGrid pattern={balloonPattern} colorMap={colorMap} pixelSize={size / 8} className={className} />;
}

// ===== 像素礼物 =====
export function PixelGift({ size = 36, className = "", color = "red" }: PixelDecorationProps & { color?: "red" | "green" | "blue" }) {
  const colors = {
    red: { main: "#E86060", dark: "#C84040", ribbon: "#F0D060" },
    green: { main: "#7CB87C", dark: "#5C985C", ribbon: "#F0D060" },
    blue: { main: "#7CA8D8", dark: "#5C88B8", ribbon: "#F0D060" },
  };

  const giftPattern = [
    [".", ".", ".", "R", "R", "R", "R", ".", ".", "."],
    [".", ".", ".", "R", "Y", "Y", "R", ".", ".", "."],
    [".", "Y", "Y", "R", "Y", "Y", "R", "Y", "Y", "."],
    [".", "Y", "Y", "Y", "Y", "Y", "Y", "Y", "Y", "."],
    [".", "M", "M", "M", "Y", "Y", "M", "M", "M", "."],
    [".", "M", "D", "M", "Y", "Y", "M", "D", "M", "."],
    [".", "M", "M", "M", "M", "M", "M", "M", "M", "."],
    [".", "M", "D", "M", "M", "M", "M", "D", "M", "."],
    [".", "M", "M", "M", "M", "M", "M", "M", "M", "."],
  ];

  const colorMap: Record<string, string> = {
    ".": "transparent",
    "M": colors[color].main,
    "D": colors[color].dark,
    "Y": colors[color].ribbon,
    "R": colors[color].ribbon,
  };

  return <PixelGrid pattern={giftPattern} colorMap={colorMap} pixelSize={size / 10} className={className} />;
}

// ===== 像素蛋糕 =====
export function PixelCake({ size = 48, className = "" }: PixelDecorationProps) {
  const cakePattern = [
    [".", ".", ".", ".", ".", "Y", "Y", ".", ".", ".", ".", "."],
    [".", ".", ".", ".", "Y", "O", "O", "Y", ".", ".", ".", "."],
    [".", ".", ".", ".", ".", "Y", "Y", ".", ".", ".", ".", "."],
    [".", "W", "W", "W", "W", "W", "W", "W", "W", "W", "W", "."],
    ["W", "P", "P", "P", "P", "P", "P", "P", "P", "P", "P", "W"],
    ["W", "W", "W", "W", "W", "W", "W", "W", "W", "W", "W", "W"],
    ["W", "C", "C", "C", "C", "C", "C", "C", "C", "C", "C", "W"],
    ["W", "C", "W", "W", "C", "W", "W", "C", "W", "W", "C", "W"],
    ["W", "W", "W", "W", "W", "W", "W", "W", "W", "W", "W", "W"],
  ];

  const colorMap: Record<string, string> = {
    ".": "transparent",
    "W": "#FFFFFF",
    "P": "#F5B8B8",
    "C": "#F0D4B0",
    "Y": "#F0D060",
    "O": "#E8A060",
  };

  return <PixelGrid pattern={cakePattern} colorMap={colorMap} pixelSize={size / 12} className={className} />;
}

// ===== 像素圣诞树 =====
export function PixelChristmasTree({ size = 48, className = "" }: PixelDecorationProps) {
  const treePattern = [
    [".", ".", ".", ".", ".", "Y", ".", ".", ".", ".", "."],
    [".", ".", ".", ".", "G", "G", "G", ".", ".", ".", "."],
    [".", ".", ".", "G", "G", "G", "G", "G", ".", ".", "."],
    [".", ".", "G", "G", "R", "G", "Y", "G", "G", ".", "."],
    [".", "G", "G", "G", "G", "G", "G", "G", "G", "G", "."],
    [".", "G", "G", "Y", "G", "G", "G", "R", "G", "G", "."],
    ["G", "G", "G", "G", "G", "G", "G", "G", "G", "G", "G"],
    ["G", "R", "G", "G", "Y", "G", "G", "G", "Y", "G", "G"],
    [".", ".", ".", ".", "B", "B", "B", ".", ".", ".", "."],
    [".", ".", ".", ".", "B", "B", "B", ".", ".", ".", "."],
  ];

  const colorMap: Record<string, string> = {
    ".": "transparent",
    "G": "#5C985C",
    "Y": "#F0D060",
    "R": "#E86060",
    "B": "#8B6914",
  };

  return <PixelGrid pattern={treePattern} colorMap={colorMap} pixelSize={size / 11} className={className} />;
}

// ===== 像素南瓜 =====
export function PixelPumpkin({ size = 40, className = "" }: PixelDecorationProps) {
  const pumpkinPattern = [
    [".", ".", ".", ".", "G", "G", ".", ".", ".", "."],
    [".", ".", ".", "G", "G", "G", "G", ".", ".", "."],
    [".", "O", "O", "O", "O", "O", "O", "O", "O", "."],
    ["O", "O", "Y", "O", "O", "O", "O", "O", "Y", "O"],
    ["O", "Y", "Y", "Y", "O", "O", "O", "Y", "Y", "Y"],
    ["O", "O", "O", "O", "K", "O", "K", "O", "O", "O"],
    ["O", "O", "Y", "O", "O", "K", "O", "O", "Y", "O"],
    ["O", "O", "O", "O", "K", "K", "K", "O", "O", "O"],
    [".", "O", "O", "O", "O", "O", "O", "O", "O", "."],
    [".", ".", "O", "O", "O", "O", "O", "O", ".", "."],
  ];

  const colorMap: Record<string, string> = {
    ".": "transparent",
    "O": "#E8A060",
    "Y": "#F0D060",
    "G": "#7CB87C",
    "K": "#3D3226",
  };

  return <PixelGrid pattern={pumpkinPattern} colorMap={colorMap} pixelSize={size / 10} className={className} />;
}

// ===== 像素彩带 =====
export function PixelConfetti({ size = 8, className = "" }: PixelDecorationProps) {
  return (
    <div className={`flex gap-1 ${className}`}>
      {["#F5B8B8", "#7CA8D8", "#F0D060", "#7CB87C", "#E8A060"].map((color, i) => (
        <div
          key={i}
          style={{
            width: size,
            height: size * 1.5,
            backgroundColor: color,
            transform: `rotate(${(i * 30) - 60}deg)`,
          }}
        />
      ))}
    </div>
  );
}

// ===== 像素爱心 =====
export function PixelHeart({ size = 32, className = "", color = "rose" }: PixelDecorationProps & { color?: "rose" | "pink" | "red" }) {
  const colors = {
    rose: { main: "#E86088", light: "#F5A0B8", dark: "#C84068" },
    pink: { main: "#F5B8B8", light: "#FAD4D4", dark: "#E89898" },
    red: { main: "#E86060", light: "#F5A0A0", dark: "#C84040" },
  };

  const heartPattern = [
    [".", ".", "M", "M", ".", ".", ".", "M", "M", ".", "."],
    [".", "M", "L", "L", "M", ".", "M", "L", "L", "M", "."],
    ["M", "L", "L", "L", "L", "M", "L", "L", "L", "L", "M"],
    ["M", "L", "L", "L", "L", "L", "L", "L", "L", "L", "M"],
    ["M", "L", "L", "L", "L", "L", "L", "L", "L", "L", "M"],
    [".", "M", "L", "L", "L", "L", "L", "L", "L", "M", "."],
    [".", ".", "M", "L", "L", "L", "L", "L", "M", ".", "."],
    [".", ".", ".", "M", "L", "L", "L", "M", ".", ".", "."],
    [".", ".", ".", ".", "M", "L", "M", ".", ".", ".", "."],
    [".", ".", ".", ".", ".", "M", ".", ".", ".", ".", "."],
  ];

  const colorMap: Record<string, string> = {
    ".": "transparent",
    "M": colors[color].main,
    "L": colors[color].light,
    "D": colors[color].dark,
  };

  return <PixelGrid pattern={heartPattern} colorMap={colorMap} pixelSize={size / 11} className={className} />;
}

// ===== 像素玫瑰 =====
export function PixelRose({ size = 36, className = "" }: PixelDecorationProps) {
  const rosePattern = [
    [".", ".", ".", ".", "G", "G", ".", ".", ".", "."],
    [".", ".", ".", "G", "G", "G", "G", ".", ".", "."],
    [".", ".", "G", "G", "G", "G", "G", "G", ".", "."],
    [".", "R", "R", "M", "M", "M", "M", "R", "R", "."],
    ["R", "R", "M", "L", "L", "L", "L", "M", "R", "R"],
    ["R", "M", "L", "L", "D", "D", "L", "L", "M", "R"],
    ["R", "M", "L", "D", "D", "D", "D", "L", "M", "R"],
    ["R", "R", "M", "L", "L", "L", "L", "M", "R", "R"],
    [".", "R", "R", "M", "M", "M", "M", "R", "R", "."],
    [".", ".", "G", "G", "G", "G", "G", "G", ".", "."],
    [".", ".", ".", "G", "G", "G", "G", ".", ".", "."],
  ];

  const colorMap: Record<string, string> = {
    ".": "transparent",
    "R": "#C84068",
    "M": "#E86088",
    "L": "#F5A0B8",
    "D": "#A83050",
    "G": "#5C985C",
  };

  return <PixelGrid pattern={rosePattern} colorMap={colorMap} pixelSize={size / 11} className={className} />;
}

// ===== 像素巧克力盒 =====
export function PixelChocolate({ size = 40, className = "" }: PixelDecorationProps) {
  const chocolatePattern = [
    [".", "R", "R", "R", "R", "R", "R", "R", "R", "."],
    ["R", "Y", "Y", "Y", "Y", "Y", "Y", "Y", "Y", "R"],
    ["R", "Y", "R", "R", "Y", "Y", "R", "R", "Y", "R"],
    ["R", "Y", "R", "Y", "Y", "Y", "Y", "R", "Y", "R"],
    ["R", "Y", "Y", "Y", "H", "H", "Y", "Y", "Y", "R"],
    ["R", "Y", "Y", "Y", "H", "H", "Y", "Y", "Y", "R"],
    ["R", "Y", "R", "Y", "Y", "Y", "Y", "R", "Y", "R"],
    ["R", "Y", "R", "R", "Y", "Y", "R", "R", "Y", "R"],
    ["R", "Y", "Y", "Y", "Y", "Y", "Y", "Y", "Y", "R"],
    [".", "B", "B", "B", "B", "B", "B", "B", "B", "."],
  ];

  const colorMap: Record<string, string> = {
    ".": "transparent",
    "R": "#E86088",
    "Y": "#F5E090",
    "B": "#8B4513",
    "H": "#5C3A1E",
  };

  return <PixelGrid pattern={chocolatePattern} colorMap={colorMap} pixelSize={size / 10} className={className} />;
}

// ===== 像素情书/信封 =====
export function PixelEnvelope({ size = 36, className = "" }: PixelDecorationProps) {
  const envelopePattern = [
    [".", ".", ".", ".", ".", ".", ".", ".", ".", "."],
    [".", "W", "W", "W", "W", "W", "W", "W", "W", "."],
    ["W", "W", "M", "W", "W", "W", "W", "W", "W", "W"],
    ["W", "W", "W", "M", "W", "W", "W", "W", "W", "W"],
    ["W", "W", "W", "W", "M", "M", "W", "W", "W", "W"],
    ["W", "W", "W", "W", "M", "M", "W", "W", "W", "W"],
    ["W", "W", "W", "M", "W", "W", "M", "W", "W", "W"],
    ["W", "W", "M", "W", "W", "W", "W", "M", "W", "W"],
    ["W", "W", "W", "W", "W", "W", "W", "W", "W", "W"],
    [".", "B", "B", "B", "B", "B", "B", "B", "B", "."],
  ];

  const colorMap: Record<string, string> = {
    ".": "transparent",
    "W": "#FFFFFF",
    "M": "#E86088",
    "B": "#F5A0B8",
  };

  return <PixelGrid pattern={envelopePattern} colorMap={colorMap} pixelSize={size / 10} className={className} />;
}

// ===== 像素丘比特之箭 =====
export function PixelCupidArrow({ size = 32, className = "" }: PixelDecorationProps) {
  const arrowPattern = [
    [".", ".", ".", ".", ".", ".", ".", "H", "H", ".", ".", "."],
    [".", ".", ".", ".", ".", ".", "H", "H", "H", "H", ".", "."],
    [".", ".", ".", ".", ".", "H", "H", "F", "F", "H", "H", "."],
    [".", "R", "R", "R", "R", "R", "R", "F", "F", "R", "R", "R"],
    ["R", "R", "R", "R", "R", "R", "R", "F", "F", "R", "R", "R"],
    [".", "R", "R", "R", "R", "R", "R", "F", "F", "R", "R", "R"],
    [".", ".", ".", ".", ".", "H", "H", "F", "F", "H", "H", "."],
    [".", ".", ".", ".", ".", ".", "H", "H", "H", "H", ".", "."],
    [".", ".", ".", ".", ".", ".", ".", "H", "H", ".", ".", "."],
  ];

  const colorMap: Record<string, string> = {
    ".": "transparent",
    "H": "#E86088",
    "F": "#F5A0B8",
    "R": "#C84068",
  };

  return <PixelGrid pattern={arrowPattern} colorMap={colorMap} pixelSize={size / 12} className={className} />;
}

// ===== 像素钻石/戒指 =====
export function PixelDiamond({ size = 28, className = "" }: PixelDecorationProps) {
  const diamondPattern = [
    [".", ".", "S", "S", "S", "S", "S", "S", ".", "."],
    [".", "S", "W", "W", "W", "W", "W", "W", "S", "."],
    ["S", "W", "B", "W", "B", "B", "W", "B", "W", "S"],
    ["S", "W", "W", "B", "W", "W", "B", "W", "W", "S"],
    [".", "S", "W", "W", "B", "B", "W", "W", "S", "."],
    [".", ".", "S", "W", "W", "W", "W", "S", ".", "."],
    [".", ".", ".", "S", "W", "W", "S", ".", ".", "."],
    [".", ".", ".", ".", "S", "S", ".", ".", ".", "."],
  ];

  const colorMap: Record<string, string> = {
    ".": "transparent",
    "S": "#E86088",
    "W": "#FFFFFF",
    "B": "#A8D8F0",
  };

  return <PixelGrid pattern={diamondPattern} colorMap={colorMap} pixelSize={size / 10} className={className} />;
}

// ===== 基础像素网格渲染器（SVG 版本，大幅减少 DOM 节点） =====
function PixelGrid({
  pattern,
  colorMap,
  pixelSize,
  className,
}: {
  pattern: string[][];
  colorMap: Record<string, string>;
  pixelSize: number;
  className?: string;
}) {
  const rows = pattern.length;
  const cols = pattern[0]?.length || 0;
  const width = cols * pixelSize;
  const height = rows * pixelSize;

  // 预计算非透明格子的 rect，跳过透明像素（最大性能优化）
  const rects: { x: number; y: number; color: string }[] = [];
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const cell = pattern[y][x];
      const color = colorMap[cell];
      if (color && color !== "transparent") {
        rects.push({ x: x * pixelSize, y: y * pixelSize, color });
      }
    }
  }

  return (
    <svg
      className={className}
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      style={{ imageRendering: "pixelated", shapeRendering: "crispEdges", display: "block" }}
    >
      {rects.map((r, i) => (
        <rect key={i} x={r.x} y={r.y} width={pixelSize} height={pixelSize} fill={r.color} />
      ))}
    </svg>
  );
}
