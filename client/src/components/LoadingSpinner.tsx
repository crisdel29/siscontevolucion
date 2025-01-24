import { Loader2 } from "lucide-react";

interface LoadingSpinnerProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

const sizes = {
  sm: "h-4 w-4",
  md: "h-8 w-8",
  lg: "h-12 w-12"
};

export function LoadingSpinner({ className = "", size = "md" }: LoadingSpinnerProps) {
  return (
    <Loader2 
      className={`animate-spin text-primary ${sizes[size]} ${className}`}
    />
  );
}

export function LoadingOverlay() {
  return (
    <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
      <LoadingSpinner size="lg" />
    </div>
  );
}
