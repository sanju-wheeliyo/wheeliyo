export default function ListItem({ keyName, value, extraStyles }) {
    return (
        <div className="w-full flex align-top">
            <p className={`plus-jakarta-sans text-sm font-normal w-[150px] ${extraStyles}`}>
                {keyName}
            </p>
            <p className={`plus-jakarta-sans text-sm font-normal ${extraStyles}`}>
                : {value || 'NIL'}
            </p>
        </div>
    )
}
