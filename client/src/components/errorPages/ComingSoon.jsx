import React from "react";
import { Link } from "react-router-dom";
import Title from "../parts/Title";
import Button from "../parts/Button";
import Spacer from "../parts/Spacer";
import { HomeIcon } from "@heroicons/react/solid";

const ComingSoon = (props) => (
  <>
    {console.log(props.error)}
    <div className="text-center">
      <Title>Feature Coming Soon</Title>
      <p className="m-3">We are still working on this exciting new feature! Please check back another time.</p>
      <Spacer />
      <Button icon={HomeIcon}>
        <Link to="/">Back to Home</Link>
      </Button>
    </div>
  </>
);

export default ComingSoon;