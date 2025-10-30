import Loader from 'components/display/Loader'

function SkeletonDiv({
    data,
    title,
    endTitle,
    RenderItem,
    filter = {},
    renderStyle,
    handleCancel,
    handleAction,
    noDataMessage,
    containerStyle,
    handleFunction,
    loading = false,
    hideIfnoData = false,
    notificationStyle = false,
    isFetching = false,
    ...props
}) {
    if (hideIfnoData && data.length === 0) {
        return null
    }
    return (
        <div className={`${containerStyle} w-full SkeletonDiv-component `}>
            {loading && !data ? (
                <div className="bg-white rounded-lg p-5 h-full w-full flex items-center justify-center flex-col">
                    <Loader />
                </div>
            ) : (
                <div className={`${renderStyle}`}>
                    {Array.isArray(data) && data.length === 0 && !isFetching ? (
                        <div className="">
                            <span
                                className={`text-doubleExtraLight text-xs w-full flex p-2 justify-center items-start ${notificationStyle ? 'ml-8' : ' '
                                    }`}
                            >
                                {filter?.query?.length > 0
                                    ? ' No data found'
                                    : noDataMessage}
                            </span>
                        </div>
                    ) : (
                        <>
                            {title && (
                                <h3 className="text-base font-bold mb-4">
                                    {title}
                                </h3>
                            )}

                            {Array.isArray(data) &&
                                data.map((item, i) => {
                                    console.log("SkeletonDiv item:", item)
                                    return (
                                        <RenderItem
                                            index={i}
                                            item={item}
                                            key={item?._id}
                                            handleAction={handleAction}
                                            handleCancel={handleCancel}
                                            isLastItem={data && i === data.length - 1}
                                            {...props}
                                        />
                                    )
                                })}

                            {endTitle && (
                                <div
                                    role="button"
                                    tabIndex={0}
                                    aria-label="button"
                                    onClick={() => {
                                        handleFunction()
                                    }}
                                    onKeyDown={() => {
                                        handleFunction()
                                    }}
                                >
                                    <h3 className="text-base flex font-bold mb-2 text-primary items-center justify-center cursor-pointer">
                                        {endTitle}
                                    </h3>
                                </div>
                            )}
                        </>
                    )}
                </div>
            )}
        </div>
    )
}

export default SkeletonDiv
