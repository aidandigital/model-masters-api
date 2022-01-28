import React from "react";
import Button from "../parts/Button";
import Title from "../parts/Title";
import { RefreshIcon } from "@heroicons/react/outline";

const Pending = () => (
  <div className="text-center">
    <Title>Account Pending</Title>
    <p className="m-3">Please be patient while we review your account.</p>
    <a href="/"><Button icon={RefreshIcon}>Check Again</Button></a>
  </div>
);

export default Pending;
