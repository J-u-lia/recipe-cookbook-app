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

// 07.10.2026 measurements don't correspond with serving sizes
// idea: scaled amount = (Original Amount/Base Servings) * Target S
// problem: measurements are strings like "500 g" - therefore this function extracts the numeric part out of it and then scales this and leaves nonnumeric things alone

// a JSDoc comment to write which data has what type - easier to write the function to not get confused
// describes also the parameters the function needs and the type of value they return
// @param describes the parameters and @return the return value 
/**
 * Scales ingredient measurement strings dynamically.
 * @param {string} measure - e.g., "500 g", "1.5 cups", "1/2 tsp", "to taste"
 * @param {number} currentServings - e.g., 8
 * @param {number} baseServings - Default base servings (4)
 * @returns {string} - Scaled measure string e.g., "1000 g"
 */

// creates the function (available for other files) in variable scaleMeasure which has parameters measure, currentServings and baseServing which are equal at the beginning
// e.g scaleMeasure("1/2 cup", 8, 4) it takes the 1/2 cup and cleans the text to get 1/2 then it converts the 1/2 into 0.5 as decimal number then calculates the serving ratio 8/4 which is 2 then multiplies it so 0.5 times 2 is 1 and then puts them back tether to get 1 cup
// measurements come from the API as strings, so function needs to convert the numeric part into a number before doing calculations.
// JavaScript can calculate 1 / 2 normally, but "1/2" from the API is text, so JavaScript cannot treat it as a mathematical fraction automatically.
export const scaleMeasure = (measure, currentServings = 4, baseServings = 4) => {
    // the function should only be executed if the measure is not missing or empty or if the type of the measure is a string if this doesn't apply then dont execute it
    if (!measure || typeof measure !== 'string') return measure || '';

    // if there is space at the beginning and after .trim() got rid of it the measure is empty then the function also don't need to run
    const trimmed = measure.trim();
    if (!trimmed) return '';

    // then the scaling ration needs to be calculated which is the number the measurements then gets multiplied 
    // it is currentServings divided by baseServings if these are equal then the ration is 1 and then it doesn't need to be calculated
    const ratio = currentServings / baseServings;
    if (ratio === 1) return trimmed;

    // regular expression = regex trys to find the number at the beginning of the measurement so the 500 in the 500g
    // with the ^ it starts at the beginning of the string
    // it needs to recognize three different possibilities:
                // a number then a distance and then a fraction so 1 1/2
                // just a fraaction like 1/2
                // normal number and decimal numbers
    // \d means a digit from 0-9
    // and \d+ means one more digit
    // \s is space
    // the / btw \d+/\d+ is the fraction slash
    // | means or
    // so the first part \d+\s+\d+\/\d+ means:
                // one digit then a space then a fraction
    // the second part \d+\/\d+ ist just the fraction
    // the third part \d+(?:\.\d+)?) is 
                // one digit (so e.g 500 would match because it is a digit)
                // and then perhaps (? means optional) a decimal point with a number behind
    const amountRegex = /^(\d+\s+\d+\/\d+|\d+\/\d+|\d+(?:\.\d+)?)/;
    // then with the help of the regex the trimmed string is searched for these numbers
    const match = trimmed.match(amountRegex);

    // if it couldn find a number then it should stop the function because multiplying strings doesn't work (e.g., "to taste", "pinch")
    if (!match) return trimmed; 
    
    // then the first thing that was found should be returned so the number without spaces
    const rawAmount = match[0].trim();
    // and then everything else like all the things after the number should be stored because after the calculations these units should still be the same
    const restOfMeasure = trimmed.slice(rawAmount.length); // " g", " cups"

    // a fraction needs to be converted into a decimal number to multiply
    let numericValue = 0;   // in there the numerical value will be stored
    // so if the number that was stored before includes a string / it is a fraction
    if (rawAmount.includes('/')) {
        // and then it should be splitted at the point where a space is so 1 1/2 would get "1", "1/2" to get two numbers
        const parts = rawAmount.split(' ');
        // if there are now two things so it was before a e.g 1 1/2 
        if (parts.length === 2) {
            // the first thing is the whole number and the second is the fraction
            // these two should be seperated to get whole = "1" and frac = "1/2"
            const [whole, frac] = parts;
            // and then the fraction should be splitted into numerator and denominator so it would get num = "1" and den = "2"
            const [num, den] = frac.split('/');
            // then the fraction needs to be converted into a decimal number with parseFloat the strings are converted into a number
            // so it adds the whole number to the num/den e.g 1 + 1/2 would get 1.5 so now it has his decimal number
            numericValue = parseFloat(whole) + parseFloat(num) / parseFloat(den);
        } else {
            // if the fraction is just a fraction then it just needs to split the num and the den and then convert the sttring back to number
            const [num, den] = rawAmount.split('/');
            numericValue = parseFloat(num) / parseFloat(den);
        }
    } else {
        // if it not a fraction at all so e.g 500 then it just gives the number back
        numericValue = parseFloat(rawAmount);
    }

    // to check if the number is really a valid number because in the conversion sth went wrong often
    // if it is not a number it just gives the original measurement back
    if (isNaN(numericValue)) return trimmed;

    // now the converted measuremnts can be scaled by multiplying it with the ratio
    const scaledValue = numericValue * ratio;

    // somitemes there is a looong floating decimal and this needs to be rounded to 2 decimal places
    // checks if the value jsut scaled is a integer or not
    const formattedValue = Number.isInteger(scaledValue)
        // if it is then it is ok and it should jsut take the scaled value
        ? scaledValue
        // if not it needs to be rounded
        : Math.round(scaledValue * 100) / 100;

    // then the number and the unit can be put back together 
    return `${formattedValue}${restOfMeasure}`;
    };