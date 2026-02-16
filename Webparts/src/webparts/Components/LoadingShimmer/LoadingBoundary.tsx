import * as React from "react";
import { Shimmer, MessageBar, MessageBarType } from "@fluentui/react";
import { getShimmerElements, type ShimmerPreset } from "./ShimmerPresets";

export interface LoadingBoundaryProps {
  loading: boolean;
  children: React.ReactNode;
  error?: unknown;
  errorMessage?: string;
  onRetry?: () => void;
  // Shimmer options
  preset?: ShimmerPreset;
  count?: number;
  gap?: number; 
  ariaLabel?: string;
  hideWhileLoading?: boolean;
  timeoutMs?: number;
  renderChildrenOnTimeout?: boolean;
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
  preset = "list",
  count = 3,
  gap = 12,
  ariaLabel = "Loading content",
  hideWhileLoading = false,
  timeoutMs = 10000,
  renderChildrenOnTimeout = false
}) => {
  const [timedOut, setTimedOut] = React.useState(false);

  React.useEffect(() => {
    if (!loading) {
      setTimedOut(false);
      return;
    }

    const timer = setTimeout(() => {
      console.error(`LoadingBoundary timeout after ${timeoutMs}ms`);
      setTimedOut(true);
    }, timeoutMs);

    return () => clearTimeout(timer);
  }, [loading, timeoutMs]);

  if (timedOut) {
    return (
      <div>
        <MessageBar messageBarType={MessageBarType.warning} isMultiline={true}>
          This content is taking longer than expected to load. This might be due to network issues or the content being temporarily unavailable.
        </MessageBar>
        {renderChildrenOnTimeout ? <div style={{ marginTop: 10 }}>{children}</div> : null}
      </div>
    );
  }

  if (!loading && error) {
    const msg = errorMessage || toErrorText(error) || "Something went wrong.";
    return (
      <div>
        <MessageBar messageBarType={MessageBarType.error} isMultiline={true}>
          {msg}
        </MessageBar>
      </div>
    );
  }

  // LOADING UI
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

  return <>{children}</>;
};