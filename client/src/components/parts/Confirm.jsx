import { useState } from "react";
import Button from "./Button";
import Popup from "./Popup";
import { XIcon } from "@heroicons/react/solid";

const Confirm = (props) => {
  let DecoyButton = props.decoyButton;
  // Decoy Button: Button that will trigger the popup, does nothing
  let LiveButton = props.liveButton;
  // Live Button: Button with handlers attatched to them that will actually do something when clicked
  const [clicked, setClicked] = useState(false);
  function togglePopup() {
    setClicked(!clicked);
  }
  return !clicked ? (
    <span onClick={togglePopup}>
      <DecoyButton />
    </span>
  ) : (
    <Popup>
      <div className="text-center">
        <button className="right-2 md:right-7 md:top-7 top-2 absolute" onClick={togglePopup}><XIcon className="h-5 md:h-7 inline-block mr-1.5 relative -top-0.5"/></button>
        <div className="m-7 mt-16 md:mt-24 lg:m-32">
          <h3>Are you sure you want to do this?</h3>
          <Button onClick={togglePopup}>No, go back</Button>
          <LiveButton />
        </div>
      </div>
    </Popup>
  );
};

export default Confirm;
