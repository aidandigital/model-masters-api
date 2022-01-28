const Button = (props) => {
    let Icon;
    if (props.icon) {
        Icon = props.icon;
    } else {
        let nothing = () => <span></span>;
        Icon = nothing;
    }
    let buttonStyle = `px-3 py-1 pb-1.5 md:px-3.5 md:py-1.5 md:pb-2 ${props.moreSpacing ? "mx-3" :"mx-1"} my-1.5 rounded-lg hover:bg-opacity-70 duration-150`;
    let iconStyle = "hidden md:inline-block h-4 inline-block mr-1.5 relative -top-0.5";
    switch (props.type) {
        case "good":
            return <button {...props} className={"bg-good text-white " + buttonStyle}><Icon className={"text-white " + iconStyle}/>{props.children}</button>;
        case "warning":
            return <button {...props} className={"bg-warning " + buttonStyle}><Icon className={iconStyle}/>{props.children}</button>;
        case "important":
            return <button {...props} className={"bg-secondarydark text-white " + buttonStyle}><Icon className={"text-white " + iconStyle}/>{props.children}</button>;
        case "danger":
            return <button {...props} className={"bg-danger text-white " + buttonStyle}><Icon className={"text-white " + iconStyle}/>{props.children}</button>;
        case "outline":
            return <button {...props} style={{wordSpacing: "2px"}} className={"bg-thirdlybackground border border-solid " + buttonStyle}><Icon className={iconStyle}/>{props.children}</button>;
        default:
            return <button {...props} style={{wordSpacing: "2px"}} className={"bg-secondarylight " + buttonStyle}><Icon className={iconStyle}/>{props.children}</button>;
    }
}

export default Button;