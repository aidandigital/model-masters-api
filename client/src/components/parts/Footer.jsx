import { Link } from "react-router-dom";
import { ExclamationCircleIcon } from "@heroicons/react/outline";

const Footer = () => {
  return (
    <footer className="bg-secondarylight px-3 py-3 md:px-7 md:py-5 items-center">
      <div className="mx-2 my-3">
        <Link to="/" className="text-black text-normal tracking-wide">
          Model Masters, a division of Wire Squad
        </Link>
      </div>
      <div className="mx-2 my-3">
        <Link to="/reportIssue" className="text-black text-normal tracking-wide">
          <ExclamationCircleIcon className="inline-block h-6 mr-2" />
          Report an Issue
        </Link>
      </div>
    </footer>
  );
};

export default Footer;
