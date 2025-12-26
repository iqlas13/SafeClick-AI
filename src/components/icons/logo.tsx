import { cn } from "@/lib/utils";
import Image from "next/image";

export const Logo = ({
  className,
}: {
  className?: string;
}) => (
  <div className={cn("flex items-center gap-4", className)}>
    
    {/* Logo Image */}
    <Image
      src="/icon.png"
      alt="SafeClick AI Logo"
      width={50}
      height={50}
      priority
    />

    {/* Text */}
    <div className="flex flex-col leading-tight">
      <span
        className="font-bold text-xl"
        style={{ fontFamily: "Orbitron, sans-serif" }}
      >
        SafeClick AI
      </span>
      <span
        className="text-xs text-muted-foreground tracking-wide"
        style={{ fontFamily: "Inter, sans-serif" }}
      >
        URL ANALYZER
      </span>
    </div>

  </div>
);
