"use client";
import React from "react";

type BarDatum = { label: string; value: number; color?: string };
export function BarChart({ data, max, height = 140 }: { data: BarDatum[]; max?: number; height?: number }) {
  const maxVal = max ?? Math.max(1, ...data.map((d) => d.value));
  return (
    <div className="w-full">
      <div className="flex items-end gap-3 h-[140px] sm:h-[160px]">
        {data.map((d) => (
          <div key={d.label} className="flex-1 flex flex-col items-center gap-2">
            <div
              className="w-full rounded-t-md"
              style={{
                height: `${Math.max(6, (d.value / maxVal) * height)}px`,
                background: d.color ?? "#60a5fa",
              }}
              aria-label={`${d.label}: ${d.value}`}
            />
            <div className="text-[11px] text-zinc-500 truncate w-full text-center">{d.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function LineChart({ points, height = 140, color = "#22c55e" }: { points: number[]; height?: number; color?: string }) {
  const maxVal = Math.max(1, ...points);
  const stepX = 100 / Math.max(1, points.length - 1);
  const path = points
    .map((v, i) => `${i === 0 ? "M" : "L"}${i * stepX},${100 - (v / maxVal) * 100}`)
    .join(" ");
  return (
    <div className="w-full">
      <svg viewBox="0 0 100 100" className="w-full" style={{ height }} role="img">
        <defs>
          <linearGradient id="lineFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.25" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={`${path}`} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
        <path d={`${path} L 100,100 L 0,100 Z`} fill="url(#lineFill)" />
      </svg>
    </div>
  );
}

type DonutSlice = { label: string; value: number; color: string };
export function DonutChart({ data, size = 140, thickness = 12 }: { data: DonutSlice[]; size?: number; thickness?: number }) {
  const total = data.reduce((a, b) => a + b.value, 0) || 1;
  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;
  return (
    <div className="flex items-center gap-4">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img">
        <g transform={`translate(${size / 2}, ${size / 2})`}>
          {data.map((d, i) => {
            const frac = d.value / total;
            const dash = circumference * frac;
            const circle = (
              <circle
                key={i}
                r={radius}
                cx={0}
                cy={0}
                fill="transparent"
                stroke={d.color}
                strokeWidth={thickness}
                strokeDasharray={`${dash} ${circumference}`}
                strokeDashoffset={-offset}
                strokeLinecap="butt"
              />
            );
            offset += dash;
            return circle;
          })}
        </g>
      </svg>
      <div className="space-y-1">
        {data.map((d) => (
          <div key={d.label} className="flex items-center gap-2 text-sm text-zinc-700">
            <span className="inline-block h-2.5 w-2.5 rounded" style={{ background: d.color }} />
            <span className="min-w-[110px]">{d.label}</span>
            <span className="text-zinc-500">{Math.round((d.value / total) * 100)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
