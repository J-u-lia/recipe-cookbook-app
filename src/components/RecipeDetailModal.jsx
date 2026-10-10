// function that includes all the logic for the different recipe detail modals

// import the functions used
import { useEffect, useState } from 'react';
// improt icons
import { Heart, Minus, Plus, PlusCircle, Trash2, Users } from 'lucide-react';
// improt helper functions
import { isRecipeSaved, scaleMeasure, toggleSaveRecipe } from '../utils/cookbookHelper';

// create the fucntion that displays the details of the recipe in the popup window
// managses the serving size scaling, ingredient checklist
// identifies if it is a baking or cooking recipe and displays the conversion guid if baking or dessert
// save recipies logic, edit, remove, close buttons
function RecipeDetailModal({
    // define all the props
    recipe, // recipe that details should be displyed
    onClose,    // function thats called when modal should close
    recipeType = 'auto',    // auto is baking and not then cookig
    showSaveButton = false, // should savve button be displayed
    defaultCategory = 'Cooking',    // when a recipe doesnt have a category then cookign
    onRemove,   // remove recipe function
    onEdit, // edit recipe function
}) {
    // devine the variables servings, checked ingredients and re-rendering for svaed status
    const [servings, setServings] = useState(4);
    const [checkedIngredients, setCheckedIngredients] = useState({});
    const [, setSaveVersion] = useState(0);

    // when the user opens a different recipe then reset the serving size and clear the checkd ingredients
    useEffect(() => {
        setServings(4);
        setCheckedIngredients({});
    }, [recipe?.idMeal]);

    // if there is no recipe selected then return
    if (!recipe) return null;

    // reads category and converts it to lowercase - more consistent
    const category = recipe.strCategory?.toLowerCase();

    // if the recipe is baking then it is baking if its auto it checks if its baking or dessert and if neither then cooking
    const isBaking =
        recipeType === 'baking' ||
        (recipeType === 'auto' &&
            (category === 'baking' || category === 'dessert'));
    
    // variable to check if the banenr shold be displayed or not
    const shouldShowConversionBanner =
        category === 'baking' || category === 'dessert';

    // array fo the ingredients and the measurements
    const ingredients = [];

    // iterare over the 20 possible ingrents
    for (let i = 1; i <= 20; i++) {
        const ingredient = recipe[`strIngredient${i}`]?.trim();
        const measure = recipe[`strMeasure${i}`]?.trim() || '';

        // add the ingredients that have a ngredient name
        if (ingredient) {
            ingredients.push({ ingredient, measure });
        }
    }

    // check if the curetn recipe is already saved - so the button is displayed correctly
    const saved = recipe.idMeal
        ? isRecipeSaved(recipe.idMeal)
        : false;

    // its for saving or unsaving the recipe depending on in what state the save button was in before
    const handleToggleSave = () => {
        if (!recipe.idMeal) return;

        toggleSaveRecipe({
            ...recipe,
            strCategory: recipe.strCategory || defaultCategory,
        });

        // Refresh the button after localStorage changes so its looks match the saving state
        setSaveVersion((previous) => previous + 1);
    };

    // to safe the checked state of ingredient or unchecked
    const toggleIngredientCheck = (index) => {
        setCheckedIngredients((previous) => ({
            ...previous,
            [index]: !previous[index],
        }));
    };

    // renders the modal overlay
    return (
        // creates the modal with onClick which detects the click on the overlay
        <div
            className="modal show d-block"
            tabIndex="-1"
            role="dialog"
            aria-modal="true"
            style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
            onClick={(event) => {
                if (event.target === event.currentTarget) {
                    onClose();
                }
            }}
        >
            <div className="modal-dialog modal-lg modal-dialog-scrollable modal-dialog-centered">
                <div className="modal-content rounded-4 border-0 shadow-lg">

                    {/* Modal header with name and closing button */}
                    <div className="modal-header border-0 bg-light p-4">
                        <h3 className="modal-title fw-bold">
                            {recipe.strMeal}
                        </h3>

                        <button
                            type="button"
                            className="btn-close"
                            onClick={onClose}
                            aria-label="Close"
                        />
                    </div>

                    {/* Recipe image and serving controls */}
                    <div className="modal-body p-4">
                        <div className="row g-4 mb-4">

                            <div className="col-md-5">
                                <img
                                    src={recipe.strMealThumb}
                                    alt={recipe.strMeal}
                                    className="recipe-detail-img img-fluid rounded-4 shadow-sm w-100"
                                />

                                {showSaveButton && (
                                    <div className="d-flex justify-content-center mt-3">
                                        <button
                                            type="button"
                                            onClick={handleToggleSave}
                                            className={`btn ${
                                                saved
                                                    ? 'btn-danger'
                                                    : 'btn-outline-danger'
                                            } rounded-pill px-4 fw-semibold d-flex align-items-center gap-2`}
                                        >
                                            <Heart
                                                size={18}
                                                fill={saved ? 'currentColor' : 'none'}
                                            />
                                            {saved ? 'Saved' : 'Save'}
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="col-md-7">
                                <div className="p-3 bg-light rounded-4 border mb-3">
                                    <div className="d-flex align-items-center justify-content-between gap-2">
                                        <div className="d-flex align-items-center gap-2">
                                            <Users
                                                size={20}
                                                className="text-primary"
                                            />
                                            <span className="fw-bold">
                                                {isBaking
                                                    ? 'Baking Batch Size:'
                                                    : 'Serving Size:'}
                                            </span>
                                        </div>

                                        <div className="d-flex align-items-center gap-2">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setServings((previous) =>
                                                        Math.max(1, previous - 1)
                                                    )
                                                }
                                                className="btn btn-outline-dark serving-btn"
                                                aria-label="Decrease serving size"
                                            >
                                                <Minus size={16} />
                                            </button>

                                            <span className="fw-bold fs-5 px-1">
                                                {servings}
                                            </span>

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setServings((previous) =>
                                                        previous + 1
                                                    )
                                                }
                                                className="btn btn-outline-dark serving-btn"
                                                aria-label="Increase serving size"
                                            >
                                                <Plus size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="d-flex gap-2 flex-wrap">
                                    <span className="badge bg-secondary-subtle text-secondary px-3 py-2">
                                        Category: {recipe.strCategory || 'General'}
                                    </span>

                                    <span className="badge bg-secondary-subtle text-secondary px-3 py-2">
                                        Origin: {recipe.strArea || 'International'}
                                    </span>
                                </div>
                            </div>
                        </div>

                       
                        {/* Baking conversion - only shown for Baking and Dessert recipes */}
                        {shouldShowConversionBanner && (
                            <div className="alert alert-info rounded-4 mb-4">
                                <h5 className="mb-3 fw-bold">
                                    Kitchen Conversions at a Glance
                                </h5>

                                <div className="row g-3">
                                    {/* Weight & Volume */}
                                    <div className="col-12 col-md-6">
                                        <strong>Weight &amp; Volume</strong>

                                        <ul className="mb-0 mt-2 ps-3">
                                            <li>
                                                1 oz (Weight) = <strong>28.35 g</strong>
                                            </li>
                                            <li>
                                                1 fl oz (Liquid) = <strong>29.6 ml</strong>
                                            </li>
                                            <li>
                                                1 cup (Liquid) = <strong>240 ml</strong>
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
                                                Butter / Cream Cheese = <strong>225–227 g</strong>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        )}


                        {/* Ingredients and instructions */}
                        <div className="row g-4">
                            <div className="col-md-5">
                                <h5 className="fw-bold mb-3">
                                    Ingredients
                                </h5>

                                <ul className="list-unstyled">
                                    {ingredients.map((item, index) => {
                                        const displayMeasure = scaleMeasure(
                                            item.measure,
                                            servings,
                                            4
                                        );

                                        return (
                                            <li
                                                key={`${item.ingredient}-${index}`}
                                                className="mb-2"
                                            >
                                                <label className="d-flex align-items-start gap-2">
                                                    <input
                                                        type="checkbox"
                                                        className="form-check-input mt-1"
                                                        checked={Boolean(
                                                            checkedIngredients[index]
                                                        )}
                                                        onChange={() =>
                                                            toggleIngredientCheck(index)
                                                        }
                                                    />

                                                    <span
                                                        className={
                                                            checkedIngredients[index]
                                                                ? 'text-decoration-line-through text-muted'
                                                                : ''
                                                        }
                                                    >
                                                        <strong>{displayMeasure}</strong>{' '}
                                                        {item.ingredient}
                                                    </span>
                                                </label>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>

                            <div className="col-md-7">
                                <h5 className="fw-bold mb-3">
                                    {isBaking
                                        ? 'Baking Instructions'
                                        : 'Instructions'}
                                </h5>

                                <p
                                    className="text-secondary lh-lg"
                                    style={{ whiteSpace: 'pre-line' }}
                                >
                                    {recipe.strInstructions ||
                                        'No instructions are available for this recipe.'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Page-specific actions and close button */}
                    <div className="modal-footer border-0 bg-light p-3 d-flex justify-content-between flex-wrap gap-2">
                        <div className="d-flex gap-2 flex-wrap">
                            {recipe.isCustom && onEdit && (
                                <button
                                    type="button"
                                    className="btn btn-outline-primary px-4 fw-semibold rounded-3 d-flex align-items-center gap-2"
                                    onClick={() => onEdit(recipe)}
                                >
                                    <PlusCircle size={18} />
                                    Edit
                                </button>
                            )}

                            {onRemove && (
                                <button
                                    type="button"
                                    className="btn btn-outline-danger px-4 fw-semibold rounded-3 d-flex align-items-center gap-2"
                                    onClick={() => onRemove(recipe)}
                                >
                                    <Trash2 size={18} />
                                    Remove
                                </button>
                            )}
                        </div>

                        <button
                            type="button"
                            className="btn btn-secondary px-4 fw-semibold rounded-3"
                            onClick={onClose}
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default RecipeDetailModal;
