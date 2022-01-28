const SubmitButton = (props) => (
    <button {...props} className="bg-secondarydark hover:shadow duration-300 transform hover:-translate-y-0.5 hover:opacity-90 rounded-md px-5 pt-2 pb-3 my-2 text-white w-full">{props.children}</button>
)

export default SubmitButton;