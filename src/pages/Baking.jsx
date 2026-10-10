// follows similar strucutr to cooking screen
//IMPORTS
import { useState, useEffect } from 'react';    // import again useState and useEffect the react hooks
import { Cake, Eye } from 'lucide-react';  // icons from lucide
import './Baking.css';  // style sheet
import { useSearchParams } from 'react-router-dom';
import RecipeDetailModal from '../components/RecipeDetailModal';

// creating the React component Baking which can be displayed
function Baking() {
    // create the states again
    const [recipes, setRecipes] = useState([]); // make an array for recipes
    const [loading, setLoading] = useState(true);   // variable that stores if expecting an API request or not
    const [categoryFilter, setCategoryFilter] = useState('Dessert');    //set the currently selected category to Dessert, if user then clicks Breakfast then it is breakfast, if this changes a different API request is casued
    const [selectedRecipe, setSelectedRecipe] = useState(null); // remembers which recipe the user has opend, at the beginning no recipe opend
    
    const [searchParams] = useSearchParams();
    const categoryParam = searchParams.get('category');
    const tagParam = searchParams.get('tag');
    const typeParam = searchParams.get('type');
    
    const categories = ['Dessert', 'Breakfast', 'Side'];    // the different categories to choose from from the TheMealDB

    // asynchronous function to get the data the TheMealDB API provides for the selected category
    const fetchBakingRecipes = async (category) => {
        // it is loading to this is true
        setLoading(true);
        try {
            // get the data from the URL with the query parameter at the end to automatically put the right category in the link
            const response = await fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?c=${category}`);
            // convert the data provided from JSOn into JS object
            const data = await response.json();
            // use the data.meals if exist if not use empty array
            setRecipes(data.meals || []);   // the recipes are stored in react state
        } catch (error) {
            // if fetching goes wrong diplay error in console
            console.error('Error fetching baking recipes:', error);
            setRecipes([]);
        } finally {
            // eitherway set the loading to false again, either finished loading or didn't even start
            setLoading(false);
        }
    };

    // now the recipe details has to be fetched for each meal (everyone got an ID)
    const fetchRecipeDetails = async (idMeal) => {
        try {
            // fetch the data from the URL now it is lookup.php again so the details
            const response = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${idMeal}`);
            const data = await response.json(); // convert JSON in JS object
            // if the AP response contains a meal array and if this array atleast has one recipe
            if (data.meals && data.meals[0]) {
                // then store the selected recipe in the stateto get visible
                setSelectedRecipe(data.meals[0]);
            }
        } catch (error) {
            // if fetching fails display error message
            console.error('Error fetching details:', error);
        }
    };

    // everytime the categoryFilter changes run this code - means everytime the user clicks on a new category the data from this categroy has to be fetched
    useEffect(() => {
        const query = categoryParam || tagParam || typeParam;
        if (query) {
            setCategoryFilter(query);
        }
    }, [categoryParam, tagParam, typeParam]);

    useEffect(() => {   // fetch the recipes when category filter state canges
        fetchBakingRecipes(categoryFilter);
    }, [categoryFilter]);


    // UI that this component should display
    return (
        // an outer container for the page with css style and padding at bottom
        <div className="baking-page pb-5">
            {/* HERO BANNER with the icon cake and a little heading and text*/}
            <div className="baking-hero p-4 rounded-4 mb-4 shadow-sm d-flex align-items-center justify-content-between">
                <div>
                    <div className="d-flex align-items-center gap-2 fw-bold text-uppercase small mb-1 opacity-90">
                        <Cake size={20} /> Oven, Pastries & Sweet Treats
                    </div>
                    <h1 className="fw-bold mb-1">Oven & Bakery Recipes</h1>
                    <p className="mb-0 opacity-90">Indulge in artisanal breads, fluffy cakes, cookies, and sweet oven bakes.</p>
                </div>
            </div>

            {/* CATEGORY PILLS
                    react goes through every item of the categorie, makes for every item the key
                    when the button is clicked then the category is getting changed to the one htat is clicked and then the menues in that category are getting dispalyed
                    and also the button that is clicked has a different styling then the buttons that are not
                    the internal API categorys are converted into nicer UI lables that people can better differentiate */}
            <div className="d-flex flex-wrap gap-2 mb-4">
                {categories.map((cat) => (
                    <button
                        key={cat}
                        onClick={() => setCategoryFilter(cat)}
                        className={`btn rounded-pill px-4 py-2 fw-semibold border-0 ${
                            categoryFilter === cat ? 'baking-category shadow-sm' : 'btn-light text-dark'
                        }`}
                    >
                        {cat === 'Dessert' ? 'Sweets & Desserts' : cat === 'Breakfast' ? 'Pancakes & Pastries' : 'Breads & Sides'}
                    </button>
                ))}
            </div>

            {/* RECIPE GRID - this says if the meals are currently loading than display the spinner with the little text
                              if not loading and no recipes to get then display no recipes
                              if not loading but finsihed loading then show the recipe cards */}
            {loading ? (
                <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status"></div>
                    <p className="mt-2 text-muted">Loading fresh bakery recipes...</p>
                </div>
            ) : recipes.length === 0 ? (
                <div className="text-center py-5">
                    <p className="text-muted">No baking recipes found for this category.</p>
                </div>
            ) : (
                <div className="row g-4">
                    {/* each row 4 columns big
                        for every recipe there is a own card created with their own ID thats the key for React
                        depending on which screen size layout is different */}
                    {recipes.map((meal) => (
                        <div key={meal.idMeal} className="col-sm-6 col-md-4 col-lg-3">
                            <div className="card h-100 shadow-sm baking-card rounded-4 overflow-hidden">
                                {/* the image is displayed on top and the link and the alt text comes from API
                                    beneath image there is a text with the category it is in and then the title of the meal
                                    and then a button when it is clicked the recipe detail modal pops up */}
                                <img src={meal.strMealThumb} alt={meal.strMeal} className="card-img-top baking-card-img" />
                                <div className="card-body d-flex flex-column justify-content-between p-3">
                                    <div>
                                        <span className="badge baking-category-small mb-2">
                                            {categoryFilter}
                                        </span>
                                        <h5 className="card-title fw-bold text-truncate" title={meal.strMeal}>
                                            {meal.strMeal}
                                        </h5>
                                    </div>
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

            {/* RECIPE DETAIL MODAL when clicked on the button the user can see the details for that meal
                the category the meal is in, the name of the selected recipe is written first and on the same height a button to close the modul is given
                then the image is again printen with the src and the alt from the API
                next to the picture the Unit converter is statet
                below that the ingredient list is printed with boxes to check - if checked then crossed out if not hten not
                below that the instructions how to make that meal are written */}
            {selectedRecipe && (
                <RecipeDetailModal
                    recipe={selectedRecipe}
                    onClose={() => setSelectedRecipe(null)}
                    recipeType="baking"
                    showSaveButton={true}
                    defaultCategory="Baking"
                />
            )}
        </div>
    );
}

// export the component to reuse in different file
export default Baking;