"use client";

import QRCode from "qrcode";

import { cn } from "cn";
import * as React from "react";

export type QrCodeProps = React.ComponentProps<"svg"> & {
  text: string;
  errorCorrection?: "L" | "M" | "Q" | "H";
  logoRatio?: number;
  children?: React.ReactNode;
};

export function QrCode({
  text,
  errorCorrection,
  logoRatio = 0.22,
  className,
  children,
  ...props
}: QrCodeProps) {
  const hasLogo = React.Children.count(children) > 0;
  const errorCorrectionLevel = errorCorrection ?? (hasLogo ? "H" : "M");

  const { path, count, cutout, start } = React.useMemo(() => {
    const { modules } = QRCode.create(text, { errorCorrectionLevel });
    const count = modules.size;

    let cutout = 0;
    if (hasLogo) {
      const clampedRatio = Math.min(Math.max(logoRatio, 0), 0.3);
      cutout = Math.round(count * clampedRatio);
      if ((count - cutout) % 2 !== 0) cutout++;
    }

    const start = (count - cutout) / 2;
    const end = start + cutout;

    const isDark = (row: number, col: number) =>
      !!modules.get(row, col) &&
      !(row >= start && row < end && col >= start && col < end);

    let d = "";
    for (let row = 0; row < count; row++) {
      let col = 0;
      while (col < count) {
        if (!isDark(row, col)) {
          col++;
          continue;
        }
        const from = col;
        while (col < count && isDark(row, col)) col++;
        d += `M${from} ${row}h${col - from}v1h${from - col}z`;
      }
    }

    return { path: d, count, cutout, start };
  }, [text, errorCorrectionLevel, hasLogo, logoRatio]);

  const total = count + 4;
  const logoSize = Math.max(cutout - 2, 0);
  const logoPosition = start + 3;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={`0 0 ${total} ${total}`}
      role="img"
      className={cn("bg-white text-black", className)}
      {...props}
    >
      <path
        d={path}
        fill="currentColor"
        shapeRendering="crispEdges"
        transform="translate(2 2)"
      />
      {hasLogo && (
        <svg
          x={logoPosition}
          y={logoPosition}
          width={logoSize}
          height={logoSize}
        >
          {children}
        </svg>
      )}
    </svg>
  );
}

export default QrCode;
