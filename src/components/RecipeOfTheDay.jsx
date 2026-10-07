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
                    className="modal fade show d-block"
                    tabIndex="-1"
                    style={{
                        backgroundColor: 'rgba(0, 0, 0, 0.6)',
                    }}
                    onClick={() => setShowModal(false)}
                >
                    <div className="modal-dialog modal-xl modal-dialog-scrollable" onClick={(event) => event.stopPropagation()}>
                    <div className="modal-content">

                        {/* Modal header */}
                        <div className="modal-header">
                            <h4 className="modal-title">
                                {recipeOfDay.strMeal}
                            </h4>

                            <button
                                type="button"
                                className="btn-close"
                                onClick={() => setShowModal(false)}
                            ></button>
                        </div>

                        {/* Modal body */}
                        <div className="modal-body">

                            {/* Recipe image */}
                            <img
                                src={recipeOfDay.strMealThumb}
                                alt={recipeOfDay.strMeal}
                                className="img-fluid rounded mb-4 w-100"
                                style={{
                                    maxHeight: '1000px',
                                    objectFit: 'cover',
                                }}
                            />

                            {/* Save button - beneath picture, right aligned */}
                            <div className="d-flex justify-content-end mb-4">
                                <button
                                    onClick={handleToggleSave}
                                    className={`btn btn-sm ${
                                        isRecipeSaved(recipeOfDay.idMeal)
                                            ? 'btn-danger'
                                            : 'btn-outline-danger'
                                    } rounded-pill d-flex align-items-center gap-1 px-3`}
                                >
                                    <Heart
                                        size={16}
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

                            {/* Category and origin */}
                            <div className="d-flex flex-wrap gap-2 mb-4">
                                {recipeOfDay.strCategory && (
                                    <span className="badge bg-warning text-dark">
                                        {recipeOfDay.strCategory}
                                    </span>
                                )}

                                {recipeOfDay.strArea && (
                                    <span className="badge bg-secondary">
                                       {recipeOfDay.strArea}
                                    </span>
                                )}

                                {recipeOfDay.strTags && (
                                    <span className="badge bg-light text-dark border">
                                        {recipeOfDay.strTags}
                                    </span>
                                )}
                            </div>

                            {/* Servings */}
                            <div className="card mb-4">
                                <div className="card-body">

                                    <div className="d-flex align-items-center justify-content-between">

                                        <div className="d-flex align-items-center gap-2">
                                            <Users size={22} />

                                            <strong>
                                                Servings
                                            </strong>
                                        </div>

                                        <div className="d-flex align-items-center gap-3">

                                        {/* Minus button */}
                                        <button
                                            className="btn btn-outline-secondary btn-sm"
                                            onClick={() =>
                                                setServings((prev) =>
                                                    Math.max(1, prev - 1)
                                                )
                                            }
                                        >
                                            <Minus size={18} />
                                        </button>

                                        {/* Current servings */}
                                        <strong>
                                            {servings}
                                        </strong>

                                        {/* Plus button */}
                                        <button
                                            className="btn btn-outline-secondary btn-sm"
                                                onClick={() =>
                                                setServings((prev) =>
                                                    prev + 1
                                                )
                                            }
                                        >
                                            <Plus size={18} />
                                        </button>

                                        </div>
                                    </div>

                                </div>
                            </div>

                            {/* Baking / dessert conversion cheat sheet */}
                            {(recipeOfDay.strCategory === 'Dessert' ||
                                recipeOfDay.strCategory === 'Baking') && (
                                <div className="alert alert-info mb-4">
                                    <h5 className="mb-2">
                                        🍰 Baking Cheat Sheet
                                    </h5>

                                    <p className="mb-1">
                                        1 cup = 240 ml
                                    </p>

                                    <p className="mb-1">
                                        1 tablespoon = 15 ml
                                    </p>

                                    <p className="mb-0">
                                        1 teaspoon = 5 ml
                                    </p>
                                </div>
                            )}

                            {/* Ingredients */}
                            <div className="mb-5">
                                <h4 className="mb-3">
                                    Ingredients
                                </h4>

                                <div className="list-group">

                                {getIngredientsList(recipeOfDay).map(
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

                                                {/* Checkbox icon */}
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

                                                {/* Ingredient text */}
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

                                            </button>
                                        );
                                    }
                                )}

                                </div>
                            </div>

                            {/* Instructions */}
                            <div>
                                <h4 className="mb-3">
                                    Instructions
                                </h4>

                                <div
                                    className="instructions"
                                    style={{
                                        whiteSpace: 'pre-line',
                                        lineHeight: '1.8',
                                    }}
                                >
                                    {recipeOfDay.strInstructions}
                                </div>
                            </div>

                        </div>

                        {/* Modal footer */}
                        <div className="modal-footer">

                        <button
                            type="button"
                            className="btn btn-secondary"
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