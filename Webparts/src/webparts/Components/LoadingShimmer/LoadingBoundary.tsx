import * as React from "react";
import { Shimmer, MessageBar, MessageBarType, DefaultButton } from "@fluentui/react";
import { getShimmerElements, type ShimmerPreset } from "./ShimmerPresets";

export interface LoadingBoundaryProps {
  loading: boolean;
  children: React.ReactNode;

  // Optional error handling
  error?: unknown;
  errorMessage?: string;
  onRetry?: () => void;

  // Shimmer options
  preset?: ShimmerPreset;
  count?: number; // how many shimmer blocks to show
  gap?: number;   // px between blocks
  ariaLabel?: string;

  // If you want to disable shimmer and show nothing while loading
  hideWhileLoading?: boolean;
}

function toErrorText(error: unknown): string {
  if (!error) return "";
  if (typeof error === "string") return error;
  if (error instanceof Error) return error.message;
  try {
    return JSON.stringify(error);
  } catch {
    return String(error);
  }
}

export const LoadingBoundary: React.FC<LoadingBoundaryProps> = ({
  loading,
  children,
  error,
  errorMessage,
  onRetry,
  preset = "list",
  count = 3,
  gap = 12,
  ariaLabel = "Loading content",
  hideWhileLoading = false
}) => {
  // Error UI (optional)
  if (!loading && error) {
    const msg = errorMessage || toErrorText(error) || "Something went wrong.";
    return (
      <div>
        <MessageBar messageBarType={MessageBarType.error} isMultiline={true}>
          {msg}
        </MessageBar>

        {onRetry ? (
          <div style={{ marginTop: 10 }}>
            <DefaultButton text="Retry" onClick={onRetry} />
          </div>
        ) : null}
      </div>
    );
  }

  // Loading UI
  if (loading) {
    if (hideWhileLoading) return null;

    const elements = getShimmerElements(preset);
    return (
      <div aria-label={ariaLabel}>
        {Array.from({ length: Math.max(1, count) }).map((_, i) => (
          <div key={i} style={{ marginBottom: i === count - 1 ? 0 : gap }}>
            <Shimmer shimmerElements={elements} />
          </div>
        ))}
      </div>
    );
  }

  // Render actual content
  return <>{children}</>;
};
