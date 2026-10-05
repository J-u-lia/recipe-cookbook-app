// Helper function to toggle saving a recipe to localStorage
// this way it can be reused and not written twice

// exports the function - variable called toggleSaveRecipe that contains the function
export const toggleSaveRecipe = (recipe) => {
    // the argument the function receives is the recipe the user wants to save or remove
    // inside the localStorage of the Browser the values under the key my_cookbook are saved even with page refresh, if nothings in there then empty array
    // but they need to be converted because browser saves them as jsons and not as JS opjects/arrays
    const stored = JSON.parse(localStorage.getItem('my_cookbook') || '[]');
    // check if the recipe already exists there 
    // with .some() it can be chekced if at least one item in an array satisfies a condition
    // looks if there is any item with the id = ... stored
    const exists = stored.some((item) => item.idMeal === recipe.idMeal);

    let updated;    // updated variable that will contain new cookbook
    // to check if recipe already is saved or not
    if (exists) {
        // if it is saved remove from cookbook
        // creates new array with only the items that pass the condition that its ID is different from the recipe that is removed
        updated = stored.filter((item) => item.idMeal !== recipe.idMeal);
    } else {
        // if not add to cookbook - with ...stored all the existing recipes are copied in the new array
        updated = [...stored, {
            idMeal: recipe.idMeal,
            strMeal: recipe.strMeal,
            strMealThumb: recipe.strMealThumb,
            strCategory: recipe.strCategory || 'Baking'
        }];
    }
    // updated array needs to be saved now into a String for browser
    localStorage.setItem('my_cookbook', JSON.stringify(updated));
    return !exists; // returns true if now saved, false if removed
};

// second helper function to check if this recipe is currently saved with input the idMeal
export const isRecipeSaved = (idMeal) => {
    // it reads the localStorage, gets the cookbook and converts JSON intro array
    const stored = JSON.parse(localStorage.getItem('my_cookbook') || '[]');
    // checks if at least one saved recipe has this ID
    return stored.some((item) => item.idMeal === idMeal);
};