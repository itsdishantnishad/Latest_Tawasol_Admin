import * as React from "react";

export interface AsyncState<T> {
  loading: boolean;
  data: T | null;
  error: unknown;
  reload: () => Promise<void>;
  setData: React.Dispatch<React.SetStateAction<T | null>>;
}

export function useAsyncData<T>(
  loader: () => Promise<T>,
  deps: React.DependencyList = []
): AsyncState<T> {
  const [loading, setLoading] = React.useState<boolean>(true);
  const [data, setData] = React.useState<T | null>(null);
  const [error, setError] = React.useState<unknown>(null);

  const load = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await loader();
      setData(result);
    } catch (e) {
      setError(e);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, deps); // eslint-disable-line react-hooks/exhaustive-deps

  React.useEffect(() => {
    void load();
  }, [load]);

  return {
    loading,
    data,
    error,
    reload: load,
    setData
  };
}
