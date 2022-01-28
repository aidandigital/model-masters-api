import { useState } from "react";

const Image = (props) => {
  let [loaded, setLoaded] = useState(false);

  function doneLoading() {
    setLoaded(true);
  }

  return (
    <>
      <img
        {...props}
        alt={props.alt ? props.alt : "Image"}
        src={"/html/image/" + props.parentId + "." + props.imageName}
        loading="lazy"
        className={"object-cover object-center w-full" + (loaded ? (props.isThumbnail ? " h-50 sm:h-60" : " md:h-screen md:w-5/6 m-auto") : null)}
        onLoad={doneLoading}
      />
      {!loaded ? (
        <div className="p-3">
        <div class={"shadow rounded-md p-4 my-4 w-full flex items-center justify-center" + (props.isThumbnail ? " h-50 sm:h-60" : " h-60 md:h-screen md:w-5/6 m-auto")}>
          <div class="animate-pulse rounded-full bg-secondarybackground mb-3 w-8 h-8 m-2"></div>
          <div class="animate-pulse rounded-full bg-secondarybackground mb-3 w-8 h-8 m-2"></div>
          <div class="animate-pulse rounded-full bg-secondarybackground mb-3 w-8 h-8 m-1"></div>
        </div>
        </div>
      ) : null}
    </>
  );
};

export default Image;
