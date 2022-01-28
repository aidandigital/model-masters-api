const Title = (props) => (
    <h1 {...props} className={"font-serif text-center text-2xl px-2 py-9 md:text-4xl md:py-10 xl:p-10 tracking-normal font-bold text-" + (props.color ? props.color : "secondarydark")}>{props.children}</h1>
)

export default Title;