// follows similar strucutr to cooking screen
//IMPORTS
import { useState, useEffect } from 'react';    // import again useState and useEffect the react hooks
import { Cake, Search, Cookie, Sparkles, Scale, CheckSquare, Square, Users, Minus, Plus } from 'lucide-react';  // icons from lucide
import './Baking.css';  // style sheet

// creating the React component Baking which can be displayed
function Baking() {
    // create the states again
    const [recipes, setRecipes] = useState([]); // make an array for recipes
    const [loading, setLoading] = useState(true);   // variable that stores if expecting an API request or not
    const [categoryFilter, setCategoryFilter] = useState('Dessert');    //set the currently selected category to Dessert, if user then clicks Breakfast then it is breakfast, if this changes a different API request is casued
    const [selectedRecipe, setSelectedRecipe] = useState(null); // remembers which recipe the user has opend, at the beginning no recipe opend
    
    // Baking Converter State (Cups to Grams / Oz to Grams) for different scalings used
    const [cupsValue, setCupsValue] = useState(1);  // stores number entered into converter, initially 1 if user changes this then calculation updates 
    const [checkedIngredients, setCheckedIngredients] = useState({});   // stores which ingredient has been checked, so first nothing has been checked so empty

    // for portion scaling
    const [servings, setServings] = useState(4);

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
                setCheckedIngredients({});  // when opening the recipe all ingredients should start unchecked
                setServings(4); // Default setting for serving size
            }
        } catch (error) {
            // if fetching fails display error message
            console.error('Error fetching details:', error);
        }
    };

    // everytime the categoryFilter changes run this code - means everytime the user clicks on a new category the data from this categroy has to be fetched
    useEffect(() => {
        fetchBakingRecipes(categoryFilter);
    }, [categoryFilter]);

    // the ingredient lsit is gotten from one complete meal object from the API because TheMealDB doesn't give ingredients as simple array
    const getIngredientsList = (meal) => {
        const list = [];    // empty list first
        // iterate over the ingreadients from 1 to 20 again
        for (let i = 1; i <= 20; i++) {
            // for every entrance write the property names for the ingredient and the measures
            const ingredient = meal[`strIngredient${i}`];
            const measure = meal[`strMeasure${i}`];
            // if an ingredient exists and it isnt jsut an empty whitespace
            if (ingredient && ingredient.trim() !== '') {
                // add the ingredient to the array with push(), first the ingredient and then the measure but the measure can also be empty if there is no measure
                list.push({ ingredient, measure: measure || '' });
            }
        }
        return list;    // return that list
    };

    // fucntion runs when user clicks an ingredient and then the state is updates (the same as in cooking)
    const toggleIngredientCheck = (index) => {
        // the prev gives the prevous state because i want to keep the existing checked ingredients while changing only one
        setCheckedIngredients((prev) => ({
            ...prev,    // copies all existing properties from prev into new opbject
            [index]: !prev[index],  // takes the current value of this ingredient index and reverses it so if prev[1] = false then it is true now so it can go from unchecked to checked and from checked to unchecked
        }));
    };

    // UI that this component should display
    return (
        // an outer container for the page with css style and padding at bottom
        <div className="baking-page pb-5">
            {/* HERO BANNER with the icon cake and a little heading and text*/}
            <div className="baking-hero text-white p-4 rounded-4 mb-4 shadow-sm d-flex align-items-center justify-content-between">
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
                            categoryFilter === cat ? 'btn-primary shadow-sm' : 'btn-light text-dark'
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
                                        <span className="badge bg-primary-subtle text-primary-emphasis mb-2">
                                            {categoryFilter}
                                        </span>
                                        <h5 className="card-title fw-bold text-truncate" title={meal.strMeal}>
                                            {meal.strMeal}
                                        </h5>
                                    </div>
                                    <button
                                        onClick={() => fetchRecipeDetails(meal.idMeal)}
                                        className="btn btn-outline-primary btn-sm fw-semibold w-100 rounded-3 mt-3"
                                    >
                                        View Recipe & Baking Notes
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
                <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
                    <div className="modal-dialog modal-lg modal-dialog-scrollable modal-dialog-centered">
                        <div className="modal-content rounded-4 border-0 shadow">
                            <div className="modal-header border-0 bg-light p-4">
                                <div>
                                    <span className="badge bg-primary text-white fw-bold mb-2">{categoryFilter}</span>
                                    <h3 className="modal-title fw-bold">{selectedRecipe.strMeal}</h3>
                                </div>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => setSelectedRecipe(null)}
                                ></button>
                            </div>

                            <div className="modal-body p-4">
                                <div className="row g-4 mb-4">
                                    <div className="col-md-5">
                                        <img
                                            src={selectedRecipe.strMealThumb}
                                            alt={selectedRecipe.strMeal}
                                            className="img-fluid rounded-4 shadow-sm w-100"
                                        />
                                    </div>
                                    <div className="col-md-7">
                                        {/* PORTION SIZE SCALING AND UNIT CONVERTER */}
                                        <div className="p-3 bg-light rounded-4 border mb-3">
                                            {/* Portion Scaler (Same as Cooking page) */}
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

                                            <div className="p-3 bg-light rounded-3 border text-dark small">
                                                <h6 className="fw-bold mb-2">Kitchen Conversions at a Glance</h6>
                                                
                                                <div className="row g-2">
                                                    <div className="col-12 col-md-6">
                                                    <strong>Weight & Volume:</strong>
                                                    <ul className="mb-0 ps-3">
                                                        <li>1 oz (Weight) = <strong>28,35 g</strong></li>
                                                        <li>1 fl oz (Liquid) = <strong>29,6 ml</strong></li>
                                                        <li>1 Cup (Liquid) = <strong>240 ml</strong></li>
                                                    </ul>
                                                    </div>
                                                    
                                                    <div className="col-12 col-md-6">
                                                    <strong>1 Cup equals:</strong>
                                                    <ul className="mb-0 ps-3">
                                                        <li>Flour = <strong>125 g</strong></li>
                                                        <li>Sugar = <strong>200 g</strong></li>
                                                        <li>Butter / Cream Cheese = <strong>225–227 g</strong></li>
                                                    </ul>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="d-flex gap-2">
                                            <span className="badge bg-secondary-subtle text-secondary px-3 py-2">
                                                Category: {selectedRecipe.strCategory}
                                            </span>
                                            <span className="badge bg-secondary-subtle text-secondary px-3 py-2">
                                                Origin: {selectedRecipe.strArea}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* INGREDIENTS LIST */}
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
                                                <CheckSquare size={20} className="text-success" />
                                            ) : (
                                                <Square size={20} className="text-muted" />
                                            )}
                                            <span className={checkedIngredients[index] ? 'text-decoration-line-through text-muted' : ''}>
                                                <strong>{item.measure}</strong> {item.ingredient}
                                            </span>
                                        </li>
                                    ))}
                                </ul>

                                {/* INSTRUCTIONS */}
                                <h5 className="fw-bold mb-2">Baking Instructions</h5>
                                <p className="text-secondary lh-lg whitespace-pre-line">
                                    {selectedRecipe.strInstructions}
                                </p>
                            </div>

                            <div className="modal-footer border-0 bg-light p-3">
                                <button
                                    type="button"
                                    className="btn btn-secondary px-4 fw-semibold rounded-3"
                                    onClick={() => setSelectedRecipe(null)}
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

// export the component to reuse in different file
export default Baking;