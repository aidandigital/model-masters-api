const Column = (props) => (
  <div {...props} className="w-full inline-block w-full md:w-1/2 lg:w-1/3 xl:px-6 2xl:px-16 p-3">
    {props.children}
  </div>
);

export default Column;
