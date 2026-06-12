import { useEffect, useState } from 'react';

export default function useFetch(fetcher, fallback = null) {
  const [data, setData] = useState(fallback);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        setLoading(true);
        const result = await fetcher();
        if (active) {
          // Ensure data is set to the result, or fallback if invalid
          setData(result !== null && result !== undefined ? result : fallback);
        }
      } catch (err) {
        if (active) {
          setError(err);
          // Set data to fallback on error to ensure it's in a valid state
          setData(fallback);
        }
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, [fetcher, fallback]);

  return { data, loading, error };
}
