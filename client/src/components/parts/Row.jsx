const Row = (props) => {
    return <div {...props} className={"rounded-md overflow-hidden my-3 p-2 md:my-5 md:p-3 shadow bg-" + (props.background ? props.background : "white")}>{props.children}</div>
}

export default Row;