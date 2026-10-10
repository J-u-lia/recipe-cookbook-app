// this file is for managing the cooking screen - communicates with REST API and receifing JSON data (stored in react state) displays recipes dynamically
// cateogry filtering, recipe cards, detailed recipe modal, portion scaling, ingredient checklist

// IMPORTS
// with useState React remembers Information that changes, useEffect is for runnging a code when sth happens in the component
import { useState, useEffect } from 'react';
// import icons from lucide react
import { Flame, Eye } from 'lucide-react';
import './Cooking.css'; // import .css file for styling
import { useSearchParams } from 'react-router-dom';
import RecipeDetailModal from '../components/RecipeDetailModal';

// component called Cooking
function Cooking() {
    const [recipes, setRecipes] = useState([]); // react state for current recipe data taht is initially an empty array, with function to change recipes
    const [loading, setLoading] = useState(true);   //  is application currently waiting for API (true) or not (false)
    const [categoryFilter, setCategoryFilter] = useState('Chicken');    // currently selected categroy, with useEffect changing this variable triggers different API request
    const [selectedRecipe, setSelectedRecipe] = useState(null); // stores recipe that user has clicked, at beginning no selected recipe
    
    // variables that extract information directly from browser's URL query strin
    // so when clicking on quicklinks on home they do route listening and then the user gets to the destination - this way the webpage can filter recipes before being even on the page
    const [searchParams, setSearchParams] = useSearchParams();
    const categoryParam = searchParams.get('category'); // search for category e.g., 'vegetarian'
    const tagParam = searchParams.get('tag');   // for tags
    const typeParam = searchParams.get('type'); // for type
    
    // Categories you can select (available from TheMealDB) for cooking dishes
    const categories = ['Chicken', 'Beef', 'Pasta', 'Seafood', 'Vegetarian', 'Side'];

    // Fetch recipes asynchronously from TheMealDB REST API
    // it is async because API requests take time so app won't block
    // query is the value website expects so e.g Chicken
    const fetchRecipes = async (query) => {
        setLoading(true);   // to tell React it is going to load sth
        try {
            // first contact the external API over the URL with await because this needs time
            const response = await fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?c=${query}`);
            // the data from the API is a json (string) we need to convert it into JavaScript object 
            const data = await response.json();
            // takes recipes from API response and puts them into React state - updates state
            // if data.meals doesn't exist or is fals use empty array
            setRecipes(data.meals || []);
        } catch (error) {
            // if sth goes wrong inside the try an error will be printet in console
            console.error('Error fetching recipes:', error);
            setRecipes([]); // reset recipes to empty array
        } finally {
            // runs in both try and catch cases
            // tells that the API request is finished
            setLoading(false);
        }
    };

    // Fetch detailed recipe info for the Modal view
    // the idMead is from TheMealDB becuase it gives each meal an ID
    const fetchRecipeDetails = async (idMeal) => {
        try {
            // get the Data but this time with lookup.php to get details insteat of filter.php
            const response = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${idMeal}`);
            const data = await response.json(); // convert the data
            // check if data.meals exist and if there is a first item in terhe
            if (data.meals && data.meals[0]) {
                // if there is a recipe selected then display the modal
                // so first the selectedRecipe is null but now it is actual recipe
                setSelectedRecipe(data.meals[0]);
            }
        } catch (error) {
            // if it fails display error message
            console.error('Error fetching recipe details:', error);
        }
    };

    // run the fetchRecipes(categoryFilter) when the component loads and always when the categoryFilter changes
    // e.g user first selects filter on Chicken and then it is fetchRecipes("Chicken") but then he changes to Pasta then the categoryFilter changes from Chicken to Pasta so the fetchRecipes() also changes from chicken to Patsa because it is dependend on categoryFilter
    useEffect(() => {
        // checks for first existing parameter in the URL
        const query = categoryParam || tagParam || typeParam;
        if (query) {
            // if it finds one it updates the state to the thing found
            setCategoryFilter(query);
            fetchRecipes(query);
        } else {
            fetchRecipes(categoryFilter);
        }
    }, [categoryParam, tagParam, typeParam]);   // this tells react when to re-run useEffect block because react monitores the values of tese 3 things and everytime the compoonent rerenders the react compares these three values to what they were before rendering and if any of those changed then the function has to be runned again

    // this gets a category (e.g. Beef) and updates the state setCategoryFilter("Beef") and because the categoryFilter changed the useEffect runs
    const handleCategoryChange = (cat) => {
        setCategoryFilter(cat);
        setSearchParams({});
        fetchRecipes(cat);
    };

    // beginn of JSX so React will diplay
    return (
        // main page container with css class and bottom padding
        <div className="cooking-page pb-5">
            {/* Page Header with css class and bootstrapp classes*/}
            <div className="cooking-hero p-4 rounded-4 mb-4 shadow-sm d-flex align-items-center justify-content-between">
                <div>
                    <div className="d-flex align-items-center gap-2 fw-bold text-uppercase small mb-1 opacity-90">
                        {/* dsplays flame icon from lucide in 20 pixle size inside a flexcontainer */}
                        <Flame size={20} /> Stovetop, Sauté & Simmer
                    </div>
                    {/* main heading and little paragraph for discrpition */}
                    <h1 className="fw-bold mb-1">Stove & Pan Recipes</h1>
                    <p className="mb-0 opacity-90">Explore savory dishes prepared with heat, pans, and pots.</p>
                </div>
            </div>

            {/* Category Filter button
            first a flexcontainer */}
            <div className="d-flex flex-wrap gap-2 mb-4">
                {/* iterates over array with categories - React makes out of "CHicken" in the array a Chicken Dish
                    has a button with a key called cat so react knows which item is which
                    when the button is clicked the Categorie is changed
                    they are getting conditional styling:
                        the bootstrap class of the button is dynamically changed with the ? : ternary operator
                        when the condition is fulfilled then the first class is used (after ?)
                        if not then the second class so after : */}
                {categories.map((cat) => (
                    <button
                        key={cat}
                        onClick={() => handleCategoryChange(cat)}
                        className={`btn rounded-pill px-4 py-2 fw-semibold border-0 ${
                            categoryFilter === cat
                                 ? 'cooking-category'
                                 : 'btn-light'
                        }`}
                    >
                        {cat} Dishes
                    </button>
                ))}
            </div>

            {/* RECIPE GRID */}
            {/* this is conditional loading so if the loading is true then it should show the spinner if not then just continue
                first the bootstrap loading spinner is defined
                if it is not loading then check if there are zero recipes if so then display no recipes found for this category
                if it is not loading but there are recipes then it iterates through every recipe returned by the API and for every recipe a card is created */}
            {loading ? (
                <div className="text-center py-5">
                    <div className="spinner-border text-warning" role="status"></div>
                    <p className="mt-2 text-muted">Fetching savory recipes from API...</p>
                </div>
            ) : recipes.length === 0 ? (
                <div className="text-center py-5">
                    <p className="text-muted">No recipes found for this category.</p>
                </div>
            ) : (
                <div className="row g-4">
                    {recipes.map((meal) => (
                        <div key={meal.idMeal} className="col-sm-6 col-md-4 col-lg-3">
                            {/* every meal gets an ID from API which is the key in react
                                responsive columns from bootstrap - if the device is small then there are 2 cards per row, medium 3, large 4 */}
                            <div className="card h-100 shadow-sm recipe-card rounded-4 overflow-hidden">
                                {/* the image url and alt comes from the API - it gives back strMealThumb bzw. strMeal */}
                                <img src={meal.strMealThumb} alt={meal.strMeal} className="card-img-top recipe-card-img" />
                                <div className="card-body d-flex flex-column justify-content-between p-3">
                                    <div>
                                        <span className="badge cooking-category-small mb-2">
                                            {categoryFilter}
                                        </span>
                                        <h5 className="card-title fw-bold text-truncate" title={meal.strMeal}>
                                            {meal.strMeal}
                                        </h5>
                                    </div>
                                    {/* when user presses button the fetchRecipeDetails() function is classed which passes the recipe's ID
                                    so if API says strMeal ="Bolognese" then react diplays Bolognese and then the ID = 123 is get and then fetchRecipeDetails(123) is running which makes an API request which get the Full recipe as Modal */}
                                    <button
                                        onClick={() => fetchRecipeDetails(meal.idMeal)}
                                        className="btn btn-outline-dark btn-sm fw-semibold flex-grow-1 rounded-3 d-flex align-items-center justify-content-center gap-1"
                                    >
                                        <Eye size={16} /> View Recipe
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* RECIPE DETAIL MODAL */}
            {selectedRecipe && (
                <RecipeDetailModal
                    recipe={selectedRecipe}
                    onClose={() => setSelectedRecipe(null)}
                    recipeType="cooking"
                    showSaveButton={true}
                    defaultCategory="Cooking"
                />
            )}
        </div>
    );
}

// export to make it available
export default Cooking;