import Link from 'next/link'

const MobileHeaderLinks = ({ href, name, router, setIsNavModalOpen }) => {
    const isActive =
        router.asPath === href ||
        (router.asPath === '/' && href === '/#sell-used-cars')

    return (
        <ul className="flex text-primary items-center justify-center bg-primary py-2">
            <Link
                className={` ${
                    isActive &&
                    'border-b-2  border-secondary text-secondary font-semibold text-xl'
                }`}
                href={href}
                scroll={false}
                onClick={() => setIsNavModalOpen('')}
            >
                {name}
            </Link>
        </ul>
    )
}

export default MobileHeaderLinks
