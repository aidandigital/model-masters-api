import React from "react";
import { Link } from "react-router-dom";
import Title from "../parts/Title";
import Button from "../parts/Button";
import Spacer from "../parts/Spacer";
import { HomeIcon } from "@heroicons/react/solid";

const NotFound = () =>
    <div className="text-center">
        <Title>404: Page Not Found</Title>
        <ul class="list-inside list-disc ml-6">
            <li>Make sure your link in the searchbar isn't broken</li>
            <li>Make sure you are logged in</li>
            <li>Keep in mind this page may just be temporarily down.</li>
        </ul>
        <Spacer />
        <Button icon={HomeIcon}><Link to="/">Back to Home</Link></Button>
    </div>;

export default NotFound;