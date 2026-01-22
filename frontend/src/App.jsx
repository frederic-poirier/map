import { Route, Router } from "@solidjs/router";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Auth from "./pages/Auth";
import AuthGate from "./components/AuthGate";
import Map from "./Map";

export default function App() {
  return (
    <Router>
      <Route path="/login" component={Login} />
      <Route path="/callback" component={Auth} />

      <Route
        path="/"
        component={(props) => (
          <AuthGate>
            <div class="fixed inset-0">
              <Map />
              <div class="absolute inset-0 pointer-events-none">
                {props.children}
              </div>
            </div>
          </AuthGate>
        )}
      >
        <Route path="/" component={Home} />
        <Route path="/map" component={Home} />
      </Route>
    </Router>
  );
}
