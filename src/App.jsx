import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import Cooking from './pages/Cooking';
import Baking from '.pages/Baking';
import MyCookbook from './pages/MyCookbook';

function App() {
  return (
    <Router>
      {/* Navigation Bar */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark mb-4">
        <div className="container">
          <Link className="navbar-brand fw-bold" to="/">RecipeHub</Link>
          <div className="navbar-nav">
            <Link className="nav-link" to="/">Home</Link>
            <Link className="nav-link" to="/">Stove & Pan</Link>
            <Link className="nav-link" to="/">Oven & Bakery</Link>
            <Link className="nav-link" to="/">My Cookbook</Link>
          </div>
        </div>
      </nav>

      {/* Main Screen Views */}
      <div className="container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/cooking" element={<Cooking />} />
          <Route path="/baking" element={<Baking />} />
          <Route path="/my-cookbook" element={<MyCookbook />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;