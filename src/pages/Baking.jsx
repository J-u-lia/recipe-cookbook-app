// follows similar strucutr to cooking screen
//IMPORTS
import { useState, useEffect } from 'react';    // import again useState and useEffect the react hooks
import { Cake, CheckSquare, Square, Users, Minus, Plus, Heart, Eye } from 'lucide-react';  // icons from lucide
import './Baking.css';  // style sheet
// helper function for cookbook
import { toggleSaveRecipe, isRecipeSaved, scaleMeasure } from '../utils/cookbookHelper';
import { useSearchParams } from 'react-router-dom';

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
    const [, setSearchParams] = useSearchParams();

    // Baking Converter State (Cups to Grams / Oz to Grams) for different scalings used
    const [cupsValue, setCupsValue] = useState(1);  // stores number entered into converter, initially 1 if user changes this then calculation updates 
    const [checkedIngredients, setCheckedIngredients] = useState({});   // stores which ingredient has been checked, so first nothing has been checked so empty

    // for portion scaling
    const [servings, setServings] = useState(4);

    // Local state trigger to force UI re-render when saving/unsaving recipes
    const [, setSavedState] = useState(false);

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
        const query = categoryParam || tagParam || typeParam;
        if (query) {
            setCategoryFilter(query);
        }
    }, [categoryParam, tagParam, typeParam]);

    useEffect(() => {   // fetch the recipes when category filter state canges
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

    // Toggle save handler with state trigger
    const handleToggleSave = () => {
        if (!selectedRecipe) return;

        const recipeToSave = {
            ...selectedRecipe,
            strCategory: selectedRecipe.strCategory || 'Baking'
        };

        toggleSaveRecipe(recipeToSave);
        setSavedState((prev) => !prev); // force immediate re-render
    };


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
                <div
                    className="modal fade show d-block"
                    tabIndex="-1"
                    style={{ backgroundColor: "rgba(0, 0, 0, 0.6)" }}
                    onClick={() => setSelectedRecipe(null)}
                >
                    <div
                        className="modal-dialog modal-xl modal-dialog-scrollable"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <div className="modal-content">

                            {/* Modal Header */}
                            <div className="modal-header">
                                <h4 className="modal-title">
                                    {selectedRecipe.strMeal}
                                </h4>

                                {/* Close button - top right */}
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => setSelectedRecipe(null)}
                                    aria-label="Close"
                                ></button>
                            </div>

                            {/* Modal Body */}
                            <div className="modal-body">

                                {/* Recipe Image */}
                                <img
                                    src={selectedRecipe.strMealThumb}
                                    alt={selectedRecipe.strMeal}
                                    className="img-fluid rounded mb-3 w-100"
                                    style={{
                                        maxHeight: "1000px",
                                        objectFit: "cover",
                                    }}
                                />

                                {/* Save Button - Beneath Image */}
                                <div className="d-flex justify-content-end mb-4">
                                    <button
                                        onClick={handleToggleSave}
                                        className={`btn btn-sm ${
                                            isRecipeSaved(selectedRecipe.idMeal)
                                                ? "btn-danger"
                                                : "btn-outline-danger"
                                        } rounded-pill d-flex align-items-center gap-1 px-3`}
                                    >
                                        <Heart
                                            size={16}
                                            fill={
                                                isRecipeSaved(selectedRecipe.idMeal)
                                                    ? "currentColor"
                                                    : "none"
                                            }
                                        />

                                        {isRecipeSaved(selectedRecipe.idMeal)
                                            ? "Saved"
                                            : "Save"}
                                    </button>
                                </div>

                                {/* Category / Area / Tags */}
                                <div className="d-flex flex-wrap gap-2 mb-4">
                                    {selectedRecipe.strCategory && (
                                        <span className="badge baking-category-small text-dark">
                                            {selectedRecipe.strCategory}
                                        </span>
                                    )}

                                    {selectedRecipe.strArea && (
                                        <span className="badge bg-secondary">
                                            {selectedRecipe.strArea}
                                        </span>
                                    )}

                                    {selectedRecipe.strTags && (
                                        <span className="badge bg-light text-dark border">
                                            {selectedRecipe.strTags}
                                        </span>
                                    )}
                                </div>

                                {/* Baking Batch Size */}
                                <div className="card mb-4">
                                    <div className="card-body">
                                        <div className="d-flex align-items-center justify-content-between">

                                            <div className="d-flex align-items-center gap-2">
                                                <Users size={22} />
                                                <strong>Baking Batch Size</strong>
                                            </div>

                                            <div className="d-flex align-items-center gap-3">
                                                <button
                                                    type="button"
                                                    className="btn btn-outline-secondary btn-sm"
                                                    onClick={() =>
                                                        setServings((prev) =>
                                                            Math.max(1, prev - 1)
                                                        )
                                                    }
                                                >
                                                    <Minus size={18} />
                                                </button>

                                                <strong>{servings}</strong>

                                                <button
                                                    type="button"
                                                    className="btn btn-outline-secondary btn-sm"
                                                    onClick={() =>
                                                        setServings((prev) => prev + 1)
                                                    }
                                                >
                                                    <Plus size={18} />
                                                </button>
                                            </div>
                                        </div>

                                        <small className="text-muted d-block mt-2">
                                            * Quantities scale based on the standard
                                            recipe for 4 servings.
                                        </small>
                                    </div>
                                </div>

                                {/* BAKING CONVERSION CHEAT SHEET */}
                                <div className="alert alert-info mb-4">
                                    <h5 className="mb-3">
                                        Kitchen Conversions at a Glance
                                    </h5>

                                    <div className="row g-3">

                                        {/* Weight & Volume */}
                                        <div className="col-12 col-md-6">
                                            <strong>Weight &amp; Volume</strong>

                                            <ul className="mb-0 mt-2 ps-3">
                                                <li>
                                                    1 oz (Weight) ={" "}
                                                    <strong>28.35 g</strong>
                                                </li>

                                                <li>
                                                    1 fl oz (Liquid) ={" "}
                                                    <strong>29.6 ml</strong>
                                                </li>

                                                <li>
                                                    1 cup (Liquid) ={" "}
                                                    <strong>240 ml</strong>
                                                </li>
                                            </ul>
                                        </div>

                                        {/* Cup Conversions */}
                                        <div className="col-12 col-md-6">
                                            <strong>1 Cup equals</strong>

                                            <ul className="mb-0 mt-2 ps-3">
                                                <li>
                                                    Flour = <strong>125 g</strong>
                                                </li>

                                                <li>
                                                    Sugar = <strong>200 g</strong>
                                                </li>

                                                <li>
                                                    Butter / Cream Cheese ={" "}
                                                    <strong>225–227 g</strong>
                                                </li>
                                            </ul>
                                        </div>

                                    </div>
                                </div>

                                {/* Ingredients */}
                                <div className="mb-5">
                                    <h4 className="mb-3">Ingredients</h4>

                                    <div className="list-group">
                                        {getIngredientsList(selectedRecipe).map(
                                            (item, index) => {
                                                const displayMeasure = scaleMeasure(item.measure, servings, 4);
                                                
                                                return(
                                                    <button
                                                        key={index}
                                                        type="button"
                                                        className="list-group-item list-group-item-action d-flex align-items-center gap-3"
                                                        onClick={() =>
                                                            toggleIngredientCheck(index)
                                                        }
                                                    >
                                                        {checkedIngredients[index] ? (
                                                            <CheckSquare
                                                                size={20}
                                                                className="text-success flex-shrink-0"
                                                            />
                                                        ) : (
                                                            <Square
                                                                size={20}
                                                                className="text-muted flex-shrink-0"
                                                            />
                                                        )}

                                                        <span
                                                            className={
                                                                checkedIngredients[index]
                                                                    ? "text-decoration-line-through text-muted"
                                                                    : ""
                                                            }
                                                        >
                                                            <strong>{displayMeasure}</strong>{" "}
                                                            {item.ingredient}
                                                        </span>
                                                    </button>
                                                );
                                            }
                                        )}
                                    </div>
                                </div>

                                {/* Baking Instructions */}
                                <div>
                                    <h4 className="mb-3">Baking Instructions</h4>

                                    <div
                                        className="instructions"
                                        style={{
                                            whiteSpace: "pre-line",
                                            lineHeight: "1.8",
                                        }}
                                    >
                                        {selectedRecipe.strInstructions}
                                    </div>
                                </div>

                            </div>

                            {/* Modal Footer */}
                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
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