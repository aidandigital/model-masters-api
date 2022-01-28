const SmallTitle = (props) => (
    <h1 {...props} className="font-serif inline-block text-xl py-3 md:text-3xl md:py-4 xl:py-5 tracking-normal text-black font-bold">{props.children}</h1>
)

export default SmallTitle;