
import { useState, useEffect } from "react";

export function useListing({
  cacheKey,
  refetchOnMount,
  headerComponent,
  isFilterPayload,
  type,
  dependent,
  getItemsAPI,
  otherParams,
  enabled,
  queryOptions,
  resultsKey = "data",
}) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const response = await getItemsAPI(otherParams);


      const extracted = resultsKey ? response[resultsKey] : response;


      setItems(Array.isArray(extracted) ? extracted : []);
    } catch (err) {

      setError(err);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (enabled) {
      fetchItems();
    }
  }, [enabled, dependent]);

  return {
    items,
    loading,
    error,
    refetch: fetchItems,
    headerComponent,
  };
}
