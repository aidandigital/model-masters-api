const Section = (props) => {
    return <div className={"px-6 py-3 md:px-16 xl:px-16 xl:py-7 bg-" + (props.background ? props.background : "white") + (props.fullHeight ? " min-h-screen" : "")}>{props.children}</div>;
}

export default Section;