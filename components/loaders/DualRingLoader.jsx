import Image from 'next/image'

const DualRingLoader = () => {
    return (
        <>
            {/* <div className="z-[100]"> */}
                <img
                    src="/assets/loaders/dual-ring.svg"
                    alt="loader"
                    width={100}
                    height={100}
                />
            {/* </div> */}
        </>
    )
}

export default DualRingLoader
