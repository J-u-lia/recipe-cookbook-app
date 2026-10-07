// helper function that handles the recipe of the day card on the home screen
// IMPORTS
import { useState, useEffect } from 'react';   {/* import useState hook from Reakt - allows component to remember information that can change (e.g what has user typed into search box) */}
import { Sparkles, Globe, Users, Minus, Plus, CheckSquare, Square, Heart } from 'lucide-react'; // icons
import { toggleSaveRecipe, isRecipeSaved, scaleMeasure } from '../utils/cookbookHelper';

// creates the component which is then imported in Home.jsx
function RecipeOfTheDay() {
    // all the state variables needed
    const [recipeOfDay, setRecipeOfDay] = useState(null);   // Stores the recipe we get from TheMealDB
    const [loading, setLoading] = useState(true);       // Controls the loading message/spinner
    const [showModal, setShowModal] = useState(false);    // Controls whether the full recipe modal is open
    const [servings, setServings] = useState(4);    // Stores the number of servings selected by the user
    const [checkedIngredients, setCheckedIngredients] = useState({});    // Stores which ingredients have been checked
    const [, setSavedState] = useState(false);  // Forces the component to update when a recipe is saved/unsaved

    // Get the recipe when the component first loads
    useEffect(() => {
        const fetchRecipeOfDay = async () => {
            // Get today's date in YYYY-MM-DD format, the toISOString converts it into standard format
            // it gives you sth like 2026-10-05, 14:13:00.000Z and then only takes the first part so only the date
            const today = new Date().toISOString().split('T')[0];

            const savedRecipe = localStorage.getItem('recipe_of_the_day');  // Check if already saved a recipe in localStorage
            const savedDate = localStorage.getItem('recipe_of_the_day_date');   // what data was that recipe saved

            // If the saved recipe exists and is from today, use it
            if (savedRecipe && savedDate === today) {
                setRecipeOfDay(JSON.parse(savedRecipe));    // store it as a string
                setLoading(false);  // not loading anymore
                return;
            }

            try {
                // Get a random recipe from TheMealDB with random.php
                const response = await fetch('https://www.themealdb.com/api/json/v1/1/random.php');
                const data = await response.json();     // Convert the response into JavaScript data

                // response should contain meals property and a recipe 
                if (data.meals && data.meals[0]) {
                    const meal = data.meals[0]; // takes first recipe and store it in meal

                    setRecipeOfDay(meal);   // Store the recipe in React state

                    localStorage.setItem('recipe_of_the_day',JSON.stringify(meal)); // Save the recipe in local storage so it can use the same recipe today and make a string
                    localStorage.setItem('recipe_of_the_day_date',today);   // Save today's date
                }
            } catch (error) {
                // Show an error in the browser console if the API fails
                console.error('Error fetching recipe of the day:', error);
            } finally {
                // Stop showing the loading state
                setLoading(false);
            }
        };

        fetchRecipeOfDay(); // call the function
    }, []);

    // Toggle an ingredient between checked and unchecked
    const toggleIngredientCheck = (index) => {
        setCheckedIngredients((prev) => ({
            ...prev,
            [index]: !prev[index],
        }));
    };

    // Get all ingredients and measurements from a recipe
    const getIngredientsList = (recipe) => {
        if (!recipe) return [];

        const list = [];

        // TheMealDB stores ingredients as strIngredient1, strIngredient2, etc.
        for (let i = 1; i <= 20; i++) {
            const ingredient = recipe[`strIngredient${i}`];
            const measure = recipe[`strMeasure${i}`];

            // Only add ingredients that actually contain a value
            if (ingredient && ingredient.trim() !== '') {
            list.push({
                ingredient: ingredient.trim(),
                measure: measure ? measure.trim() : '',
            });
            }
        }

        return list;
    };

    // Toggle save handler that updates both localStorage and local UI state
    const handleToggleSave = () => {
        if (!recipeOfDay) return;
        
        toggleSaveRecipe(recipeOfDay);

        setSavedState((prev) => !prev); // Trigger immediate re-render
    };

    return (
        // with <> function can return multiple things without creating extra <div>    
        <>  
            {/* RECIPE OF THE DAY CARD */}
            <section className="recipe-of-day-section my-5">
                <div className="container">
                    {/* Section heading */}
                    <div className="text-center mb-4">
                        <div className="d-flex justify-content-center align-items-center gap-2">
                            <Sparkles size={28} className="text-warning" />
                            <h2 className="mb-0">
                                Recipe of the Day
                            </h2>
                            <Sparkles size={28} className="text-warning" />
                        </div>
                        <p className="text-muted mt-2">
                            A delicious recipe picked especially for today
                        </p>
                    </div>

                    {/* Loading state */}
                    {loading && (
                        <div className="text-center py-5">
                            <div className="spinner-border text-warning" role="status">
                                <span className="visually-hidden">
                                    Loading...
                                </span>
                            </div>
                            <p className="mt-3 text-muted">
                                Finding today's recipe...
                            </p>
                        </div>
                    )}

                    {/* Recipe card */}
                    {!loading && recipeOfDay && (
                        <div className="card recipe-of-day-card shadow-sm border-0 mx-auto text-center" style={{ maxWidth: '600px' }}>
                            <div className="card-body p-4">

                                <h3 className="card-title mb-3">
                                    {recipeOfDay.strMeal}
                                </h3>

                                <img
                                    src={recipeOfDay.strMealThumb}
                                    alt={recipeOfDay.strMeal}
                                    className="img-fluid rounded-3 mb-3"
                                    style={{ maxHeight: '300px', objectFit: 'contain' }}
                                />

                                <div className="d-flex justify-content-center align-items-center gap-4 mb-4">
                                    {recipeOfDay.strCategory && (
                                        <span className="badge bg-warning text-dark">
                                            {recipeOfDay.strCategory}
                                        </span>
                                    )}

                                    <div className="d-flex align-items-center gap-2">
                                        <Globe size={18} />
                                        <span>
                                            {recipeOfDay.strArea || 'International'}
                                        </span>
                                    </div>
                                </div>

                                <button
                                    className="btn btn-warning px-4"
                                    onClick={() => setShowModal(true)}
                                >
                                    View Recipe
                                </button>

                            </div>
                        </div>
                    )}

                    {/* Error / no recipe state */}
                    {!loading && !recipeOfDay && (
                        <div className="alert alert-danger text-center">
                            Sorry, we couldn't load today's recipe.
                        </div>
                    )}
                </div>
            </section>

            {/* FULL RECIPE MODAL */}
            {showModal && recipeOfDay && (
                <div
                    className="modal show d-block"
                    style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
                >
                    <div className="modal-dialog modal-lg modal-dialog-scrollable modal-dialog-centered">
                        <div className="modal-content rounded-4 border-0 shadow">

                            {/* MODAL HEADER */}
                            <div className="modal-header border-0 bg-light p-4 d-flex justify-content-between align-items-start">
                                <div>
                                    <h3 className="modal-title fw-bold">
                                        {recipeOfDay.strMeal}
                                    </h3>
                                </div>

                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => setShowModal(false)}
                                    aria-label="Close"
                                ></button>
                            </div>

                            {/* MODAL BODY */}
                            <div className="modal-body p-4">

                                {/* IMAGE + SERVING SIZE */}
                                <div className="row g-4 mb-4">

                                    {/* RECIPE IMAGE */}
                                    <div className="col-md-5">
                                        <img
                                            src={recipeOfDay.strMealThumb}
                                            alt={recipeOfDay.strMeal}
                                            className="recipe-detail-img img-fluid rounded-4 shadow-sm w-100"
                                        />

                                        {/* SAVE / LIKE BUTTON */}
                                        <div className="d-flex justify-content-center mt-3">
                                            <button
                                                type="button"
                                                onClick={handleToggleSave}
                                                className={`btn ${
                                                    isRecipeSaved(recipeOfDay.idMeal)
                                                        ? 'btn-danger'
                                                        : 'btn-outline-danger'
                                                } rounded-pill px-4 fw-semibold d-flex align-items-center gap-2`}
                                            >
                                                <Heart
                                                    size={18}
                                                    fill={
                                                        isRecipeSaved(recipeOfDay.idMeal)
                                                            ? 'currentColor'
                                                            : 'none'
                                                    }
                                                />

                                                {isRecipeSaved(recipeOfDay.idMeal)
                                                    ? 'Saved'
                                                    : 'Save'}
                                            </button>
                                        </div>
                                    </div>

                                    {/* SERVINGS + CATEGORY */}
                                    <div className="col-md-7">

                                        {/* SERVING SIZE */}
                                        <div className="p-3 bg-light rounded-4 border mb-3">
                                            <div className="d-flex align-items-center justify-content-between">

                                                <div className="d-flex align-items-center gap-2">
                                                    <Users
                                                        size={20}
                                                        className="text-primary"
                                                    />

                                                    <span className="fw-bold">
                                                        Serving Size:
                                                    </span>
                                                </div>

                                                <div className="d-flex align-items-center gap-2">

                                                    {/* MINUS */}
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setServings((prev) =>
                                                                Math.max(1, prev - 1)
                                                            )
                                                        }
                                                        className="btn btn-outline-dark serving-btn"
                                                    >
                                                        <Minus size={16} />
                                                    </button>

                                                    {/* CURRENT SERVINGS */}
                                                    <span className="fw-bold fs-5 px-2">
                                                        {servings} servings
                                                    </span>

                                                    {/* PLUS */}
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setServings((prev) => prev + 1)
                                                        }
                                                        className="btn btn-outline-dark serving-btn"
                                                    >
                                                        <Plus size={16} />
                                                    </button>

                                                </div>
                                            </div>
                                        </div>

                                        {/* CATEGORY + ORIGIN */}
                                        <div className="d-flex gap-2 flex-wrap">

                                            <span className="badge bg-warning-subtle text-dark px-3 py-2">
                                                Category:{' '}
                                                {recipeOfDay.strCategory || 'General'}
                                            </span>

                                            <span className="badge bg-secondary-subtle text-secondary px-3 py-2">
                                                Origin:{' '}
                                                {recipeOfDay.strArea || 'International'}
                                            </span>

                                        </div>
                                    </div>
                                </div>


                                {/* BAKING / DESSERT CONVERSION CHEAT SHEET */}
                                {(recipeOfDay.strCategory === 'Dessert' ||
                                    recipeOfDay.strCategory === 'Baking') && (
                                    <div className="alert alert-info rounded-4 mb-4">

                                        <h5 className="mb-3 fw-bold">
                                            🍰 Baking Cheat Sheet
                                        </h5>

                                        <div className="row g-3">

                                            <div className="col-12 col-md-4">
                                                <strong>Volume</strong>

                                                <ul className="mb-0 mt-2 ps-3">
                                                    <li>
                                                        1 cup = <strong>240 ml</strong>
                                                    </li>
                                                </ul>
                                            </div>

                                            <div className="col-12 col-md-4">
                                                <strong>Tablespoon</strong>

                                                <ul className="mb-0 mt-2 ps-3">
                                                    <li>
                                                        1 tbsp = <strong>15 ml</strong>
                                                    </li>
                                                </ul>
                                            </div>

                                            <div className="col-12 col-md-4">
                                                <strong>Teaspoon</strong>

                                                <ul className="mb-0 mt-2 ps-3">
                                                    <li>
                                                        1 tsp = <strong>5 ml</strong>
                                                    </li>
                                                </ul>
                                            </div>

                                        </div>
                                    </div>
                                )}


                                {/* INGREDIENTS + INSTRUCTIONS */}
                                <div className="row g-4">

                                    {/* INGREDIENT CHECKLIST */}
                                    <div className="col-md-5">

                                        <h5 className="fw-bold mb-3">
                                            Ingredients Checklist
                                        </h5>

                                        <ul className="list-group list-group-flush mb-4">

                                            {getIngredientsList(recipeOfDay).map(
                                                (item, index) => {

                                                    const displayMeasure = scaleMeasure(
                                                        item.measure,
                                                        servings,
                                                        4
                                                    );

                                                    return (
                                                        <li
                                                            key={index}
                                                            onClick={() =>
                                                                toggleIngredientCheck(index)
                                                            }
                                                            className="list-group-item d-flex align-items-center gap-3 border-0 py-2 px-0 bg-transparent"
                                                            style={{ cursor: 'pointer' }}
                                                        >

                                                            {/* CHECKBOX */}
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

                                                            {/* INGREDIENT */}
                                                            <span
                                                                className={
                                                                    checkedIngredients[index]
                                                                        ? 'text-decoration-line-through text-muted'
                                                                        : ''
                                                                }
                                                            >
                                                                <strong>
                                                                    {displayMeasure}
                                                                </strong>{' '}
                                                                {item.ingredient}
                                                            </span>

                                                        </li>
                                                    );
                                                }
                                            )}

                                        </ul>

                                    </div>


                                    {/* INSTRUCTIONS */}
                                    <div className="col-md-7">

                                        <h5 className="fw-bold mb-3">
                                            Instructions
                                        </h5>

                                        <p
                                            className="text-secondary lh-lg"
                                            style={{ whiteSpace: 'pre-line' }}
                                        >
                                            {recipeOfDay.strInstructions}
                                        </p>

                                    </div>

                                </div>

                            </div>


                            {/* MODAL FOOTER */}
                            <div className="modal-footer border-0 bg-light p-3 d-flex justify-content-end">

                                <button
                                    type="button"
                                    className="btn btn-secondary px-4 fw-semibold rounded-3"
                                    onClick={() => setShowModal(false)}
                                >
                                    Close
                                </button>

                            </div>

                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default RecipeOfTheDay;