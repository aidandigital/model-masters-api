import { useEffect, useState } from "react";
import { Redirect } from "react-router-dom";
import Error from "../errorPages/Error";
import Loading from "../loader/Loading";
import axios from "axios";

function AuthenticationRoute(props) {
  const [loggedInAlready, setLoggedInAlready] = useState(false);
  const [resArrived, setResArrived] = useState(false);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    async function dataFetch() {
      axios.get("/api/checkLoggedInAlready").then((data) => {
        setLoggedInAlready(data.data.loggedInAlready);
        setResArrived(true);
      }).catch((error) => {
        setIsError(error);
      });
    }
    dataFetch();
  }, []);

  const ChildComponent = props.component;

  if (resArrived) {
    if (!loggedInAlready) {
      return <ChildComponent />;
    } else {
      return <Redirect to="/" />;
    }
  } else if (isError) {
    return <Error error={isError} />;
  } else {
    return <Loading />;
  }
}

export default AuthenticationRoute;
