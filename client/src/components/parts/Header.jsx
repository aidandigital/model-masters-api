import { useState } from "react";
import { UserContext } from "../../context/UserContext";
import logo from "../imgs/logo.png";
import { Link } from "react-router-dom";
import { UserCircleIcon, PencilAltIcon, LogoutIcon } from "@heroicons/react/outline"
import Dropdown from "./Dropdown";
import axios from "axios";

const Header = () => {
  function logout() {
    axios.get("/api/logout")
    .then(() => window.location.reload())
    .catch(() => alert("An error occured attempting to logout."))
  }

  const [menuOpen, setMenuOpen] = useState(false);
  function toggleMenu() {
    setMenuOpen(!menuOpen)
  }
  
  const links = [
    {name: "People", to: "/users"},
    {name: "How-To", to: "/forum"},
    {name: "All Models", to: "/models"}
  ]

  const dropdownItems = [
    {name: "Edit Account", to: "/editAccount", icon: PencilAltIcon},
    {name: "Logout", icon: LogoutIcon, onClick: logout}
  ]

  return (
    <UserContext.Consumer>
      {(currentUser) => (
        <header className="bg-primarydark px-3 py-3 md:px-7 md:py-5 flex items-center">
          <img src={logo} alt="Logo" width="55" loading="lazy" className="inline-block mr-5" />
          <Link to="/" height="20" className="inline-block text-white text-lg md:text-xl tracking-wide">
            Model Masters
          </Link>
          {/* Medium+ Size Screen Menu */}
          <ul className="ml-auto hidden md:inline-block">
            {links.map((link, i) => (
              <li key={i} className="inline-block text-white font-serif px-5"><Link to={link.to}>{link.name}</Link></li>
            ))}
            <Dropdown items={dropdownItems} opener={() => <li className="inline-block text-white font-serif px-5"><Link to={"/user/" + currentUser._id}><UserCircleIcon className="h-6 inline-block mr-2 relative -top-0.5" />{currentUser.firstName}</Link></li>} />
          </ul>
          {/* Small Size Screen Menu */ }
          <span className="inline-block md:hidden ml-auto">
            <Dropdown requireClick={true} items={[...links, {name: "My Profile", to: "/user/" + currentUser._id}, {name: "Logout", onClick: logout, icon: LogoutIcon}]} opener={() => <li className="inline-block cursor-pointer pl-5 pr-2"><div className="w-10 h-0.5 bg-white mt-1.5"></div><div className="w-10 h-0.5 bg-white mt-1.5"></div><div className="w-10 h-0.5 bg-white mt-1.5"></div></li>} />
          </span>
        </header>
      )}
    </UserContext.Consumer>
  );
};

export default Header;
