{/* gives user several ways to start using the APP - search for recipe, click on category shorcuts, choose cooking/baking section, view Recipe of the Day
    React manages interactive parts (e.g. input and navigation)
    Bootstrap provides layout, styling
    lucide-react provides icons
    04.10.26: search doesn't call API yet - prepares search term that navigates user to cooking page
              Recipe of the Day hardcoded Bolognes Recipe but should be dynamic with external API later*/}

{/* IMPORTS */}           
import { useState } from 'react';   {/* import useState hook from Reakt - allows component to remember information that can change (e.g what has user typed into search box) */}
import { Link, useNavigate } from 'react-router-dom';   {/* import Link and useNavigate from React Router - creates navigation links without completely reloading page and allows JS code to navigate user to another route */}
import { Flame, Cake, Sparkles, ChefHat } from 'lucide-react';    {/* import several icons from lucide-react library - ready-made React components that display icons*/}
import './Home.css';    {/* import the styling file for the Home page*/}
import SearchResults from '../components/SearchResults';

// Home react component - everything returned from this becomes the Home page UI
function Home() {
    // array with category links underneath search bar
    const categories = [
        // the name is text shown to user
        // path is URL navigated to when clicking
        { name: '#🧂 Savory', path: '/cooking' },
        { name: '#🥐 Sweet', path: '/baking' },
        { name: '#🥗 Vegetarian', path: '/cooking?category=vegetarian' },
        { name: '#🌱 Vegan', path: '/cooking?category=vegan' },
        { name: '#🍳 Breakfast', path: '/baking?category=Breakfast' },
        { name: '#🥖 Sides', path: '/baking?category=Side' },
    ];

    // contains JSX that react will display
    return (
        // main class for Home page with styling from .css (home-page) and Bootstrap (pb-5 so padding at the bottom)
        <div className="home-page pb-5">
            {/* Hero Banner - introduction section at top of page*/}
            {/* margin at bottom, subtle drop shadow behind card and search bar */}
            <div className="hero-section text-center text-white mb-5 shadow-sm">
                {/* padding on top and bottom */}
                <div className="py-3">
                    {/* displays the ChefHat icon from lucide-react in 48 pixels, margin at bottom */}
                    <ChefHat size={48} className="mb-3 text-warning" />
                    {/* main heading in bootstrap typography class, bold and margin bottom */}
                    <h1 className="display-4 fw-bold mb-3">DiscoverCulinary Delights</h1>
                    {/* a little text below with lead to make it more prominent, font size, margin at bottom and opacity (Deckkraft)*/}
                    <p className="lead fs-5 mb-4 opacity-90">
                        Discover delicious cooking & baking recipes for every craving.
                    </p>

                    {/* import the function for the search components so they will be renderd here */}
                    <SearchResults />

                    
                    {/* CATEGORY TAGS */}
                    {/* contains shortcut buttons with bootstrap flex container layout with flex items children, line-break, childs centered horizontally on mainaxis, evenly spredded disptance between children, margin top*/}
                    <div className="d-flex flex-wrap justify-content-center gap-2 mt-3">
                        {/* iterates through every object in the categories array and creates a link for every category
                            create a react router link for this category
                            the key gives react a unique identifier for each item in the list
                            to determines where the link goes to
                            bootstrap class for badges, background white, text color dark, no underlining, padding horizontally, padding vertically, corners rounded, little shadow
                            css class
                            and then the cateogry's name is displayed */}
                        {categories.map((cat, index) => (
                            <Link key={index} to={cat.path} className="badge bg-white text-dark text-decoration-none px-3 py-2 rounded-pill shadow-sm category-pill">
                                {cat.name}
                            </Link>
                        ))}
                    </div>
                </div>
            </div>

            {/* NAVIGATION BANNERS */}
            <div className="row g-4 mb-5"> {/* bootstrap row with main navigation cards, row and column distance and margin bottom*/}
            <div className="col-md-6">  {/* bootstrap medium devices 6 columns */}
            <div className="card border-0 shadow-sm rounded-4 h-100 bg-light">  {/* the bootstrap card with no border, sall shadow, roundeed corners, fills all available height */}
                <div className="card-body p-4 d-flex flex-column justify-content-between">  {/* area of content in card, padding, flexcontainer layout, flexcontainer axis is vertical, space between items evenly spreaded */}
                <div>
                    {/* small heading with flame icon and text */}
                    <div className="d-flex align-items-center gap-2 text-warning fw-bold text-uppercase small mb-2">    {/* flexcontainer, items centered, evenly spreaded distance, text in orange/yellow, bold text, all big letters, text size, margin bottom */}
                        <Flame size={20} /> Stove & Pan
                    </div>
                    {/* main title of cooking card */}
                    <h3 className="fw-bold mb-2">Savory Cooking Recipes</h3>
                    {/* little description text */}
                    <p className="text-muted mb-4">
                        Master pan-seared dishes, slow-simmered stews, stir-fries, and hearty stovetop meals.
                    </p>
                </div>
                {/* react router link that takes user to cooking screen */}
                <Link to="/cooking" className="btn btn-warning text-dark fw-bold w-100 py-2 rounded-3">
                    Explore Cooking Recipes →
                </Link>
                </div>
            </div>
            </div>
                        
            {/* BAKING CARD */}
            <div className="col-md-6">  {/* on second half of row (cooking was first 6 columns now baking the rest) */}
            <div className="card border-0 shadow-sm rounded-4 h-100 bg-light">  {/* bootstrap card for baking section */}
                <div className="card-body p-4 d-flex flex-column justify-content-between">  {/* content of card */}
                <div>
                    {/* content of card with cake icon and text */}
                    <div className="d-flex align-items-center gap-2 text-primary fw-bold text-uppercase small mb-2">
                        <Cake size={20} /> Oven & Bakery
                    </div>
                    {/* main heading and little text below */}
                    <h3 className="fw-bold mb-2">Sweet & Oven Bakes</h3>
                    <p className="text-muted mb-4">
                        Indulge in artisanal breads, fluffy cakes, cookies, and perfect oven-baked delights.
                    </p>
                </div>
                {/* react router link that takes user to baking page */}
                <Link to="/baking" className="btn btn-primary fw-bold w-100 py-2 rounded-3">
                    Explore Baking Recipes →
                </Link>
                </div>
            </div>
            </div>
        </div>

        {/* RECIPE OF THE DAY */}
        <div className="p-4 rounded-4 bg-white border shadow-sm">   {/* white section with featured recipe */}
            {/* heading of recipe of the day */}
            <div className="d-flex align-items-center gap-2 mb-3 text-warning fw-bold">
                <Sparkles size={22} /> Recipe of the Day
            </div>
            <div className="row align-items-center g-4">    {/* bootstrap row that contains recipe image on one side and recipe info on other */}
            <div className="col-md-5">  {/* on medium devices 5 columns the picture */}
                <img
                src="https://www.themealdb.com/images/media/meals/ustsqw1468250014.jpg"
                alt="Spaghetti Bolognese"
                className="img-fluid rounded-4 shadow-sm w-100 spotlight-img"
                />
            </div>
            <div className="col-md-7">  {/* on medium devices the last 7 columns the info */}
                {/* a small badge showing hwat kind of recipe */}
                <span className="badge bg-warning-subtle text-warning-emphasis mb-2 px-3 py-2 rounded-pill">
                    Featured Savory Classic
                </span>
                {/* recipe title and desciption text */}
                <h2 className="fw-bold mb-2">Classic Italian Spaghetti Bolognese</h2>
                <p className="text-muted">
                    A rich, slow-simmered meat sauce cooked with fresh garlic, tomatoes, and herbs, served over al dente pasta.
                </p>
                {/* information row with prep time, cooking time, number of servings */}
                <div className="d-flex gap-3 mb-4 text-secondary small fw-medium">
                    <span>⏱️Prep: 15 mins</span>
                    <span>🔥Cook: 45 mins</span>
                    <span>🍽️ 4 Servings</span>
                </div>
                {/* react router link to get to cooking page */}
                <Link to="/cooking" className="btn btn-outline-dark fw-semibold rounded-3 px-4">
                    View Full Recipe
                </Link>
            </div>
            </div>
        </div>
        </div>
    );
}

// export home component to other files
export default Home;
