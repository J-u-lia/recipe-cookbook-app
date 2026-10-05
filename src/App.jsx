{/* holds the overall structure of RecipeHub application */}

{/* IMPORTS */}
{/* to use things that are provided by react-router-dom library
  BrowserRouter - enables routing in React application
  Routes - container for different routes to go to 
  Route - defines one URL and what should appear when this URL is pressed
  Link - used for navigation, creates sth that user can click and sth will happen when clicked */}
import { useState } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
{/* Page imports */}
import Home from './pages/Home';
import Cooking from './pages/Cooking';
import Baking from './pages/Baking';
import MyCookbook from './pages/MyCookbook';

{/* a component called App */}
{/* contains applications's overall layout */}
function App() {
  const [selectedRecipeId, setSelectedRecipeId] = useState(null);

  // Handler when user clicks "View" on a card inside MyCookbook
  const handleSelectRecipeFromCookbook = (idMeal) => {
    setSelectedRecipeId(idMeal);
  };
  {/* App function is returning UI as JSX to React */}
  return (
    <BrowserRouter> {/* wraps everything in React BrowserRouter System to keep track which component should be displayed */}
      {/* Navigation Bar with Bootstrap classes: a navigation bar, should expland, dark background, navbar suitable for dark background, margin-bottom level 4*/}
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark mb-4">
        <div className="container">
          {/* clicking RecipeHub gets you to the Home screen */}
          <Link className="navbar-brand fw-bold" to="/">RecipeHub</Link>
          <div className="navbar-nav">
            {/* these are the links in the navigation bar - link tells you where you will go */}
            <Link className="nav-link" to="/">Home</Link>
            <Link className="nav-link" to="/cooking">Stove & Pan</Link>
            <Link className="nav-link" to="/baking">Oven & Bakery</Link>
            <Link className="nav-link" to="/my-cookbook">My Cookbook</Link>
          </div>
        </div>
      </nav>

      {/* Main Screen Views */}
      <div className="container">
        <Routes>
          {/* route tells you what will be displayed there
              so because / is Home https://localhost:5173/ will display Home
              and https://localhost:5173/cooking the Cooking page */}
          <Route path="/" element={<Home />} />
          <Route path="/cooking" element={<Cooking />} />
          <Route path="/baking" element={<Baking />} />
          <Route path="/my-cookbook" element={<MyCookbook onSelectRecipe={handleSelectRecipeFromCookbook} />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

{/* makes the App component available to other files so you can import it and use it somewhere else too */}
export default App;