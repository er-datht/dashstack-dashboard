import type { ReactNode } from "react";
import { Loader2 } from "lucide-react";

type LoadingWrapperProps = {
  isLoading: boolean;
  loadingText?: string;
  children: ReactNode;
  className?: string;
  loadingClassName?: string;
};

export default function LoadingWrapper({
  isLoading,
  loadingText = "Loading...",
  children,
  className = "",
  loadingClassName = "flex items-center justify-center gap-3 text-gray-600 dark:text-gray-400",
}: LoadingWrapperProps) {
  return (
    <div className={`relative ${className} min-h-dvh`}>
      {/* Content - always rendered */}
      <div className={isLoading ? "opacity-20 pointer-events-none" : ""}>
        {children}
      </div>

      {/* Loading overlay - conditionally rendered */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-surface-dark/80 rounded-lg z-10">
          <div className={loadingClassName}>
            <Loader2 className="w-5 h-5 animate-spin" />
            <p>{loadingText}</p>
          </div>
        </div>
      )}
    </div>
  );
}
