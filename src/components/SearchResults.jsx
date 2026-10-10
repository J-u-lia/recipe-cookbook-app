// helper function to handle the Searching on the Home page
// IMPORTS
import { useState } from 'react';    // react hook to remeber things taht can change
import { Search, Users, Minus, Plus, Eye, CheckSquare, Square } from 'lucide-react';    // icons
import { scaleMeasure } from '../utils/cookbookHelper';
import RecipeDetailModal from '../components/RecipeDetailModal';

// react component
function SearchResults() {
    const [searchTerm, setSearchTerm] = useState('');   // stores what the user has typed into searchbar
    const [recipes, setRecipes] = useState([]); // stores recipes returned from API search
    const [selectedRecipe, setSelectedRecipe] = useState(null); // stores recipe user has currently selected
    const [servings, setServings] = useState(4);    // stores servings
    const [loading, setLoading] = useState(false);  // stores if the application is currently loading
    const [searched, setSearched] = useState(false);    // stores if the user has searched sth or not so that the rendering works correctly when coming to home page
    const [checkedIngredients, setCheckedIngredients] = useState({});   // stores if ingredients has been cheecked or not




    // the ingredient lsit is gotten from one complete meal object from the API because TheMealDB doesn't give ingredients as simple array
    const getIngredientsList = (meal) => {
        const list = [];    // empty list first
        // iterate over the ingreadients from 1 to 20 again
        for (let i = 1; i <= 20; i++) {
            // for every entrance write the property names for the ingredient and the measures
            const ingredient = meal[`strIngredient${i}`];
            const measure = meal[`strMeasure${i}`];
            // if an ingredient exists and it isnt jsut an empty whitespace
            if (ingredient && ingredient.trim() !== '') {
                // add the ingredient to the array with push(), first the ingredient and then the measure but the measure can also be empty if there is no measure
                list.push({ ingredient, measure: measure || '' });
            }
        }
        return list;    // return that list
    };


    // fucntion runs when user clicks an ingredient and then the state is updates (the same as in cooking)
    const toggleIngredientCheck = (index) => {
        // the prev gives the prevous state because i want to keep the existing checked ingredients while changing only one
        setCheckedIngredients((prev) => ({
            ...prev,    // copies all existing properties from prev into new opbject
            [index]: !prev[index],  // takes the current value of this ingredient index and reverses it so if prev[1] = false then it is true now so it can go from unchecked to checked and from checked to unchecked
        }));
    };

    // runs when user submits search - is async cause it could take time to search in the API 
    const handleSearchSubmit = async (e) => {
        e.preventDefault(); // don't refresh page
        const term = searchTerm.trim().toLowerCase();   // gets the search term but converts it to lowercase, no spaces
        if (!term) return;  // if nothing typed then stop function

        setLoading(true);   // if there is sth typed then state is loading
        setSelectedRecipe(null);    // close any recipes that might currently be open
        setSearched(true);  // remember that a search has been done

        try {
            // Run searches across Name/Tags, Ingredient, Category, and Origin in parallel
            const [nameRes, ingRes, catRes, areaRes] = await Promise.all([
                fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${encodeURIComponent(term)}`),
                fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?i=${encodeURIComponent(term)}`),
                fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?c=${encodeURIComponent(term)}`),
                fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?a=${encodeURIComponent(term)}`)
            ]);
            // convert everything in JS Object with Promise.all()
            const [nameData, ingData, catData, areaData] = await Promise.all([
                nameRes.json(),
                ingRes.json(),
                catRes.json(),
                areaRes.json()
            ]);

            // Map to track unique meals by ID so not the same recipe can appear multiple times
            const mealMap = new Map();

            // add direct name search results (includes title, tags, category, origin, ingredients)
            if (nameData.meals) {
                // check if name search actually returned recipes
                // it loops through every returned meal and stores the meal using its ID
                nameData.meals.forEach((meal) => mealMap.set(meal.idMeal, meal));
            }

            // Combine basic meal entries from ingredient, category, and area filters
            // return array if one is null then empty array
            const filterMeals = [
                ...(ingData.meals || []),
                ...(catData.meals || []),
                ...(areaData.meals || [])
            ];

            // this finds recipes that need full details because i not only need idMeal, strMeal, ect. but also the Category, Area, Tags, ingredients, ...so all details
            // find recipes that are not already in the Map
            const missingIds = filterMeals
                .map((m) => m.idMeal)
                .filter((id) => !mealMap.has(id));

            // the dublicate IDs should be removed
            // the set is converted into new array
            const uniqueMissingIds = [...new Set(missingIds)];

            // if there are missing recipes do more API requests
            if (uniqueMissingIds.length > 0) {
                // one API request for every missing recipe
                const detailPromises = uniqueMissingIds.map((id) =>
                    fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`)
                        .then((res) => res.json())  // convert to JSON
                        .then((data) => data.meals?.[0])    // get first meal from response
                        .catch(() => null)  // if sth fails return null instead
                );
                // it waits until all detail requests have finished
                const detailedMeals = await Promise.all(detailPromises);
                // then adds every successfully retrieved meal to the Map. 
                detailedMeals.forEach((meal) => {
                    if (meal) mealMap.set(meal.idMeal, meal);
                });
            }

            // Convert map to array - map.values() returns all stored recipes
            let combinedMeals = Array.from(mealMap.values());

            // Client-side fallback check to ensure tags, category, area, or ingredients match the search query
            combinedMeals = combinedMeals.filter((meal) => {
                const titleMatch = meal.strMeal?.toLowerCase().includes(term);  // check the recipe name - contains the search term 
                const catMatch = meal.strCategory?.toLowerCase().includes(term);    // check category 
                const areaMatch = meal.strArea?.toLowerCase().includes(term);   // check origin
                const tagsMatch = meal.strTags?.toLowerCase().includes(term);   // check tags

                // Check ingredients
                let ingMatch = false;   // at beginning assums that no ingredient macthes
                for (let i = 1; i <= 20; i++) {
                    // then it iterates over all 20 possible ingredient fields
                    const ing = meal[`strIngredient${i}`];  // if the ingredient exists and contains search term then there is a match
                    if (ing && ing.toLowerCase().includes(term)) {
                        ingMatch = true;
                        break;  // no need to search further
                    }
                }
                // if any of these mathces are true then keep the recipe
                return titleMatch || catMatch || areaMatch || tagsMatch || ingMatch;
            });

            setRecipes(combinedMeals);  // final recipe array saved into react state
        } catch (error) {
            // if the fetching goes wrong print message in console and te resicpis are empty list
            console.error('Error fetching recipes:', error);
            setRecipes([]);
        } finally {
            // both ways loading stops
            setLoading(false);
        }
    };

    // this handles when the user clicks the View Recipe
    const handleSelectRecipe = async (meal) => {
        // to make sure that when opening new recipe the ingredient checklist is unchecked
        setCheckedIngredients({});
        // some search results already contain full recipe data if strInstructions doesn't exist then it knows it need to make another API request to get full recipe
        if (!meal.strInstructions) {
            setLoading(true);   // start loading
            try {
                // fetch the full recipe details with lookup.php with the ID
                const res = await fetch(
                    `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${meal.idMeal}`
                );
                // convert it 
                const data = await res.json();
                // to make sure api actually returned a meal and then store the full recipe as the selected recipe
                if (data.meals && data.meals[0]) {
                    setSelectedRecipe(data.meals[0]);
                }
            } catch (err) {
                // error message if st goes wrong
                console.error('Error fetching recipe details:', err);
            } finally {
                // stop loading
                setLoading(false);
            }
        } else {
            // if meal already has full details then no API request needed
            setSelectedRecipe(meal);
        }
    };

    // return user interface
    return (
        <div className="container py-4">
            {/* SEARCH FORM with Search icon and small placeholder text when nothing is typed in*/}
            <form onSubmit={handleSearchSubmit}>
                <div className="input-group input-group-lg shadow-sm">
                    <span className="input-group-text bg-white border-0 text-muted ps-3">
                        <Search size={22} />
                    </span>
                    <input
                        type="text"
                        className="form-control border-0 fs-6 ps-2"
                        placeholder="Search by dish, ingredient, category, origin or tag..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    {/* search button to send the search  */}
                    <button className="btn btn-dark px-4 fw-semibold" type="submit">
                        {loading ? 'Searching...' : 'Search'}
                    </button>
                </div>
            </form>

            {/* RESULTS GRID but only if not loading and there is at least one recipe*/}
            {!loading && recipes.length > 0 && (
                /* grid looks the same as in the cooking or baking screen with the image, title,... */
                <div className="mt-4">
                    <h5 className="fw-bold text-muted mb-3">
                        Found {recipes.length} recipe{recipes.length > 1 ? 's' : ''}:
                    </h5>
                    <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-4">
                        {recipes.map((meal) => (
                            <div className="col" key={meal.idMeal}>
                                <div className="card h-100 border-0 shadow-sm rounded-4 overflow-hidden">
                                    <img
                                        src={meal.strMealThumb}
                                        className="card-img-top"
                                        alt={meal.strMeal}
                                        style={{ height: '180px', objectFit: 'cover' }}
                                    />
                                    <div className="card-body d-flex flex-column justify-content-between">
                                        <h6 className="card-title fw-bold text-dark mb-3">
                                            {meal.strMeal}
                                        </h6>
                                        <button
                                            type="button"
                                            onClick={() => handleSelectRecipe(meal)}
                                            className="btn btn-outline-dark btn-sm fw-semibold flex-grow-1 rounded-3 d-flex align-items-center justify-content-center gap-1"
                                        >
                                            <Eye size={16} /> View Recipe
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* NO RESULTS FOUND STATE - if no recipe found thatn display this text*/}
            {!loading && searched && recipes.length === 0 && (
                <div className="alert alert-light border rounded-4 text-center py-4 mt-4 text-muted">
                    No recipes found matching "<strong>{searchTerm}</strong>". Try searching for another ingredient, category, origin, or dish name (e.g., Italian, Pasta, Chicken, Dessert).
                </div>
            )}

            {/* RECIPE DETAIL MODAL - only shown when recipe has been selected
                    same logic as in Cooking, Baking */}
            {selectedRecipe && (
                <RecipeDetailModal
                    recipe={selectedRecipe}
                    onClose={() => setSelectedRecipe(null)}
                    recipeType="auto"
                    showSaveButton={true}
                />
            )}
        </div>
    );
}

export default SearchResults;