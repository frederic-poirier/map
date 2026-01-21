import { Route, Router } from "@solidjs/router"
import Login from "./Login"
import Home from "./Home"
import Auth from "./Auth"
import AuthGate from "./AuthGate"

export default function App() {

  return (

    <Router>
      <Route path="/login" component={Login} />
      <Route path="/callback" component={Auth} />

      <Route path="/" component={AuthGate}>
        <Route path="/" component={Home} />
      </Route>
    </Router>

  )

}
