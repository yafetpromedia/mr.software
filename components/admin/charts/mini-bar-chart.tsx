type Point = { date: string; value: number };

export function MiniBarChart({
  data,
  height = 100,
  className = "",
}: {
  data: Point[];
  height?: number;
  className?: string;
}) {
  const width = 100;
  const pad = { top: 6, right: 2, bottom: 4, left: 2 };
  const innerW = width - pad.left - pad.right;
  const innerH = height - pad.top - pad.bottom;
  const max = Math.max(...data.map((d) => d.value), 1);
  const barW = innerW / Math.max(data.length, 1) - 1;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className={className}
      preserveAspectRatio="none"
      role="img"
      aria-label="Bar chart"
    >
      {data.map((d, i) => {
        const h = (d.value / max) * innerH;
        const x = pad.left + i * (barW + 1);
        const y = pad.top + innerH - h;
        return (
          <rect
            key={d.date}
            x={x}
            y={y}
            width={Math.max(barW, 0.5)}
            height={Math.max(h, 0)}
            rx="0.5"
            fill="var(--accent)"
            opacity={d.value === 0 ? 0.15 : 0.35 + (d.value / max) * 0.65}
          />
        );
      })}
    </svg>
  );
}
