import "./radio-buttons.css";
import { LockClosedIcon } from "@heroicons/react/outline";

const RadioButton = (props) => {
  if (props.locked) {
    return (
      <label className="option-container block cursor-not-allowed">
        <span className="radio-container"><LockClosedIcon className="md:inline-block h-5 inline-block relative -m-0.5 -top-0.5" /></span>
        <span>{props.description}</span>
      </label>
    );
  } else {
    return (
      <label className="option-container block cursor-pointer">
        <span className="radio-container">
          <label className="radio-button border-primarydark">
            <input {...props} type="radio" />
            <span className="circle bg-primarydark"></span>
          </label>
        </span>
        <span>{props.description}</span>
      </label>
    );
  }
};

export default RadioButton;
