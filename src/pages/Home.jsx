{/* gives user several ways to start using the APP - search for recipe, click on category shorcuts, choose cooking/baking section, view Recipe of the Day
    React manages interactive parts (e.g. input and navigation)
    Bootstrap provides layout, styling
    lucide-react provides icons
    04.10.26: search doesn't call API yet - prepares search term that navigates user to cooking page
              Recipe of the Day hardcoded Bolognes Recipe but should be dynamic with external API later*/}

{/* IMPORTS */}           
import { useState, useEffect } from 'react';   {/* import useState hook from Reakt - allows component to remember information that can change (e.g what has user typed into search box) */}
import { Link, useNavigate } from 'react-router-dom';   {/* import Link and useNavigate from React Router - creates navigation links without completely reloading page and allows JS code to navigate user to another route */}
import { Flame, Cake, Sparkles, ChefHat, Clock, Globe, Users, Minus, Plus, CheckSquare, Square } from 'lucide-react';    {/* import several icons from lucide-react library - ready-made React components that display icons*/}
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


    // Component State
    const [servings, setServings] = useState(4);
    const [checkedIngredients, setCheckedIngredients] = useState({});


    // variables to store and load the recipe of the day
    const [recipeOfDay, setRecipeOfDay] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const navigate = useNavigate();
    

    useEffect(() => {
        const fetchRecipeOfDay = async () => {
            const today = new Date().toISOString().split('T')[0];
            const savedRecipe = localStorage.getItem('recipe_of_the_day');
            const savedDate = localStorage.getItem('recipe_of_the_day_date');

            if (savedRecipe && savedDate === today) {
                setRecipeOfDay(JSON.parse(savedRecipe));
                setLoading(false);
                return;
            }

            try {
                const response = await fetch('https://www.themealdb.com/api/json/v1/1/random.php');
                const data = await response.json();
                if (data.meals && data.meals[0]) {
                    const meal = data.meals[0];
                    setRecipeOfDay(meal);
                    localStorage.setItem('recipe_of_the_day', JSON.stringify(meal));
                    localStorage.setItem('recipe_of_the_day_date', today);
                }
            } catch (error) {
                console.error('Error fetching recipe of the day:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchRecipeOfDay();
    }, []);

    const selectedRecipe = recipeOfDay;

    // Toggle Checklist Item
    const toggleIngredientCheck = (index) => {
        setCheckedIngredients((prev) => ({
            ...prev,
            [index]: !prev[index],
        }));
    };

    // Helper to Extract Ingredients List
    const getIngredientsList = (recipe) => {
        if (!recipe) return [];
        const list = [];
        for (let i = 1; i <= 20; i++) {
            const ingredient = recipe[`strIngredient${i}`];
            const measure = recipe[`strMeasure${i}`];
            if (ingredient && ingredient.trim() !== '') {
                list.push({
                    ingredient: ingredient.trim(),
                    measure: measure ? measure.trim() : '',
                });
            }
        }
        return list;
    };

    // Extract non-empty ingredients and measurements from TheMealDB object
    const getIngredients = (meal) => {
        if (!meal) return [];
        const ingredients = [];
        for (let i = 1; i <= 20; i++) {
            const ingredient = meal[`strIngredient${i}`];
            const measure = meal[`strMeasure${i}`];
            if (ingredient && ingredient.trim() !== '') {
                ingredients.push({ ingredient, measure });
            }
        }
        return ingredients;
    };

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

        {/* RECIPE OF THE DAY CARD */}
            <div className="p-4 rounded-4 bg-white border shadow-sm">
                <div className="d-flex align-items-center gap-2 mb-3 text-warning fw-bold">
                    <Sparkles size={22} /> Recipe of the Day
                </div>

                {loading ? (
                    <div className="text-center py-4">
                        <div className="spinner-border text-warning" role="status"></div>
                        <p className="small text-muted mt-2">Selecting today's featured dish...</p>
                    </div>
                ) : recipeOfDay ? (
                    <div className="row align-items-center g-4">
                        <div className="col-md-5">
                            <img
                                src={recipeOfDay.strMealThumb}
                                alt={recipeOfDay.strMeal}
                                className="img-fluid rounded-4 shadow-sm w-100 spotlight-img"
                                style={{ maxHeight: '280px', objectFit: 'cover' }}
                            />
                        </div>
                        <div className="col-md-7">
                            <span className="badge bg-warning-subtle text-warning-emphasis mb-2 px-3 py-2 rounded-pill">
                                Featured {recipeOfDay.strCategory} ({recipeOfDay.strArea})
                            </span>
                            
                            <h2 className="fw-bold mb-2">{recipeOfDay.strMeal}</h2>
                            
                            {/* Key Ingredients Preview (Replaces step-by-step instructions) */}
                            <div className="mb-3">
                                <span className="small text-muted fw-bold d-block mb-1">Key Ingredients:</span>
                                <div className="d-flex flex-wrap gap-1">
                                    {getIngredients(recipeOfDay).slice(0, 6).map((item, idx) => (
                                        <span key={idx} className="badge bg-light text-dark border fw-normal">
                                            {item.ingredient}
                                        </span>
                                    ))}
                                    {getIngredients(recipeOfDay).length > 6 && (
                                        <span className="badge bg-light text-secondary border fw-normal">
                                            +{getIngredients(recipeOfDay).length - 6} more
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="d-flex gap-3 mb-4 text-secondary small fw-medium">
                                <span><Clock size={16} className="me-1" />~30-45 mins</span>
                                <span><Globe size={16} className="me-1" />{recipeOfDay.strArea}</span>
                            </div>

                            <button 
                                onClick={() => setShowModal(true)} 
                                className="btn btn-outline-dark fw-semibold rounded-3 px-4"
                            >
                                View Full Recipe
                            </button>
                        </div>
                    </div>
                ) : (
                    <p className="text-muted">Could not load today's recipe.</p>
                )}
            </div>

            {/* FULL RECIPE POPUP MODAL */}
            {showModal && recipeOfDay && (
                <div 
                    className="modal fade show d-block" 
                    tabIndex="-1" 
                    style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
                    onClick={() => setShowModal(false)}
                >
                    <div 
                        className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable"
                        onClick={(e) => e.stopPropagation()} // Prevents closing when clicking inside modal
                    >
                        <div className="modal-content rounded-4 border-0 shadow">
                            <div className="modal-header border-0 pb-0 pe-4 pt-4">
                                <div>
                                    <span className="badge bg-warning-subtle text-warning-emphasis mb-2 px-3 py-2 rounded-pill">
                                        {recipeOfDay.strCategory} • {recipeOfDay.strArea}
                                    </span>
                                    <h3 className="modal-title fw-bold">{recipeOfDay.strMeal}</h3>
                                </div>
                                <button 
                                    type="button" 
                                    className="btn-close" 
                                    onClick={() => setShowModal(false)}
                                    aria-label="Close"
                                ></button>
                            </div>

                            {/* RECIPE DETAILS BODY */}
                            <div className="modal-body p-4">
                                <div className="row g-4 mb-4">
                                    {/* RECIPE IMAGE */}
                                    <div className="col-md-5">
                                        <img
                                            src={selectedRecipe.strMealThumb}
                                            alt={selectedRecipe.strMeal}
                                            className="img-fluid rounded-4 shadow-sm w-100"
                                            style={{ maxHeight: '300px', objectFit: 'cover' }}
                                        />
                                    </div>

                                    {/* CONTROLS & METADATA */}
                                    <div className="col-md-7">
                                        {/* Conditional Baking/Dessert Conversion Helper vs Standard Scaler */}
                                        {['baking', 'dessert'].includes(selectedRecipe.strCategory?.toLowerCase()) ? (
                                            <div className="p-3 bg-light rounded-4 border mb-3">
                                                {/* Portion Scaler */}
                                                <div className="d-flex align-items-center justify-content-between mb-3 pb-3 border-bottom">
                                                    <div className="d-flex align-items-center gap-2">
                                                        <Users size={20} className="text-primary" />
                                                        <span className="fw-bold">Baking Batch Size:</span>
                                                    </div>
                                                    <div className="d-flex align-items-center gap-2">
                                                        <button
                                                            onClick={() => setServings((prev) => Math.max(1, prev - 1))}
                                                            className="btn btn-outline-dark serving-btn"
                                                        >
                                                            <Minus size={16} />
                                                        </button>
                                                        <span className="fw-bold fs-5 px-2">{servings} servings</span>
                                                        <button
                                                            onClick={() => setServings((prev) => prev + 1)}
                                                            className="btn btn-outline-dark serving-btn"
                                                        >
                                                            <Plus size={16} />
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Conversions Cheat Sheet */}
                                                <div className="p-3 bg-white rounded-3 border text-dark small">
                                                    <h6 className="fw-bold mb-2">Kitchen Conversions at a Glance</h6>
                                                    <div className="row g-2">
                                                        <div className="col-12 col-md-6">
                                                            <strong>Weight & Volume:</strong>
                                                            <ul className="mb-0 ps-3">
                                                                <li>1 oz (Weight) = <strong>28.35 g</strong></li>
                                                                <li>1 fl oz (Liquid) = <strong>29.6 ml</strong></li>
                                                                <li>1 Cup (Liquid) = <strong>240 ml</strong></li>
                                                            </ul>
                                                        </div>
                                                        <div className="col-12 col-md-6">
                                                            <strong>1 Cup equals:</strong>
                                                            <ul className="mb-0 ps-3">
                                                                <li>Flour = <strong>125 g</strong></li>
                                                                <li>Sugar = <strong>200 g</strong></li>
                                                                <li>Butter = <strong>225 g</strong></li>
                                                            </ul>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            /* Standard Cooking Portion Scaler */
                                            <div className="p-3 bg-light rounded-4 border mb-3">
                                                <div className="d-flex align-items-center justify-content-between">
                                                    <div className="d-flex align-items-center gap-2">
                                                        <Users size={20} className="text-primary" />
                                                        <span className="fw-bold">Serving Size:</span>
                                                    </div>
                                                    <div className="d-flex align-items-center gap-2">
                                                        <button
                                                            onClick={() => setServings((prev) => Math.max(1, prev - 1))}
                                                            className="btn btn-outline-dark serving-btn"
                                                        >
                                                            <Minus size={16} />
                                                        </button>
                                                        <span className="fw-bold fs-5 px-2">{servings} servings</span>
                                                        <button
                                                            onClick={() => setServings((prev) => prev + 1)}
                                                            className="btn btn-outline-dark serving-btn"
                                                        >
                                                            <Plus size={16} />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* CATEGORY & ORIGIN BADGES */}
                                        <div className="d-flex gap-2">
                                            <span className="badge bg-secondary-subtle text-secondary px-3 py-2 rounded-pill">
                                                Category: {selectedRecipe.strCategory || 'General'}
                                            </span>
                                            <span className="badge bg-secondary-subtle text-secondary px-3 py-2 rounded-pill">
                                                Origin: {selectedRecipe.strArea || 'International'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* INGREDIENTS CHECKLIST */}
                                <h5 className="fw-bold mb-3">Ingredients Checklist</h5>
                                <ul className="list-group list-group-flush mb-4">
                                    {getIngredientsList(selectedRecipe).map((item, index) => (
                                        <li
                                            key={index}
                                            onClick={() => toggleIngredientCheck(index)}
                                            className="list-group-item d-flex align-items-center gap-3 border-0 py-2 px-0 bg-transparent"
                                            style={{ cursor: 'pointer' }}
                                        >
                                            {checkedIngredients[index] ? (
                                                <CheckSquare size={20} className="text-success flex-shrink-0" />
                                            ) : (
                                                <Square size={20} className="text-muted flex-shrink-0" />
                                            )}
                                            <span className={checkedIngredients[index] ? 'text-decoration-line-through text-muted' : ''}>
                                                {item.measure && <strong>{item.measure} </strong>}
                                                {item.ingredient}
                                            </span>
                                        </li>
                                    ))}
                                </ul>

                                {/* INSTRUCTIONS SECTION */}
                                <h5 className="fw-bold mb-3">Instructions</h5>
                                <p className="text-secondary small lh-lg" style={{ whiteSpace: 'pre-line' }}>
                                    {selectedRecipe.strInstructions}
                                </p>
                            </div>

                            <div className="modal-footer border-0 pt-0 pe-4 pb-4">
                                <button 
                                    type="button" 
                                    className="btn btn-secondary rounded-3 px-4" 
                                    onClick={() => setShowModal(false)}
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// export home component to other files
export default Home;
