import React from "react";
import { Link } from "react-router-dom";
import Title from "../parts/Title";
import Button from "../parts/Button";
import Spacer from "../parts/Spacer";
import { HomeIcon } from "@heroicons/react/solid";

const Error = (props) => (
    /* COMING SOON: Report Error */
  <>
    {/* console.log(props.error) */}
    <div className="text-center">
      <Title>An Error Occured</Title>
      <p className="m-3">An uknown error occured. Please try again later.</p>
      <Spacer />
      <Button icon={HomeIcon}>
        <Link to="/">Back to Home</Link>
      </Button>
    </div>
  </>
);

export default Error;
