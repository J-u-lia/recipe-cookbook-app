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

// helper function for ability to add/update own recipe to localStorage
// in localstorage because then it remains available after refreshing page
export const saveCustomRecipe = (recipeData) => {
    try {
        // existing gets all the recipies curretnly in the cookbook saved if there is nothing then empty array
        const existing = JSON.parse(localStorage.getItem('my_cookbook')) || [];

        // the cutsom recipe form data has to be the same structure as that recipes from TheMealDB because then MyCookbook can treat API recipes and the custom ones in the same way
        const newRecipe = {
            idMeal: recipeData.idMeal || `custom_${Date.now()}`,    // own id for custom recipe with timestamp or if one exists keep it
            strMeal: recipeData.title,  // title entered is the meal name
            strCategory: recipeData.category || 'Custom',   // selected category
            strArea: recipeData.area || 'Home Made',    // home made as default origin
            strMealThumb: recipeData.image || 'https://images.unsplash.com/photo-1495521821757-a1efb6729352?auto=format&fit=crop&w=800&q=80',   // image entered by user if they dont give one the default one is used
            strInstructions: recipeData.instructions,   // store the instructions
            isCustom: true, // tells the app if recipe is custom made or not
            // Map ingredients list to strIngredient1..20 and strMeasure1..20
            ...recipeData.ingredients.reduce((acc, curr, index) => {
            acc[`strIngredient${index + 1}`] = curr.ingredient; // store ingredient name
            acc[`strMeasure${index + 1}`] = curr.measure;   // store measurements
            return acc;
            }, {})
        };
        // check if recipe with this id is in the cookbook to update existing ones and not maiing the same twice
        const existingIndex = existing.findIndex((item) => item.idMeal === newRecipe.idMeal);
        // if the one alreasy exists replace the old version
        if (existingIndex >= 0) {
            existing[existingIndex] = newRecipe; // Update
        } else {
            // if not add the new recipe to the beginning of cookbook so it appears first
            existing.unshift(newRecipe); // Add to beginning
        }
        // JS array in JSON to save it
        localStorage.setItem('my_cookbook', JSON.stringify(existing));
        return newRecipe;   // created recipe is returned
    } catch (error) {
        // if sth goes wrong error message is in console
        console.error('Failed to save custom recipe:', error);
        return null;
    }
};