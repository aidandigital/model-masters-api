import Row from "../parts/Row";
import Column from "../parts/Column";
import Section from "../parts/Section";
import Title from "../parts/Title";
import { Link } from "react-router-dom";
import Image from "../parts/Image";
import UserLink from "../parts/UserLink";
import Header from "../parts/Header";
import Footer from "../parts/Footer";

const Models = (props) => (
  <>
    <Header />
    <Section fullHeight={true}>
      <Title color="black">All Models</Title>
      {props.data.map((model, i) => (
        <Column key={i}>
            <Row>
              <div className="text-center mb-1">
                <Link to={"/model/" + model._id}>
                  <Image parentId={model._id} imageName={model.thumbnail} isThumbnail={true} />
                  <p className="mt-5 font-bold mb-3 text-xl font-serif hover:text-primarydark duration-200">{model.name}</p>
                </Link>
                  {model.type} by<UserLink _id={model.user._id} name={model.user.name} />
              </div>
            </Row>
        </Column>
      ))}
    </Section>
    <Footer />
  </>
);

export default Models;
