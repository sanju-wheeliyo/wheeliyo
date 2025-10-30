
import { ListingContext } from "lib/context/ListingContext";
import { useListing } from "./useListing";

export default function ListingContextProvider({
  children,
  cacheKey,
  dependent,
  getItemsAPI,
  otherParams,
  isFilterPayload = false,
  headerComponent,
  refetchOnMount = false,
  enabled = true,
  queryOptions = {
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  },
  type,
}) {
  const props = useListing({
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
    resultsKey: "data",
  });

  return (
    <ListingContext.Provider value={props}>
      {children}
    </ListingContext.Provider>
  );
}
