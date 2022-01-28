import Login from "../pages/Login";

const Message = (props) => {
    // the prop "errType" is used to determine weather a popup of the login screen should appear instead of the message
    if (!props.isSuccess && props.errType === "notloggedin") {
        return <Login isPopup={true} customMessage="Session expired, login to resume where you left off." />;
    } else {
        return (props.children ? (!props.isSuccess ? <div {...props} className="mx-1 mr-2 my-1 text-danger">{props.children}</div> : <div className="mx-1 my-1 text-success" {...props}>{props.children}</div>) : <></>);
    }
}

export default Message;