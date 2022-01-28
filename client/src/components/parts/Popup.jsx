const Popup = (props) => (
  <div>
    <div className="fixed w-full h-full inset-0 z-40 bg-secondarybackground bg-opacity-70"></div>
    <div
      {...props}
      className="fixed w-full h-full md:w-10/12 lg:w-8/12 inset-0 z-50 bg-primarybackground shadow"
      style={{
        position: "fixed",
        left: "50%",
        transform: "translate(-50%, 0)",
        overflowY: "scroll", /* Scroll vertically within Popup (for overflow) */
      }}
    >
      {props.children}
    </div>
  </div>
);

export default Popup;
