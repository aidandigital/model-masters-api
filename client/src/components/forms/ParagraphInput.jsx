import Note from "../parts/Note";

const ParagraphInput = (props) => (
    <div className="mt-3">
        <textarea {...props} className={`border rounded-md px-5 py-2 w-full placeholder-note focus:outline-none focus:border-opacity-0 focus:ring-2 focus:ring-thirdlydark ` + (props.error ? "ring-thirdlydark ring-1 border-opacity-0" : null)}></textarea>
        {props.error ? 
        <div className="-mt-2">
            <Note customColor="danger">{props.error}</Note>
        </div>
         : null}
    </div>
)

export default ParagraphInput;