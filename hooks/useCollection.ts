"use client";
import { useState, useEffect, useCallback } from "react";

export function useCollection<T>(collection: string) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/data/${collection}`);
      if (!res.ok) throw new Error("Failed to load");
      setData(await res.json());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [collection]);

  useEffect(() => { load(); }, [load]);

  const save = useCallback(async (newData: T): Promise<boolean> => {
    try {
      const res = await fetch(`/api/data/${collection}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newData),
      });
      if (!res.ok) throw new Error("Failed to save");
      setData(newData);
      return true;
    } catch {
      return false;
    }
  }, [collection]);

  return { data, loading, error, save, reload: load };
}
