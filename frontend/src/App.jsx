import { Router, Route } from "@solidjs/router";
import Layout from "./component/features/layout/Layout";
import Explore from "./pages/Explore";
import Profile from "./pages/Profile";
import Place from "./pages/Place";
import Directions from "./pages/Directions";
import Login from "./pages/Login";
import { ThemeProvider } from "./context/ThemeContext";

// Minimal wrapper for login page (no auth required)
function LoginLayout(props) {
  return <ThemeProvider>{props.children}</ThemeProvider>;
}

export default function App() {
  return (
    <Router>
      {/* Login route - outside protected layout */}
      <Route path="/login" component={Login} root={LoginLayout} />

      {/* Protected routes - wrapped by Layout with auth */}
      <Route path="/" component={Layout}>
        <Route path="/" component={Explore} />
        <Route path="/profile" component={() => <Profile />} />
        <Route path="/place/:id" component={Place} />
        <Route path="/directions" component={Directions} />
      </Route>
    </Router>
  );
}
