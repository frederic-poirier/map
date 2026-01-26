import { Route, Router } from "@solidjs/router";
import Login from "./pages/Login";
import Home from "./pages/Home";
import AuthGate from "./components/AuthGate";
import Map from "./Map";

export default function App() {
  return (
    <Router>
      <Route path="/login" component={Login} />
      <Route
        path="/"
        component={(props) => (
          <AuthGate>
            <Map />
            {props.children}
          </AuthGate>
        )}
      >
        <Route path="/" component={Home} />
        <Route path="/map" component={Home} />
      </Route>
    </Router>
  );
}
