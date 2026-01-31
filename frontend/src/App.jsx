import { Route, Router } from "@solidjs/router";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Place from "./pages/Place"
import Layout from "./components/Layout";

export default function App() {
  return (
    <Router root={Layout}>
      <Route path="/" component={Home} />
      <Route path="/place/:id" component={Place} />
      <Route path="/login" component={Login} />
    </Router >
  );
}
