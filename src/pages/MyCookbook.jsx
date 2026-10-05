// file for the MyCookbook screen - loads saved recipes, displays them, can be removed, ect.

// IMPORTS
import { useState, useEffect } from 'react';    // react hooks to remember information that can change and that react can perform sth as a side effect
import { Bookmark, Heart, Trash2, Eye, Users, Minus, Plus, CheckSquare, Square } from 'lucide-react';   // icons
import { toggleSaveRecipe, isRecipeSaved } from '../utils/cookbookHelper';  //helper functions

// React Component
function MyCookbook() {
    // variable to store saved Recipes data and call them - at beginning no recipe saved
    const [savedRecipes, setSavedRecipes] = useState([]);
    // storing which cookbook filter is currently selected
    const [selectedCategory, setSelectedCategory] = useState('All');
    // which recipe is curretnly looked at
    const [selectedRecipe, setSelectedRecipe] = useState(null);

    // Modal state for scaling and checklist
    const [servings, setServings] = useState(4);    // serving amount displayed
    const [checkedIngredients, setCheckedIngredients] = useState({});   // which ingredients have been checked

    // Load saved cookbook from localStorage and put it into react state
    const loadCookbook = () => {
        const stored = localStorage.getItem('my_cookbook'); // checks if sth is stored under key my_cookbook
        if (stored) {
            // if there is then convert the stored JSON into JS array
            try {
                setSavedRecipes(JSON.parse(stored));
            } catch (err) {
                // if it fails then print error message in console
                console.error('Error parsing cookbook from localStorage:', err);
            }
        } else {
            // if there is nothing stored then cookbook is empty array
            setSavedRecipes([]);
        }
    };

    // when someone opens the cookbook the component must be displayed
    useEffect(() => {
        loadCookbook();
    }, []);

    // Remove recipe from cookbook
    const removeRecipe = (idMeal) => {
        // create a new array with every recipe but those whose ID mathces idMeal
        const updated = savedRecipes.filter((item) => item.idMeal !== idMeal);
        setSavedRecipes(updated);   // this gies the cookbook the new array
        localStorage.setItem('my_cookbook', JSON.stringify(updated));   // the local storage needs to be updated
        // if a recipe exist in the modal and is the recipe currently being removed then the modal should close so the meal that is being removed is not showing anymore
        if (selectedRecipe && selectedRecipe.idMeal === idMeal) {
            setSelectedRecipe(null);
        }
    };

    // remove all saved recipes
    const clearCookbook = () => {
        // open browser confirmation dialog and ask user if he is sure maybe he didnt mean to - chance to stop it
        if (window.confirm('Are you sure you want to remove all saved recipes?')) {
            setSavedRecipes([]);    // all recipes removing from react state
            localStorage.removeItem('my_cookbook'); // remve key from local storage
            setSelectedRecipe(null);    // no recipes displayed
        }
    };

    // fetch full details from API of recipe when clicking View
    // is async because it takes time so page doesn't freeze 
    const fetchRecipeDetails = async (idMeal) => {
        try {
            // try to fetch the data from the URL of the API with lookup.php because of detail
            const response = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${idMeal}`);
            const data = await response.json(); // translate into JS object
            // if there is data for the meal with the ID it fetched the details and there is a first recipe
            if (data.meals && data.meals[0]) {
                // then the first returned meal is the selected recipe, no ingredient is checked, serving size 4 
                setSelectedRecipe(data.meals[0]);
                setCheckedIngredients({});
                setServings(4);
            }
        } catch (error) {
            // if sth goes wrong fetching then display error in console
            console.error('Error fetching recipe details:', error);
        }
    };

    // "translate" the ingredients and measurements from the TheMealDB way to display into arrays
    const getIngredientsList = (meal) => {
        const list = [];    // first empty list
        for (let i = 1; i <= 20; i++) { // then iterate through all the 20 input fields
            const ingredient = meal[`strIngredient${i}`];
            const measure = meal[`strMeasure${i}`];
            // check if ingreient actually contains sth so it ignores empty ones
            if (ingredient && ingredient.trim() !== '') {
                list.push({ ingredient, measure: measure || '' });  // add ingredient and measuremnt one by one at the end of array
            }
        }
        return list;
    };

    // when user clicks an ingredient this runs to make ingredient checkbox from uncheked to check and from not crossed through to crossed through
    const toggleIngredientCheck = (index) => {
        // take the previous value of checkedIngredients and copie the existing checked states and then reverse the current value
        setCheckedIngredients((prev) => ({
            ...prev,
            [index]: !prev[index],
        }));
    };

    // create new array with recipes that match the selectedd category
    const filteredRecipes = savedRecipes.filter((meal) => {
        // if user is at category all then every saved recipe is displayed
        if (selectedCategory === 'All') return true;
        // if it is at baking then onl the recipes in baking or desserts
        if (selectedCategory === 'Baking') return meal.strCategory === 'Dessert' || meal.strCategory === 'Baking';
        // if it is neither dessert nor baking htne it is cooking
        return meal.strCategory !== 'Dessert' && meal.strCategory !== 'Baking';
    });

    return (
        <div className="my-cookbook-page pb-5">
            {/* HERO BANNER with Bookmark icon, shor header and paragraph */}
            <div className="bg-primary text-white p-4 rounded-4 mb-4 shadow-sm d-flex align-items-center justify-content-between flex-wrap gap-3">
                <div>
                    <div className="d-flex align-items-center gap-2 fw-bold text-uppercase small mb-1 opacity-90">
                        <Bookmark size={20} /> Personal Recipe Collection
                    </div>
                    <h1 className="fw-bold mb-1">My Cookbook</h1>
                    <p className="mb-0 opacity-90">Your saved favorites, ready to bake and cook anytime.</p>
                </div>
                {/* when there is one recipe displayed then this clear all button appears
                    so you can delete all saved recipes */}
                {savedRecipes.length > 0 && (
                    <button onClick={clearCookbook} className="btn btn-outline-light btn-sm fw-semibold rounded-3">
                        Clear All
                    </button>
                )}
            </div>

            {/* CATEGORY FILTER Buttons - one for All, Cooking, Baking */}
            {savedRecipes.length > 0 && (
                <div className="d-flex gap-2 mb-4">
                    {/* create array with possible button options and give them the react key
                        style them different if selected */}
                    {['All', 'Cooking', 'Baking'].map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`btn rounded-pill px-4 py-2 fw-semibold border-0 ${
                                selectedCategory === cat ? 'btn-primary shadow-sm' : 'btn-light text-dark'
                            }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            )}

            {/* EMPTY STATE */}
            {/* if nothing is saved then display this text */}
            {savedRecipes.length === 0 ? (
                <div className="text-center py-5 bg-light rounded-4 border">
                    <Heart size={48} className="text-muted mb-3 opacity-50" />
                    <h4 className="fw-bold text-dark">Your Cookbook is Empty</h4>
                    <p className="text-muted mb-3">
                        You haven't saved any recipes yet. Click the heart icon on any recipe to save it here!
                    </p>
                </div>
            ) : filteredRecipes.length === 0 ? (
                /* if there are recipes saved but you are in the wrong cateogry then display this text */
                <div className="text-center py-5 bg-light rounded-4 border">
                    <p className="text-muted mb-0">No saved recipes in this category.</p>
                </div>
            ) : (
                /* RECIPE GRID
                        if there are recipes selected then display them the same way as in there own cateory in the responsive grid*/
                <div className="row g-4">
                    {filteredRecipes.map((meal) => (
                        <div key={meal.idMeal} className="col-sm-6 col-md-4 col-lg-3">
                            {/* first the picture (src and alt from API) and beneath that the category and the name of the meal */}
                            <div className="card h-100 shadow-sm rounded-4 overflow-hidden position-relative">
                                <img
                                    src={meal.strMealThumb}
                                    alt={meal.strMeal}
                                    className="card-img-top"
                                    style={{ height: '180px', objectFit: 'cover' }}
                                />
                                <div className="card-body d-flex flex-column justify-content-between p-3">
                                    <div>
                                        {meal.strCategory && (
                                            <span className="badge bg-primary-subtle text-primary-emphasis mb-2">
                                                {meal.strCategory}
                                            </span>
                                        )}
                                        <h5 className="card-title fw-bold text-truncate" title={meal.strMeal}>
                                            {meal.strMeal}
                                        </h5>
                                    </div>
                                    
                                    {/* the details of the recipe should be displayed clicking the view button */}
                                    <div className="d-flex gap-2 mt-3">
                                        <button
                                            onClick={() => fetchRecipeDetails(meal.idMeal)}
                                            className="btn btn-outline-primary btn-sm fw-semibold flex-grow-1 rounded-3 d-flex align-items-center justify-content-center gap-1"
                                        >
                                            <Eye size={16} /> View
                                        </button>
                                        {/* recipes can be removed also individual with the Trash symbol */}
                                        <button
                                            onClick={() => removeRecipe(meal.idMeal)}
                                            className="btn btn-outline-danger btn-sm rounded-3 px-2"
                                            title="Remove from Cookbook"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* RECIPE DETAIL MODAL - looks the same as in cooking or baking screen:
                                                if reicipe is from cooking category then portion scaler
                                                if recipe from baking screen then portion scaler and unit converter shown*/}
            {selectedRecipe && (
                /* header: category, name, trashcan to remove, close button */
                <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
                    <div className="modal-dialog modal-lg modal-dialog-scrollable modal-dialog-centered">
                        <div className="modal-content rounded-4 border-0 shadow">
                            <div className="modal-header border-0 bg-light p-4 d-flex justify-content-between align-items-start">
                                <div>
                                    <h3 className="modal-title fw-bold">{selectedRecipe.strMeal}</h3>
                                </div>
                                <div className="d-flex align-items-center gap-2">
                                    <button
                                        type="button"
                                        className="btn-close"
                                        onClick={() => setSelectedRecipe(null)}
                                    ></button>
                                </div>
                            </div>
                            {/* load the image of the clicked recipe */}
                            <div className="modal-body p-4">
                                <div className="row g-4 mb-4">
                                    <div className="col-md-5">
                                        <img
                                            src={selectedRecipe.strMealThumb}
                                            alt={selectedRecipe.strMeal}
                                            className="img-fluid rounded-4 shadow-sm w-100"
                                        />
                                    </div>
                                    {/* next to image it depends which category the recipe is in but either the portion scaling is displayed or the portion scaling and the unit converter */}
                                    <div className="col-md-7">
                                        {/* check if the category is baking or dessert because then both need to be there */}
                                        {selectedRecipe.strCategory?.toLowerCase() === 'baking' ||
                                         selectedRecipe.strCategory?.toLowerCase() === 'dessert' ? (
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

                                                {/* Conversions */}
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
                                        ) : (
                                            /* if not baking or dessert then the category is cooking so then only the portion scaling */
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
                                        {/* display category and origin from recipe below that */}
                                        <div className="d-flex gap-2">
                                            <span className="badge bg-secondary-subtle text-secondary px-3 py-2">
                                                Category: {selectedRecipe.strCategory || 'General'}
                                            </span>
                                            <span className="badge bg-secondary-subtle text-secondary px-3 py-2">
                                                Origin: {selectedRecipe.strArea || 'International'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* INGREDIENTS CHECKLIST 
                                        first header and then the list
                                        then the logic for making box checked or just normal square*/}
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
                                <h5 className="fw-bold mb-2">Instructions</h5>
                                <p className="text-secondary lh-lg whitespace-pre-line">
                                    {selectedRecipe.strInstructions}
                                </p>
                            </div>
                            
                            {/* close button to make modal disappear */}
                            <div className="modal-footer border-0 bg-light p-3 d-flex justify-content-between">
                                <button
                                    type="button"
                                    className="btn btn-outline-danger px-4 fw-semibold rounded-3 d-flex align-items-center gap-2"
                                    onClick={() => removeRecipe(selectedRecipe.idMeal)}
                                >
                                    <Trash2 size={18} /> Remove
                                </button>

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

// export component to make it accesible for other files
export default MyCookbook;