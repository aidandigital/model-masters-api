import { UserContext } from "../../context/UserContext";
import Section from "../parts/Section";
import Badge from "../parts/Badge";
import UserMeta from "../parts/UserMeta";
import UserLink from "../parts/UserLink";
import Button from "../parts/Button";
import { Link } from "react-router-dom";
import SmallTitle from "../parts/SmallTitle";
import Subtitle from "../parts/Subtitle";
import ImageSlider from "../parts/ImageSlider";
import { LinkIcon, TrashIcon } from "@heroicons/react/outline";
import Spacer from "../parts/Spacer";
import Header from "../parts/Header";
import Footer from "../parts/Footer";

const Model = (props) => {
    console.log(props.data)
  return (
    <UserContext.Consumer>
      {(currentUser) => (
        <>
          <Header />
          <Section background="thirdlybackground">
            <div className="inline-block">
              <SmallTitle>{props.data.name}</SmallTitle>
              <div>
                <span className="inline-block">
                  <p>By<UserLink _id={props.data.user._id} name={props.data.user.name} /></p>
                </span>
                <span className="inline-block">
                  <UserMeta>{props.data.user.role}</UserMeta>
                </span>
              </div>
            </div>
            <div className="inline-block m-auto mt-3 lg:float-right md:mx-4 lg:mx-6">
                <Button moreSpacing={true} icon={LinkIcon} onClick={() => {navigator.clipboard.writeText(window.location.href);alert("Link copied to clipboard. (Must be logged in to view)")}}>Copy model link</Button>
              {props.data.user._id === currentUser._id || currentUser.userPermissions === 6 ?
                <>
                    <Link to={"/deleteModel/" + props.data._id}><Button moreSpacing={true} icon={TrashIcon}>Delete</Button></Link> 
                </>
              : null}
            </div>
          </Section>
          <Section>
            <div>
              <ImageSlider parentId={props.data._id} imageNames={props.data.images} />
              <Subtitle>About</Subtitle>
              Type: <Badge>{props.data.type}</Badge>
              <Spacer height="5" />
              <p>Completed in {props.data.completionMonth} of {props.data.completionYear}</p>
              <Spacer />
              <p>{props.data.about}</p>
              {props.data.facts.length > 0 && props.data.facts[0] !== "" ? 
              <>
                <Subtitle>Fun Facts</Subtitle>
                <ul class="list-inside list-disc ml-6">
                  {props.data.facts.map((fact, i) => (
                      <li key={i}>{fact}</li>
                  )) }
                </ul>
              </>
              : null}
            </div>
            <Spacer />
          </Section>
          <Footer />
        </>
      )}
    </UserContext.Consumer>
  );
};

export default Model;
