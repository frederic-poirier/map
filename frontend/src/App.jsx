import { Router, Route } from "@solidjs/router";
import Layout from "./component/features/layout/Layout";
import Explore from "./pages/Explore";
import Profile from "./pages/Profile";
import Place from "./pages/Place";
import Directions from "./pages/Directions";

export default function App() {
  return (
    <Router root={Layout}>
      <Route path="/" component={Explore} />
      <Route path="/profile" component={() => <Profile />} />
      <Route path="/place/:id" component={Place} />
      <Route path="/directions" component={Directions} />
    </Router>
  );
}
