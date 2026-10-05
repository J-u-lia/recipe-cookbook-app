// copied logic for creating recipe from MyCookbook to seperate file - easier to debug
import { useState } from 'react';
import { saveCustomRecipe } from '../utils/cookbookHelper';

function AddRecipeModal({ show, onClose, onSaved }) {

    const [customRecipeForm, setCustomRecipeForm] = useState({
        title: '',
        category: 'Cooking',
        area: '',
        instructions: '',
        image: '',
        ingredients: [{ ingredient: '', measure: '' }]
    });

    const handleIngredientChange = (index, field, value) => {
        const updated = [...customRecipeForm.ingredients];
        updated[index][field] = value;

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

        const reader = new FileReader();

        reader.onloadend = () => {
            setCustomRecipeForm({
                ...customRecipeForm,
                image: reader.result
            });
        };

        reader.readAsDataURL(file);
    };

    const handleSaveCustomRecipe = (e) => {
        e.preventDefault();

        if (!customRecipeForm.title.trim()) return;

        const saved = saveCustomRecipe(customRecipeForm);

        if (saved) {
            onSaved();
            onClose();

            setCustomRecipeForm({
                title: '',
                category: 'Cooking',
                area: '',
                instructions: '',
                image: '',
                ingredients: [{ ingredient: '', measure: '' }]
            });
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
                            Create Custom Recipe
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