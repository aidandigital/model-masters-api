import React from "react";
import { Link } from "react-router-dom";
import Title from "../parts/Title";
import Button from "../parts/Button";
import Spacer from "../parts/Spacer";
import { HomeIcon } from "@heroicons/react/solid";

const Forbidden = () => (
  <>
    <div className="text-center">
      <Title>Restricted Page</Title>
      <p className="m-3">Sorry, this page isn't available to you</p>
      <p>Your account does not have access to this restricted page</p>
      <Spacer />
      <Button icon={HomeIcon}>
        <Link to="/">Back to Home</Link>
      </Button>
    </div>
  </>
);

export default Forbidden;
