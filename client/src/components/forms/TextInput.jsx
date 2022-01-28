import Note from "../parts/Note";

const TextInput = (props) => (
    <div className="my-3">
        <input {...props} className={`border rounded-md px-5 py-2 w-full placeholder-note focus:outline-none focus:border-opacity-0 focus:ring-2 focus:ring-thirdlydark ` + (props.error ? "ring-thirdlydark ring-1 border-opacity-0" : null)} />
        {props.error ? <Note customColor="danger">{props.error}</Note> : null}
    </div>
)

export default TextInput;