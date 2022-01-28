const TinyLoader = (props) => {
    const style = {
        border: "3px solid transparent",
        borderTop: "3px solid gray",
    }

    return (
    <div style={style} className="w-8 h-8 rounded-full animate-spin"></div>
    )
}

export default TinyLoader;