// copied logic for creating recipe from MyCookbook to seperate file - easier to debug
import { useRef, useState } from 'react';
import { saveCustomRecipe } from '../utils/cookbookHelper';
import { useModalAccessibility } from '../hooks/useModalAccessibility';

const MAX_IMAGE_SIZE_BYTES = 1024 * 1024;

function AddRecipeModal({ show, onClose, onSaved, recipeToEdit }) {
    // form if there wasn't a recipe in there before
    const emptyRecipeForm = {
        title: '',
        category: 'Cooking',
        area: '',
        instructions: '',
        image: '',
        ingredients: [{ ingredient: '', measure: '' }]
    };

    // the form that is then changed is now at the beginning the same as the empty one
    const [customRecipeForm, setCustomRecipeForm] = useState(() => {
        if (!recipeToEdit) return emptyRecipeForm;

        const ingredients = [];
        for (let i = 1; i <= 20; i++) {
            const ingredient = recipeToEdit[`strIngredient${i}`];
            const measure = recipeToEdit[`strMeasure${i}`];

            if (ingredient && ingredient.trim() !== '') {
                ingredients.push({
                    ingredient,
                    measure: measure || ''
                });
            }
        }

        return {
            title: recipeToEdit.strMeal || '',
            category: recipeToEdit.strCategory || 'Cooking',
            area: recipeToEdit.strArea || '',
            instructions: recipeToEdit.strInstructions || '',
            image: recipeToEdit.strMealThumb || '',
            ingredients: ingredients.length > 0
                ? ingredients
                : [{ ingredient: '', measure: '' }]
        };
    });

    const [formError, setFormError] = useState('');
    const [formSuccess, setFormSuccess] = useState('');
    const modalRef = useRef(null);
    useModalAccessibility(modalRef, show, onClose);

    const handleIngredientChange = (index, field, value) => {
        const updated = [...customRecipeForm.ingredients];
        updated[index] = {
            ...updated[index],
            [field]: value
        };

        setCustomRecipeForm({
            ...customRecipeForm,
            ingredients: updated
        });
    };

    const addIngredientRow = () => {
        setCustomRecipeForm({
            ...customRecipeForm,
            ingredients: [
                ...customRecipeForm.ingredients,
                { ingredient: '', measure: '' }
            ]
        });
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];

        if (!file) return;

        setFormError('');
        setFormSuccess('');

        if (!file.type.startsWith('image/')) {
            setFormError('Please select a valid image file.');
            e.target.value = '';
            return;
        }

        if (file.size > MAX_IMAGE_SIZE_BYTES) {
            setFormError('Please choose an image no larger than 1 MB to save space in your browser.');
            e.target.value = '';
            return;
        }

        const reader = new FileReader();

        reader.onloadend = () => {
            if (typeof reader.result !== 'string') {
                setFormError('The image could not be loaded. Please try another file.');
                return;
            }

            setCustomRecipeForm((previousForm) => ({
                ...previousForm,
                image: reader.result
            }));
        };

        reader.onerror = () => {
            setFormError('Failed to read the image. Please try another file.');
        };

        reader.readAsDataURL(file);
    };

    const handleSaveCustomRecipe = (e) => {
        e.preventDefault();

        setFormError('');
        setFormSuccess('');

        if (!customRecipeForm.title.trim()) {
            setFormError('Please enter a recipe title.');
            return;
        }

        // Check that the instructions are not empty.
        if (!customRecipeForm.instructions.trim()) {
            setFormError('Please enter the cooking instructions.');
            return;
        }

        // Check that at least one ingredient has been entered.
        const hasIngredient = customRecipeForm.ingredients.some(
            (ingredient) => ingredient.ingredient.trim() !== ''
        );

        if (!hasIngredient) {
            setFormError('Please add at least one ingredient.');
            return;
        }


        const recipeData = {
            ...customRecipeForm,

            // If editing, keep the existing ID.
            // If creating, saveCustomRecipe will create a new ID.
            idMeal: recipeToEdit?.idMeal
        };

        try {
            const saved = saveCustomRecipe(recipeData);

            if (!saved) {
                setFormError(
                    'The recipe could not be saved. Please try again.'
                );
                return;
            }

            onSaved();
            setFormSuccess('Recipe saved successfully!');
            setCustomRecipeForm(emptyRecipeForm);
            onClose();
        } catch (error) {
            console.error('Error saving custom recipe:', error);

            setFormError(
                'Something went wrong while saving your recipe. Please try again.'
            );
        }
    };

    if (!show) return null;

    return (
        <div
            ref={modalRef}
            className="modal show d-block"
            tabIndex="-1"
            role="dialog"
            aria-modal="true"
            aria-labelledby="recipe-editor-title"
            style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
        >
            <div className="modal-dialog modal-lg modal-dialog-centered">
                <div className="modal-content rounded-4 border-0 shadow">

                    <div className="modal-header border-0 bg-light p-4 justify-content-between">
                        <h4 id="recipe-editor-title" className="fw-bold mb-0">
                            {recipeToEdit ? 'Edit Recipe' : 'Create Custom Recipe'}
                        </h4>

                        <button
                            type="button"
                            className="btn-close"
                            onClick={onClose}
                            aria-label="Close"
                        ></button>
                    </div>

                    <form onSubmit={handleSaveCustomRecipe}>

                        <div
                            className="modal-body p-4"
                            style={{
                                maxHeight: '65vh',
                                overflowY: 'auto'
                            }}
                        >

                            {formError && (
                                <div className="alert alert-danger" role="alert">
                                    {formError}
                                </div>
                            )}

                            {formSuccess && (
                                <div className="alert alert-success" role="status">
                                    {formSuccess}
                                </div>
                            )}

                            {/* Recipe Title */}
                            <div className="mb-3">
                                <label htmlFor="recipe-title" className="form-label fw-bold">
                                    Recipe Title
                                </label>

                                <input
                                    id="recipe-title"
                                    type="text"
                                    className="form-control rounded-3"
                                    required
                                    value={customRecipeForm.title}
                                    onChange={(e) =>
                                        setCustomRecipeForm({
                                            ...customRecipeForm,
                                            title: e.target.value
                                        })
                                    }
                                    placeholder="e.g., Grandma's Apple Pie"
                                />
                            </div>

                            {/* Category / Origin / Image */}
                            <div className="row g-3 mb-3">

                                <div className="col-md-4">
                                    <label htmlFor="recipe-category" className="form-label fw-bold">
                                        Category
                                    </label>

                                    <select
                                        id="recipe-category"
                                        className="form-select rounded-3"
                                        value={customRecipeForm.category}
                                        onChange={(e) =>
                                            setCustomRecipeForm({
                                                ...customRecipeForm,
                                                category: e.target.value
                                            })
                                        }
                                    >
                                        <option value="Cooking">Cooking</option>
                                        <option value="Baking">Baking</option>
                                        <option value="Dessert">Dessert</option>
                                    </select>
                                </div>

                                <div className="col-md-4">
                                    <label htmlFor="recipe-origin" className="form-label fw-bold">
                                        Origin
                                    </label>

                                    <input
                                        id="recipe-origin"
                                        type="text"
                                        className="form-control rounded-3"
                                        value={customRecipeForm.area}
                                        onChange={(e) =>
                                            setCustomRecipeForm({
                                                ...customRecipeForm,
                                                area: e.target.value
                                            })
                                        }
                                        placeholder="e.g. Italian, Finnish"
                                    />
                                </div>

                                <div className="col-md-4">
                                    <label htmlFor="recipe-image-url" className="form-label fw-bold">
                                        Recipe Image
                                    </label>

                                    <input
                                        id="recipe-image-url"
                                        type="url"
                                        className="form-control rounded-3 mb-2"
                                        value={customRecipeForm.image}
                                        onChange={(e) =>
                                            setCustomRecipeForm({
                                                ...customRecipeForm,
                                                image: e.target.value
                                            })
                                        }
                                        placeholder="Paste image URL"
                                    />

                                    <label htmlFor="recipe-image-upload" className="form-label">
                                        Or upload an image
                                    </label>
                                    <input
                                        id="recipe-image-upload"
                                        type="file"
                                        accept="image/*"
                                        className="form-control rounded-3"
                                        onChange={handleImageUpload}
                                    />
                                    <small className="form-text text-muted">
                                        Uploaded images must be 1 MB or smaller because recipes are saved in this browser.
                                    </small>
                                </div>

                            </div>

                            {/* Ingredients */}
                            <div className="mb-3">
                                <span className="form-label fw-bold d-block">
                                    Ingredients
                                </span>

                                {customRecipeForm.ingredients.map((ing, idx) => (
                                    <div
                                        key={idx}
                                        className="d-flex gap-2 mb-2"
                                    >
                                        <input
                                            id={`ingredient-amount-${idx}`}
                                            type="text"
                                            className="form-control rounded-3"
                                            placeholder="Amount"
                                            aria-label={`Amount for ingredient ${idx + 1}`}
                                            value={ing.measure}
                                            onChange={(e) =>
                                                handleIngredientChange(
                                                    idx,
                                                    'measure',
                                                    e.target.value
                                                )
                                            }
                                        />

                                        <input
                                            id={`ingredient-name-${idx}`}
                                            type="text"
                                            className="form-control rounded-3"
                                            placeholder="Ingredient"
                                            aria-label={`Ingredient name ${idx + 1}`}
                                            value={ing.ingredient}
                                            onChange={(e) =>
                                                handleIngredientChange(
                                                    idx,
                                                    'ingredient',
                                                    e.target.value
                                                )
                                            }
                                        />
                                    </div>
                                ))}

                                <button
                                    type="button"
                                    className="btn btn-outline-secondary btn-sm rounded-3 mt-1"
                                    onClick={addIngredientRow}
                                >
                                    + Add Ingredient
                                </button>
                            </div>

                            {/* Instructions */}
                            <div className="mb-3">
                                <label htmlFor="recipe-instructions" className="form-label fw-bold">
                                    Instructions
                                </label>

                                <textarea
                                    id="recipe-instructions"
                                    className="form-control rounded-3"
                                    rows="4"
                                    required
                                    value={customRecipeForm.instructions}
                                    onChange={(e) =>
                                        setCustomRecipeForm({
                                            ...customRecipeForm,
                                            instructions: e.target.value
                                        })
                                    }
                                    placeholder="Step 1: Preheat oven..."
                                ></textarea>
                            </div>

                        </div>

                        <div className="modal-footer border-0 bg-light p-3">
                            <button
                                type="button"
                                className="btn btn-secondary rounded-3"
                                onClick={onClose}
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                className="btn btn-primary rounded-3 px-4"
                            >
                                Save Recipe
                            </button>
                        </div>

                    </form>
                </div>
            </div>
        </div>
    );
}

export default AddRecipeModal;