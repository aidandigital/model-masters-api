import Note from "../parts/Note";
import Spacer from "../parts/Spacer";
import { XIcon, PlusSmIcon } from "@heroicons/react/outline";
import { useState, useEffect } from "react";

// COPYRIGHT Aidan O'Bryan, ALL RIGHTS RESERVED

const TagInput = (props) => {

  let [tags, setTags] = useState([...props.value]); // Makes a copy of the OG value, prevents mutation of parent state
  // Esnure allowed tags doesn't include tags already in the input box:
  let [availableTags, setAvailableTags] = useState(
    props.allowedTags.filter(option => {
        return props.value.indexOf( option ) < 0;
      })
  );
  useEffect(() => { // Call parent state updater when tags state is successfully updated
    props.customStateSetter(tags); // Custom state setter must accept the new input value
  }, [tags]);
  
  function addTag(tag) {
    let index = availableTags.indexOf(tag);
    setAvailableTags((oldAvailableTags) =>
      oldAvailableTags.filter((data, idx) => idx !== index)
    );
    setTags((oldTags) => {
      oldTags.push(tag);
      return oldTags;
    });
  }

  function deleteTag(tag) {
    let index = tags.indexOf(tag);
    setAvailableTags((oldAvailableTags) => {
      oldAvailableTags.push(tag);
      return oldAvailableTags;
    });
    setTags((oldTags) => oldTags.filter((data, i) => i !== index));
  }
  
  function tagBoxChange(e) { // If user types/deletes in tag input box
    if (e.code === "Backspace" && tags.length /* Tags must exist in the box to remove them */) {
        let index = tags.length -1;
        let tag = tags[index];
        setAvailableTags((oldAvailableTags) => {
          oldAvailableTags.push(tag);
          return oldAvailableTags;
        });
        setTags((oldTags) => oldTags.filter((data, i) => i !== index));
    }
  }

  return (
    <div className="my-3">
      <div className={`border overflow-x-scroll rounded-md mt-3 mb-3.5 px-3 py-2 w-full h-14 flex items-center placeholder-note focus:outline-none focus:border-opacity-0 focus:ring-2 focus:ring-thirdlydark ` + (props.error ? "ring-thirdlydark ring-1 border-opacity-0" : null)} >
        {tags.map((tag, i) => (
          <span key={i} className="bg-secondarydark opacity-90 text-white pt-1.5 pb-2 px-3 mr-2 rounded-lg">
            {tag}
            <span onClick={() => deleteTag(tag)}>
              <XIcon className="h-5 inline-block cursor-pointer ml-2 relative -top-0.5" />
            </span>
          </span>
        ))}
        <input type="text" value="" /* No characters can be added */ onChange={() => {/* does nothing, makes react happy we have it though */}} onKeyDown={tagBoxChange} className="focus:outline-none" style={{ width: "100%" }} />
      </div>
      {props.error ? <><Note customColor="danger">{props.error}</Note><Spacer height="3" /></> : null}
      {availableTags.length ? ( // If no leftover tags, don't display this section at all
      <>
      <div className="overflow-x-scroll rounded-md px-3 w-full -mt-2 h-10 flex items-center placeholder-note focus:outline-none focus:border-opacity-0 focus:ring-2 focus:ring-thirdlydark">
        <span><PlusSmIcon className="h-5 -ml-1.5 inline-block mr-2 relative -top-0.5" /></span>
        {availableTags.map((tag, i) => (
          <span key={i} onClick={() => addTag(tag)} className="bg-secondarylight cursor-pointer text-black px-4 pb-1.5 pt-1 mr-2 rounded-md">
            {tag}
          </span>
        ))}
      </div>
      <Note>{props.description}</Note>
      </>
      ) : null}
    </div>
  );
};

export default TagInput;
