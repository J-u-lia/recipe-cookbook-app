// file for the MyCookbook screen - loads saved recipes, displays them, can be removed, ect.

// IMPORTS
import { useState, useEffect } from 'react';    // react hooks to remember information that can change and that react can perform sth as a side effect
import { Bookmark, Heart, Trash2, Eye, PlusCircle } from 'lucide-react';   // icons
import AddRecipeModal from '../components/AddRecipeModal';
import './MyCookbook.css';
import RecipeDetailModal from '../components/RecipeDetailModal';

// React Component
function MyCookbook() {
    // variable to store saved Recipes data and call them - at beginning no recipe saved
    const [savedRecipes, setSavedRecipes] = useState([]);
    // storing which cookbook filter is currently selected
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [cookbookSection, setCookbookSection] = useState('liked');
    // which recipe is curretnly looked at
    const [selectedRecipe, setSelectedRecipe] = useState(null);

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

    // remove all recipes from the page you are in so either all liked recipes or all custom recipes but not both in one go
    const clearCurrentSection = () => {
        const sectionName = cookbookSection === 'liked'
            ? 'liked recipes'
            : 'your recipes';
        // open browser confirmation dialog and ask user if he is sure maybe he didnt mean to - chance to stop it
        if (!window.confirm(`Are you sure you want to remove all ${sectionName}?`)) {
            return;
        }

        const updated = savedRecipes.filter((item) =>
            cookbookSection === 'liked'
                ? item.isCustom
                : !item.isCustom
        );

        setSavedRecipes(updated);
        localStorage.setItem('my_cookbook', JSON.stringify(updated));
        setSelectedRecipe(null);
    };

    // fetch full details from API of recipe when clicking View
    // is async because it takes time so page doesn't freeze 
    const fetchRecipeDetails = async (idMeal) => {
        // Find the recipe in our cookbook using its ID.
        const meal = savedRecipes.find((item) => item.idMeal === idMeal);
        
        // if it is a user-created recipe then load it directly from storage
        if (meal?.isCustom) {
            setSelectedRecipe(meal);
            return;
        }
        // if not then fetch full details from TheMealDB API
        try {
            // try to fetch the data from the URL of the API with lookup.php because of detail
            const response = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${idMeal}`);
            const data = await response.json(); // translate into JS object
            // if there is data for the meal with the ID it fetched the details and there is a first recipe
            if (data.meals && data.meals[0]) {
                // then the first returned meal is the selected recipe, no ingredient is checked, serving size 4 
                setSelectedRecipe(data.meals[0]);
            }
        } catch (error) {
            // if sth goes wrong fetching then display error in console
            console.error('Error fetching recipe details:', error);
        }
    };

    // it is now possible to decide Liked vs My Recipes and then the category filter is applied
    // create new array with recipes that match the selectedd category
    const filteredRecipes = savedRecipes
        .filter((meal) =>
            cookbookSection === 'liked'
                ? !meal.isCustom
                : meal.isCustom
        )
        .filter((meal) => {
            // if user is at category all then every saved recipe is displayed
            if (selectedCategory === 'All') return true;
            // if it is at baking then onl the recipes in baking or desserts
            if (selectedCategory === 'Baking') {
                return (
                    meal.strCategory === 'Dessert' ||
                    meal.strCategory === 'Baking'
                );
            }
            // if it is neither dessert nor baking htne it is cooking
            return (
                meal.strCategory !== 'Dessert' &&
                meal.strCategory !== 'Baking'
            );
        });

    const [showAddModal, setShowAddModal] = useState(false);    // controls if the create custom recipe is visible or not
    const [recipeToEdit, setRecipeToEdit] = useState(null);

    return (
        <div className="my-cookbook-page pb-5">
            {/* HERO BANNER with Bookmark icon, shor header and paragraph */}
            <div className="cookbook-hero p-4 rounded-4 mb-4 shadow-sm">
                <div className="d-flex align-items-center gap-2 fw-bold text-uppercase small mb-1 opacity-90">
                    <Bookmark size={20} />
                    Personal Recipe Collection
                </div>

                <h1 className="fw-bold mb-1">My Cookbook</h1>

                <p className="mb-0 opacity-90">
                    Your saved favorites and your own recipes, all in one place.
                </p>
            </div>
            
            {/* liked/My Recipes buttons */}
            <div className="d-flex justify-content-center mb-4">
                <div className="btn-group bg-light rounded-pill p-1 shadow-sm">
                    <button
                        onClick={() => {
                            setCookbookSection('liked');
                            setSelectedCategory('All');
                        }}
                        className={`btn rounded-pill px-4 py-2 fw-semibold d-flex align-items-center gap-2 ${
                            cookbookSection === 'liked'
                                ? 'cookbook-tab-active'
                                : 'btn-light'
                        }`}
                    >
                        <Heart size={18} />
                        Liked Recipes
                    </button>

                    <button
                        onClick={() => {
                            setCookbookSection('created');
                            setSelectedCategory('All');
                        }}
                        className={`btn rounded-pill px-4 py-2 fw-semibold d-flex align-items-center gap-2 ${
                            cookbookSection === 'created'
                                ? 'cookbook-tab-active'
                                : 'btn-light'
                        }`}
                    >
                        <PlusCircle size={18} />
                        My Recipes
                    </button>
                </div>
            </div>

            {/* CATEGORY FILTER Buttons - one for All, Cooking, Baking */}
            {filteredRecipes.length > 0 && (

                <div className="d-flex align-items-center justify-content-between flex-wrap gap-3 mb-4">

                    <div className="d-flex gap-2">
                        {/* create array with possible button options and give them the react key
                        style them different if selected */}
                        {['All', 'Cooking', 'Baking'].map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                className={`btn rounded-pill px-4 py-2 fw-semibold border-0 ${
                                    selectedCategory === cat
                                        ? 'cookbook-filter-active shadow-sm'
                                        : 'btn-light text-dark'
                                }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                    {/* if user is in section created then there is the Add my recipe button availabke and also the button to clear the recipes this labe changes when in liked*/}
                    <div className="d-flex gap-2">
                        {cookbookSection === 'created' && (
                            <button
                                onClick={() => {
                                    setRecipeToEdit(null);
                                    setShowAddModal(true);
                                }}
                                className="btn cookbook-action rounded-pill px-4 fw-semibold d-flex align-items-center gap-2"
                            >
                                <PlusCircle size={18} />
                                Add a Recipe
                            </button>
                        )}

                        {filteredRecipes.length > 0 && (
                            <button
                                onClick={clearCurrentSection}
                                className="btn btn-outline-danger rounded-pill px-3 fw-semibold d-flex align-items-center gap-2"
                            >
                                <Trash2 size={16} />
                                Clear {cookbookSection === 'liked' ? 'Liked' : 'My'} Recipes
                            </button>
                        )}
                    </div>

                </div>
            )}
        
            {/* EMPTY STATE */}
            {/* if nothing is saved in the filteredRecipes (now this checikng and not savedRecipes anymore because filteredRecipes contains recipes from the currently selected section and categorx) then display this message */}
            {filteredRecipes.length === 0 ? (
                <div className="text-center py-5 bg-light rounded-4 border">
                    {/* different message for liked and my recipes */}
                    {cookbookSection === 'liked' ? (
                        <>
                            <Heart size={48} className="text-muted mb-3 opacity-50" />
                            <h4 className="fw-bold text-dark">
                                No Liked Recipes Yet
                            </h4>
                            <p className="text-muted mb-0">
                                You haven't liked any recipes yet. Click the heart on a recipe to save it here!
                            </p>
                        </>
                    ) : (
                        <>
                            <PlusCircle size={48} className="text-muted mb-3 opacity-50" />
                            <h4 className="fw-bold text-dark">
                                No Recipes Yet
                            </h4>
                            <p className="text-muted mb-3">
                                Create your own recipe and it will appear here.
                            </p>

                            <button
                                onClick={() => {
                                    setRecipeToEdit(null);
                                    setShowAddModal(true);
                                }}
                                className="btn btn-primary rounded-pill px-4 fw-semibold"
                            >
                                <PlusCircle size={18} className="me-1" />
                                Add a Recipe
                            </button>
                        </>
                    )}
                </div>
            ) : (
                /* if the filteredRecipes is not empty then all matching recipes are displayed in teh RECIPE GRID */
                <div className="row g-4">
                    {/* with map for every recipe in filteredRecipe a recipe card is created */}
                    {filteredRecipes.map((meal) => (
                        <div key={meal.idMeal} className="col-sm-6 col-md-4 col-lg-3">
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
                                            <span className="badge cookbook-category-small mb-2">
                                                {meal.strCategory}
                                            </span>
                                        )}

                                        <h5
                                            className="card-title fw-bold text-truncate"
                                            title={meal.strMeal}
                                        >
                                            {meal.strMeal}
                                        </h5>
                                    </div>
                                    
                                    {/* view and remove button */}
                                    <div className="d-flex gap-2 mt-3">
                                        <button
                                            onClick={() => fetchRecipeDetails(meal.idMeal)}
                                            className="btn btn-outline-dark btn-sm fw-semibold flex-grow-1 rounded-3 d-flex align-items-center justify-content-center gap-1"
                                        >       
                                            <Eye size={16} /> View Recipe
                                        </button>

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
                <RecipeDetailModal
                    recipe={selectedRecipe}
                    onClose={() => setSelectedRecipe(null)}
                    recipeType="auto"
                    onRemove={(recipe) => removeRecipe(recipe.idMeal)}
                    onEdit={(recipe) => {
                        setRecipeToEdit(recipe);
                        setSelectedRecipe(null);
                        setShowAddModal(true);
                    }}
                />
            )}

            {/* ADD CUSTOM RECIPE MODAL */}
            <AddRecipeModal
                show={showAddModal}
                onClose={() => {
                    setShowAddModal(false);
                    setRecipeToEdit(null);
                }}
                onSaved={loadCookbook}
                recipeToEdit={recipeToEdit}
            />
        </div>
    );
}

// export component to make it accesible for other files
export default MyCookbook;