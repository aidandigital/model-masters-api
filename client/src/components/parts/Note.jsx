const Note = (props) => (
    <p className={`text-sm px-1 py-2 text-` + (props.customColor ? props.customColor : "note")}>{props.children}</p>
)

export default Note;