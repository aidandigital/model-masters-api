// Dependencies
import React from "react";
import {
  Route,
  Switch,
  BrowserRouter as Router,
} from "react-router-dom";

// Components
import PrivateRoute from "./components/routeControllers/PrivateRoute";
import AuthenticationRoute from "./components/routeControllers/AuthenticationRoute";
import Home from "./components/pages/Home";
import Register from "./components/pages/Register";
import Users from "./components/pages/Users";
import Login from "./components/pages/Login";
import NotFound from "./components/errorPages/404";
import User from "./components/pages/User";
import EditAccount from "./components/pages/EditAccount";
import ComingSoon from "./components/errorPages/ComingSoon";
import AddModel from "./components/pages/AddModel";
import Model from "./components/pages/Model";
import DeleteModel from "./components/pages/DeleteModel";
import Models from "./components/pages/Models";
import ReportIssue from "./components/pages/ReportIssue";

const App = () => {
  function generateKey() {
    // Used to generate a *hopefully* unique key
    // Ensures useEffect is triggered and API is actually called
    return Math.floor(Math.random()*1000000)
  }

  return (
    <Router>
      <Switch>
        <Route path={["/", "/home"]} exact key={generateKey()}>
          <PrivateRoute component={Home} apiRoute="/html/about" />
        </Route>
        <Route path="/login" exact>
          <AuthenticationRoute component={Login} />
        </Route>
        <Route path="/register" exact>
          <AuthenticationRoute component={Register} />
        </Route>
        <Route path="/users" exact key={generateKey()}>
          <PrivateRoute component={Users} apiRoute="/html/users" />
        </Route>
        <Route path="/user/:_id" exact key={generateKey()}>
          {() => <PrivateRoute component={User} apiRoute={"/html/" + window.location.pathname} />}
        </Route>
        {/* !!! The user route requires that the private route is returned by a function in order to ensure it updates each time, and the account editor needs a key */}
        {/* !!! [?] It seems functional components need a key and class components need to be called returned inside a function in the route in order to update themselves when visited by a Link */}
        <Route path="/editAccount" exact key={generateKey()}>
          <PrivateRoute component={EditAccount} apiRoute={"/html/editAccount"} />
        </Route>
        <Route path="/forum" exact>
          <ComingSoon />
        </Route>
        <Route path="/addModel" exact>
          <PrivateRoute component={AddModel} apiRoute={"/html/addModel"} />
        </Route>
        <Route path="/model/:_id" exact key={generateKey()}>
          {() => <PrivateRoute component={Model} apiRoute={"/html/" + window.location.pathname} />}
        </Route>
        <Route path="/deleteModel/:_id" exact key={generateKey()}>
          {() => <PrivateRoute component={DeleteModel} apiRoute={"/html/" + window.location.pathname} />}
        </Route>
        <Route path="/models" exact key={generateKey()}>
          <PrivateRoute component={Models} apiRoute="/html/models" />
        </Route>
        <Route path="/reportIssue" exact key={generateKey()}>
          {() => <PrivateRoute component={ReportIssue} apiRoute="/html/reportIssue" />}
        </Route>
        <Route path="/404" exact>
          <NotFound />
        </Route>
        <Route path="/test" exact>
          {() => (
            <form>
              <input type="submit" />
            </form>
          )}
        </Route>
        <Route component={NotFound} />
      </Switch>
    </Router>
  );
};

export default App;

/*
  const [data, setData] = useState(null);

  useEffect(() => {
    async function dataFetch() {
      const res = await axios.get("/api");
      console.log(res);
      setData(res.data.message);
    }
    dataFetch()
  }, []);
  */
