const UserLink = (props) => (
    <span {...props} className="mx-1"><a className="hover:text-secondarydark duration-200" href={"/user/" + props._id}>{props.name}</a></span>
)

export default UserLink;