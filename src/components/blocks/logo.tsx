import { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

interface LogoProps extends HTMLAttributes<SVGElement> {
  className?: string;
  fill?: string;
}

export function Logo({ className, fill, ...props }: LogoProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 36 5"
      height="100%"
      className={cn(`${className}`)}
      {...props}
    >
      <path
        fill={fill ? fill : "currentColor"}
        paintOrder="stroke fill markers"
        d="M2.5 0A2.5 2.5 0 000 2.5V5h1.5V2.5a1 1 0 011-1 1 1 0 011 1V5H5V2.5A2.5 2.5 0 002.5 0zm5.167 0a2.5 2.5 0 00-2.5 2.5 2.5 2.5 0 002.5 2.5 2.5 2.5 0 002.5-2.5 2.5 2.7 0 00-2.5-2.5zm5.166 0a2.5 2.5 0 00-2.5 2.5V5h1.5V2.5a1 1 0 011-1 1 1 0 011 1h1.5a2.5 2.5 0 00-2.5-2.5zM15.5 0v5H18a2.5 2.5 0 002.5-2.5A2.5 2.5 0 0018 0h-1zm7.667 0a2.5 2.5 0 00-2.5 2.5V5h1.5V4h2v1h1.5V2.5a2.5 2.5 0 00-2.5-2.5zm2.666 0v2.5a2.5 2.5 0 002.5 2.5 2.5 2.5 0 002.5-2.5V0h-1.5v2.5a1 1 0 01-1 1 1 1 0 01-1-1V0zM33.5 0A2.5 2.5 0 0031 2.5V5h1.5V2.5a1 1 0 011-1 1 1 0 011 1V5H36V2.5A2.5 2.5 0 0033.5 0zM7.667 1.5a1 1 0 011 1 1 1 0 01-1 1 1 1 0 01-1-1 1 1 0 011-1zM17 1.5h1a1 1 0 011 1 1 1 0 01-1 1h-1zm6.167 0a1 1 0 011 1h-2a1 1 0 011-1z"
      />
    </svg>
  );
}
