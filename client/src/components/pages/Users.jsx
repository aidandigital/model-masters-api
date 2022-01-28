import UserRow from "../parts/UserRow";
import Section from "../parts/Section";
import Title from "../parts/Title";
import Subtitle from "../parts/Subtitle";
import Header from "../parts/Header";
import Footer from "../parts/Footer";

const Users = (props) => {
  let content = [];
  const userGroups = Object.keys(props.data);
  userGroups.forEach((group) => {
    content.push(
      <Subtitle>
        {
          group === "masters"
            ? "Model Masters"
            : group.charAt(0).toUpperCase() +
              group.slice(1) /* Capitilize first letter of Group Name */
        }
      </Subtitle>
    );
    props.data[group].forEach((user) => {
      content.push(<UserRow user={user} />);
    });
  });

  return (
    <>
      <Header />
      <Section fullHeight={true}>
        <Title color="black">All Users</Title>
        {content}
      </Section>
      <Footer />
    </>
  );
};

export default Users;
