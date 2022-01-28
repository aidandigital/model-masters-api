const RoleParser = (props) => {
    return (props.children === "master" ? "model-master" : props.children);
}

export default RoleParser;
// Purpose is to parse raw text user role into more understandable terms
// master => model-master