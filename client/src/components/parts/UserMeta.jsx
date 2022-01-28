const UserMeta = (props) => (
  <span className="text-note mx-1">
    [
    <span
      style={{
        WebkitUserSelect: "all" /* For Safari */,
        userSelect: "all",
      }}
    >
      {props.children}
    </span>
    ]
  </span>
);

export default UserMeta;
