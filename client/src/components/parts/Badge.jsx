const Badge = (props) => (
    <div className="inline-block m-1 md:m-2 px-5 pt-1 pb-1.5 bg-white text-md md:text-lg rounded-full text-primarydark border-2 border-solid border-secondarydark">{props.children}</div>
)

export default Badge;

/*<div className="inline-block font-sub m-1 md:m-2 px-5 pt-1 pb-1.5 bg-primarydark text-xs md:text-base rounded-full text-white font-semibold border-2 border-solid border-secondarydark">{props.children}</div>*/