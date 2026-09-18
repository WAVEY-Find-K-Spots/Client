import type {
  OcrPoint,
  TranslationLayoutBlock,
} from "@/lib/vision/api";

const MAX_CANVAS_EDGE = 2048;
const MIN_FONT_SIZE = 8;
const ABSOLUTE_MIN_FONT_SIZE = 4;

interface RgbColor {
  red: number;
  green: number;
  blue: number;
}

interface Point {
  x: number;
  y: number;
}

interface Bounds {
  left: number;
  top: number;
  width: number;
  height: number;
}

export async function createTranslatedImage(
  imageUrl: string,
  blocks: TranslationLayoutBlock[],
): Promise<Blob> {
  const image = await loadImage(imageUrl);
  const scale = Math.min(
    1,
    MAX_CANVAS_EDGE / Math.max(image.naturalWidth, image.naturalHeight),
  );
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
  canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));

  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) {
    throw new Error("Canvas is not supported.");
  }
  context.drawImage(image, 0, 0, canvas.width, canvas.height);

  blocks.forEach((block) => {
    const text = block.translatedText?.trim();
    if (!text || block.polygon.length < 4) return;
    renderBlock(
      context,
      block.polygon.map((point) => ({
        x: point.x * scale,
        y: point.y * scale,
      })),
      text,
    );
  });

  return canvasToBlob(canvas);
}

function loadImage(source: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Could not load the source image."));
    image.src = source;
  });
}

function renderBlock(
  context: CanvasRenderingContext2D,
  points: Point[],
  text: string,
) {
  const bounds = polygonBounds(points, context.canvas.width, context.canvas.height);
  if (bounds.width < 4 || bounds.height < 4) return;

  const background = sampleSurroundingColor(context, bounds);
  fillPolygon(context, points, background);

  const topWidth = distance(points[0], points[1]);
  const bottomWidth = distance(points[3], points[2]);
  const leftHeight = distance(points[0], points[3]);
  const rightHeight = distance(points[1], points[2]);
  const width = Math.max(4, (topWidth + bottomWidth) / 2);
  const height = Math.max(4, (leftHeight + rightHeight) / 2);
  const angle = Math.atan2(
    points[1].y - points[0].y,
    points[1].x - points[0].x,
  );

  context.save();
  context.translate(points[0].x, points[0].y);
  context.rotate(angle);
  drawFittedText(context, text, width, height, background);
  context.restore();
}

function polygonBounds(
  points: Point[],
  canvasWidth: number,
  canvasHeight: number,
) {
  const xs = points.map((point) => point.x);
  const ys = points.map((point) => point.y);
  const left = Math.max(0, Math.floor(Math.min(...xs)));
  const top = Math.max(0, Math.floor(Math.min(...ys)));
  const right = Math.min(canvasWidth, Math.ceil(Math.max(...xs)));
  const bottom = Math.min(canvasHeight, Math.ceil(Math.max(...ys)));
  return {
    left,
    top,
    width: Math.max(0, right - left),
    height: Math.max(0, bottom - top),
  };
}

function sampleBorderColor(
  context: CanvasRenderingContext2D,
  bounds: Bounds,
): RgbColor {
  const imageData = context.getImageData(
    bounds.left,
    bounds.top,
    bounds.width,
    bounds.height,
  );
  const { data, width, height } = imageData;
  const samples: number[] = [];
  const step = Math.max(1, Math.floor(Math.max(width, height) / 80));

  const pushPixel = (x: number, y: number) => {
    const index = (y * width + x) * 4;
    if (data[index + 3] > 0) samples.push(index);
  };
  for (let x = 0; x < width; x += step) {
    pushPixel(x, 0);
    pushPixel(x, height - 1);
  }
  for (let y = 0; y < height; y += step) {
    pushPixel(0, y);
    pushPixel(width - 1, y);
  }

  if (samples.length === 0) return { red: 255, green: 255, blue: 255 };
  const total = samples.reduce(
    (sum, index) => ({
      red: sum.red + data[index],
      green: sum.green + data[index + 1],
      blue: sum.blue + data[index + 2],
    }),
    { red: 0, green: 0, blue: 0 },
  );
  return {
    red: Math.round(total.red / samples.length),
    green: Math.round(total.green / samples.length),
    blue: Math.round(total.blue / samples.length),
  };
}

function sampleSurroundingColor(
  context: CanvasRenderingContext2D,
  bounds: Bounds,
): RgbColor {
  const margin = Math.max(
    3,
    Math.round(Math.min(18, Math.max(bounds.width, bounds.height) * 0.18)),
  );
  const left = Math.max(0, bounds.left - margin);
  const top = Math.max(0, bounds.top - margin);
  const right = Math.min(
    context.canvas.width,
    bounds.left + bounds.width + margin,
  );
  const bottom = Math.min(
    context.canvas.height,
    bounds.top + bounds.height + margin,
  );
  const width = right - left;
  const height = bottom - top;
  if (width < 1 || height < 1) return sampleBorderColor(context, bounds);

  const imageData = context.getImageData(left, top, width, height);
  const bins = new Map<
    string,
    { count: number; red: number; green: number; blue: number }
  >();
  const step = Math.max(1, Math.floor(Math.max(width, height) / 120));
  const innerLeft = bounds.left - left;
  const innerTop = bounds.top - top;
  const innerRight = innerLeft + bounds.width;
  const innerBottom = innerTop + bounds.height;

  for (let y = 0; y < height; y += step) {
    for (let x = 0; x < width; x += step) {
      const insideTextBounds =
        x >= innerLeft &&
        x <= innerRight &&
        y >= innerTop &&
        y <= innerBottom;
      if (insideTextBounds) continue;

      const index = (y * width + x) * 4;
      if (imageData.data[index + 3] < 230) continue;
      const red = imageData.data[index];
      const green = imageData.data[index + 1];
      const blue = imageData.data[index + 2];
      const key = `${Math.round(red / 24)}-${Math.round(green / 24)}-${Math.round(
        blue / 24,
      )}`;
      const bin = bins.get(key) ?? {
        count: 0,
        red: 0,
        green: 0,
        blue: 0,
      };
      bin.count += 1;
      bin.red += red;
      bin.green += green;
      bin.blue += blue;
      bins.set(key, bin);
    }
  }

  const dominant = [...bins.values()].sort(
    (first, second) => second.count - first.count,
  )[0];
  if (!dominant) return sampleBorderColor(context, bounds);
  return {
    red: Math.round(dominant.red / dominant.count),
    green: Math.round(dominant.green / dominant.count),
    blue: Math.round(dominant.blue / dominant.count),
  };
}

function fillPolygon(
  context: CanvasRenderingContext2D,
  points: Point[],
  color: RgbColor,
) {
  context.save();
  context.beginPath();
  context.moveTo(points[0].x, points[0].y);
  points.slice(1).forEach((point) => context.lineTo(point.x, point.y));
  context.closePath();
  context.fillStyle = `rgb(${color.red}, ${color.green}, ${color.blue})`;
  context.strokeStyle = context.fillStyle;
  context.lineJoin = "round";
  const averageHeight =
    (distance(points[0], points[3]) + distance(points[1], points[2])) / 2;
  context.lineWidth = Math.max(2, Math.min(6, averageHeight * 0.16));
  context.stroke();
  context.fill();
  context.restore();
}

function drawFittedText(
  context: CanvasRenderingContext2D,
  text: string,
  width: number,
  height: number,
  background: RgbColor,
) {
  const padding = Math.max(2, Math.min(width, height) * 0.06);
  const availableWidth = Math.max(1, width - padding * 2);
  const availableHeight = Math.max(1, height - padding * 2);
  const normalizedText = text.replace(/\s+/g, " ").trim();
  let selectedSize = Math.max(
    MIN_FONT_SIZE,
    Math.floor(Math.min(availableHeight * 0.82, 48)),
  );
  let selectedLines = [normalizedText];

  for (
    let fontSize = selectedSize;
    fontSize >= ABSOLUTE_MIN_FONT_SIZE;
    fontSize -= 1
  ) {
    context.font = `600 ${fontSize}px Arial, sans-serif`;
    const lines = wrapText(context, normalizedText, availableWidth);
    const lineHeight = fontSize * 1.15;
    const widestLine = Math.max(
      ...lines.map((line) => context.measureText(line).width),
    );
    if (
      widestLine <= availableWidth &&
      lines.length * lineHeight <= availableHeight
    ) {
      selectedSize = fontSize;
      selectedLines = lines;
      break;
    }
    if (fontSize === ABSOLUTE_MIN_FONT_SIZE) {
      selectedSize = fontSize;
      selectedLines = lines;
    }
  }

  const lineHeight = selectedSize * 1.15;
  const totalHeight = selectedLines.length * lineHeight;
  context.font = `600 ${selectedSize}px Arial, sans-serif`;
  const multiline = selectedLines.length > 1;
  context.textAlign = multiline ? "left" : "center";
  context.textBaseline = "middle";
  context.fillStyle = readableTextColor(background);
  selectedLines.forEach((line, index) => {
    context.fillText(
      line,
      multiline ? padding : width / 2,
      padding + (availableHeight - totalHeight) / 2 + lineHeight * (index + 0.5),
      availableWidth,
    );
  });
}

function wrapText(
  context: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
) {
  const words = text.split(" ");
  const lines: string[] = [];
  let current = "";
  words.forEach((word) => {
    const candidate = current ? `${current} ${word}` : word;
    if (current && context.measureText(candidate).width > maxWidth) {
      lines.push(current);
      current = word;
    } else {
      current = candidate;
    }
  });
  if (current) lines.push(current);
  return lines.length > 0 ? lines : [text];
}

function readableTextColor({ red, green, blue }: RgbColor) {
  const luminance = (0.299 * red + 0.587 * green + 0.114 * blue) / 255;
  return luminance > 0.55 ? "#20130e" : "#ffffff";
}

function distance(first: Point, second: Point) {
  return Math.hypot(second.x - first.x, second.y - first.y);
}

function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Could not create the translated image."));
      },
      "image/jpeg",
      0.9,
    );
  });
}
