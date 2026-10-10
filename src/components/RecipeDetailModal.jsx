// function that includes all the logic for the different recipe detail modals

import { useEffect, useState } from 'react';
import { Heart, Minus, Plus, PlusCircle, Trash2, Users } from 'lucide-react';

import { isRecipeSaved, scaleMeasure, toggleSaveRecipe } from '../utils/cookbookHelper';

function RecipeDetailModal({
    recipe,
    onClose,
    recipeType = 'auto',
    showSaveButton = false,
    defaultCategory = 'Cooking',
    onRemove,
    onEdit,
    children,
}) {
    const [servings, setServings] = useState(4);
    const [checkedIngredients, setCheckedIngredients] = useState({});
    const [, setSaveVersion] = useState(0);

    useEffect(() => {
        setServings(4);
        setCheckedIngredients({});
    }, [recipe?.idMeal]);

    if (!recipe) return null;

    const category = recipe.strCategory?.toLowerCase();

    const isBaking =
        recipeType === 'baking' ||
        (recipeType === 'auto' &&
            (category === 'baking' || category === 'dessert'));

    const ingredients = [];

    // TheMealDB stores ingredients in numbered fields.
    for (let i = 1; i <= 20; i++) {
        const ingredient = recipe[`strIngredient${i}`]?.trim();
        const measure = recipe[`strMeasure${i}`]?.trim() || '';

        if (ingredient) {
            ingredients.push({ ingredient, measure });
        }
    }

    const saved = recipe.idMeal
        ? isRecipeSaved(recipe.idMeal)
        : false;

    const handleToggleSave = () => {
        if (!recipe.idMeal) return;

        toggleSaveRecipe({
            ...recipe,
            strCategory: recipe.strCategory || defaultCategory,
        });

        // Refresh the button after localStorage changes.
        setSaveVersion((previous) => previous + 1);
    };

    const toggleIngredientCheck = (index) => {
        setCheckedIngredients((previous) => ({
            ...previous,
            [index]: !previous[index],
        }));
    };

    return (
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

                    {/* Modal header */}
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

                        {/* Optional page-specific content, e.g. the baking conversion guide */}
                        {children}

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
