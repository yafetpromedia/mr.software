type Point = { date: string; value: number };

function smoothPath(points: { x: number; y: number }[]) {
  if (points.length === 0) return "";
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;

  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] ?? points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] ?? p2;
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
  }
  return d;
}

export function MiniAreaChart({
  data,
  height = 120,
  className = "",
  formatValue,
}: {
  data: Point[];
  height?: number;
  className?: string;
  formatValue?: (n: number) => string;
}) {
  const width = 100;
  const pad = { top: 8, right: 4, bottom: 4, left: 4 };
  const innerW = width - pad.left - pad.right;
  const innerH = height - pad.top - pad.bottom;
  const max = Math.max(...data.map((d) => d.value), 1);

  const coords = data.map((d, i) => ({
    x: pad.left + (data.length <= 1 ? innerW / 2 : (i / (data.length - 1)) * innerW),
    y: pad.top + innerH - (d.value / max) * innerH,
  }));

  const line = smoothPath(coords);
  const area =
    coords.length > 0
      ? `${line} L ${coords[coords.length - 1].x} ${pad.top + innerH} L ${coords[0].x} ${pad.top + innerH} Z`
      : "";

  const last = data[data.length - 1];
  const total = data.reduce((s, d) => s + d.value, 0);

  return (
    <div className={className}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-full w-full"
        preserveAspectRatio="none"
        role="img"
        aria-label={`Chart, total ${formatValue ? formatValue(total) : total}`}
      >
        <defs>
          <linearGradient id="admin-area-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.35" />
            <stop offset="100%" stopColor="var(--accent)" stopOpacity="0.02" />
          </linearGradient>
        </defs>
        {area ? <path d={area} fill="url(#admin-area-fill)" /> : null}
        {line ? (
          <path
            d={line}
            fill="none"
            stroke="var(--accent)"
            strokeWidth="1.5"
            vectorEffect="non-scaling-stroke"
          />
        ) : null}
        {coords.length > 0 ? (
          <circle
            cx={coords[coords.length - 1].x}
            cy={coords[coords.length - 1].y}
            r="2"
            fill="var(--accent)"
          />
        ) : null}
      </svg>
      {last ? (
        <p className="sr-only">
          Latest: {formatValue ? formatValue(last.value) : last.value} on {last.date}
        </p>
      ) : null}
    </div>
  );
}
