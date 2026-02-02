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
  
  // ✅ NEW: Timeout configuration (default 10 seconds)
  timeoutMs?: number;
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
  hideWhileLoading = false,
  timeoutMs = 10000 // ✅ NEW: 10 second default timeout
}) => {
  // ✅ NEW: Timeout safety to prevent infinite shimmer
  const [timedOut, setTimedOut] = React.useState(false);

  React.useEffect(() => {
    if (!loading) {
      setTimedOut(false);
      return;
    }

    const timer = setTimeout(() => {
      console.error(`LoadingBoundary timeout after ${timeoutMs}ms - forcing error state`);
      console.error('Component may be stuck in loading state. Check for:');
      console.error('1. API calls that never complete');
      console.error('2. Race conditions in component mounting');
      console.error('3. Data interception issues');
      setTimedOut(true);
    }, timeoutMs);

    return () => clearTimeout(timer);
  }, [loading, timeoutMs]);

  // ✅ NEW: Timeout treated as error with helpful message
  if (timedOut) {
    return (
      <div>
        <MessageBar messageBarType={MessageBarType.warning} isMultiline={true}>
          This content is taking longer than expected to load. This might be due to network issues or the content being temporarily unavailable.
        </MessageBar>

        <div style={{ marginTop: 10 }}>
          {onRetry ? (
            <>
              <DefaultButton text="Retry" onClick={() => {
                setTimedOut(false);
                onRetry();
              }} />
              <DefaultButton 
                text="Reload Page" 
                onClick={() => window.location.reload()} 
                style={{ marginLeft: 8 }}
              />
            </>
          ) : (
            <DefaultButton 
              text="Reload Page" 
              onClick={() => window.location.reload()} 
            />
          )}
        </div>
      </div>
    );
  }

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
