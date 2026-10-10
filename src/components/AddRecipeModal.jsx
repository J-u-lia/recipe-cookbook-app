// copied logic for creating recipe from MyCookbook to seperate file - easier to debug
import { useState, useEffect } from 'react';    // useEffect is now needed for the side effect
import { saveCustomRecipe } from '../utils/cookbookHelper';

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
    const [customRecipeForm, setCustomRecipeForm] = useState(emptyRecipeForm);

    const [formError, setFormError] = useState('');
    const [formSuccess, setFormSuccess] = useState('');

    // if user clicks Edit then the recipeToEdit contains the strMeal, Category, ect. and through this effect that is converted back into the format the form expects title, category, area, ...
    useEffect(() => {
        setFormError('');
        setFormSuccess('');
        
        // if we are editing an existing recipe
        if (recipeToEdit) {
            // Convert the stored recipe back into the format
            // that form uses.
            const ingredients = [];
            // iterate thorugh the 20 possivle ingredient keys and then match the TheMealDB API to the stored schea foramt
            for (let i = 1; i <= 20; i++) {
                const ingredient = recipeToEdit[`strIngredient${i}`];
                const measure = recipeToEdit[`strMeasure${i}`];

                // Only add ingredients that actually contain something.
                if (ingredient && ingredient.trim() !== '') {
                    ingredients.push({
                        ingredient,
                        measure: measure || ''
                    });
                }
            }

            // populate the modal form state with the existing recipe details
            setCustomRecipeForm({
                title: recipeToEdit.strMeal || '',
                category: recipeToEdit.strCategory || 'Cooking',
                area: recipeToEdit.strArea || '',
                instructions: recipeToEdit.strInstructions || '',
                image: recipeToEdit.strMealThumb || '',
                ingredients: ingredients.length > 0
                    ? ingredients
                    : [{ ingredient: '', measure: '' }]
            });

        } else {
            // If we are creating a new recipe,
            // start with an empty form.
            setCustomRecipeForm(emptyRecipeForm);
        }
    }, [recipeToEdit, show]);

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
            className="modal show d-block"
            style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
        >
            <div className="modal-dialog modal-lg modal-dialog-centered">
                <div className="modal-content rounded-4 border-0 shadow">

                    <div className="modal-header border-0 bg-light p-4 justify-content-between">
                        <h4 className="fw-bold mb-0">
                            {recipeToEdit ? 'Edit Recipe' : 'Create Custom Recipe'}
                        </h4>

                        <button
                            className="btn-close"
                            onClick={onClose}
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
                                <label className="form-label fw-bold">
                                    Recipe Title
                                </label>

                                <input
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
                                    <label className="form-label fw-bold">
                                        Category
                                    </label>

                                    <select
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
                                    <label className="form-label fw-bold">
                                        Origin
                                    </label>

                                    <input
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
                                    <label className="form-label fw-bold">
                                        Recipe Image
                                    </label>

                                    <input
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

                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="form-control rounded-3"
                                        onChange={handleImageUpload}
                                    />
                                </div>

                            </div>

                            {/* Ingredients */}
                            <div className="mb-3">
                                <label className="form-label fw-bold">
                                    Ingredients
                                </label>

                                {customRecipeForm.ingredients.map((ing, idx) => (
                                    <div
                                        key={idx}
                                        className="d-flex gap-2 mb-2"
                                    >
                                        <input
                                            type="text"
                                            className="form-control rounded-3"
                                            placeholder="Amount"
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
                                            type="text"
                                            className="form-control rounded-3"
                                            placeholder="Ingredient"
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
                                <label className="form-label fw-bold">
                                    Instructions
                                </label>

                                <textarea
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