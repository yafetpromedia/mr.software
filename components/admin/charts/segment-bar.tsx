export type Segment = { label: string; value: number; color: string };

export function SegmentBar({
  segments,
  className = "",
}: {
  segments: Segment[];
  className?: string;
}) {
  const total = segments.reduce((s, seg) => s + seg.value, 0);
  if (total === 0) {
    return (
      <div className={`h-2 rounded-full bg-[var(--surface-elevated)] ${className}`} aria-hidden />
    );
  }

  return (
    <div
      className={`flex h-2 overflow-hidden rounded-full ${className}`}
      role="img"
      aria-label="Distribution bar"
    >
      {segments.map((seg) =>
        seg.value > 0 ? (
          <div
            key={seg.label}
            style={{ width: `${(seg.value / total) * 100}%`, backgroundColor: seg.color }}
            title={`${seg.label}: ${seg.value}`}
          />
        ) : null,
      )}
    </div>
  );
}
