import Loader from 'components/display/Loader'
import { ListingContext } from 'lib/context/ListingContext'
import { useCallback, useContext, useRef } from 'react'
import SkeletonDiv from './skeltonDiv'

function Listing({
    isTable,
    renderStyle,
    // tableHeaders,
    // isHeader = true,
    listingComponent,
    needPagination = true,
    jobCategory = false,
    ...props
}) {
    const {
        items,
        filter,
        isError,
        loading,
        cacheKey,
        isFetching,
        hasNextPage,
        fetchNextPage,
        isFetchingNextPage,
    } = useContext(ListingContext)

    const lastChatObserver = useRef()

    const lastChatRef = useCallback(
        (node) => {
            if (!needPagination) return
            if (isFetchingNextPage || loading) return
            if (lastChatObserver.current) lastChatObserver.current.disconnect()
            lastChatObserver.current = new IntersectionObserver((entries) => {
                if (entries[0].isIntersecting && hasNextPage) {
                    fetchNextPage()
                }
            })
            if (node) {
                lastChatObserver.current.observe(node)
            }
        },
        [loading, isFetchingNextPage, isFetching, items]
    )

    const hasLoading = loading || isFetching || isFetchingNextPage

    if (isError) {
        return (
            <span className="text-sixty">
                We&apos;re experiencing technical difficulties. Please check
                back later.
            </span>
        )
    }

    return (
        <div className="w-full p-4">
            {/* {headerComponent && isHeader ? (
        <h3 className="text-base font-bold mb-4 w-full">{headerComponent}</h3>
      ) : (
        ''
      )} */}
            <SkeletonDiv
                data={items}
                filter={filter}
                cacheKey={cacheKey}
                loading={hasLoading}
                renderStyle={renderStyle}
                RenderItem={listingComponent}
                isFetching={isFetching}
                {...props}
            />
            {needPagination && hasNextPage && !isTable && (
                <div
                    ref={lastChatRef}
                    className={`w-full ${jobCategory ? '' : 'h-[120px]'} `}
                >
                    {hasLoading && <Loader />}
                </div>
            )}
        </div>
    )
}
export default Listing
