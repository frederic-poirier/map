import { Router, Route } from "@solidjs/router";
import Layout from "./component/layout/Layout";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import Place from "./pages/Place";
import Directions from "./pages/Directions";

export default function App() {
  return (
    <Router root={Layout}>
      <Route path="/" component={Home} />
      <Route path="/search" component={Home} />
      <Route path="/profile" component={() => <Profile />} />
      <Route path="/place/:id" component={Place} />
      <Route path="/directions" component={Directions} />
    </Router>
  );
}
