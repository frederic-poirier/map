import { Router, Route } from '@solidjs/router';
import Layout from './component/Layout';
import Home from './pages/Home';

export default function App() {
  return (
    <Router root={Layout}>
      <Route path="/" component={Home} />
    </Router>
  );
}
