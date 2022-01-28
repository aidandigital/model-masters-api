import { useState } from "react";
import { Link } from "react-router-dom";

const Dropdown = (props) => {
    const [open, setOpen] = useState(false);
    const Opener = props.opener;

    function closeMenu() {
        setOpen(false);
    }
    function openMenu() {
        setOpen(true);
    }

    if (open) {
        return (
            <span onMouseLeave={props.requireClick ? null : closeMenu} onClick={props.requireClick ? closeMenu : null}>
            <span {...props}><Opener /></span>
            <ul className={"absolute mx-1 right-0 px-4 py-3 rounded-md bg-" + (props.background ? props.background : "primarydark")}>
            {props.items.map((item, i) => {
                let Icon;
                if (item.icon) {
                    Icon = item.icon;
                } else {
                    let nothing = () => <span></span>;
                    Icon = nothing;
                }
                return <Link to={item.to} onClick={item.onClick}><li key={i} style={{wordSpacing: "2px"}} className={"p-2 hover:opacity-80 duration-150 text-" + (props.color ? props.color : "white")}><Icon className="inline-block h-4 inline-block mr-1.5 relative -top-0.5" />{item.name}</li></Link>
            })}
            </ul>
            </span>
        )
    } else {
        return (
            <span {...props} onMouseOver={props.requireClick ? null : openMenu} onClick={props.requireClick ? openMenu : null} onClick={openMenu}><Opener /></span>
        )
    }
}

export default Dropdown;