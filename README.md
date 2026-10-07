# Recipy

Recipy is a React recipe application where users can discover cooking and baking recipes, search for recipes, save their favourite recipes, and create their own recipes.
The application uses the TheMealDB API to retrieve recipe information and stores saved recipes in the browser using localStorage.

# Features
- Browse cooking and baking recipes
- Search for recipes by name, ingredient, category, or area
- View recipe ingredients and instructions
- Adjust ingredient quantities based on the number of servings
- Check off ingredients while cooking
- Save favourite recipes to My Cookbook
- Create and save custom recipes
- Edit and delete custom recipes
- Filter saved recipes by category
- Recipe of the Day
- Responsive design

## Technologies

- React
- Vite
- JavaScript
- Bootstrap
- Lucide React
- TheMealDB API
- CSS
- localStorage

## Getting Started

### Prerequisites

Make sure you have Node.js and npm installed on your computer.

You can check your versions with:
```bash
node -v
npm -v
```

### Installation
1. Clone the repository
```bash
git clone https://github.com/J-u-lia/recipe-cookbook-app.git
```

2. Move into the project folder
```bash
cd recipe-cookbook-app
```

3. Install the project dependencies
```bash
npm install
```

### Start the development server
- run: 
```bash
npm run dev
```

Vite will start the development server and provide a local URL. Open this URL in your browser to use Recipy.

## Build for Production
To create a production build, run 'npm run build'. To preview the production build locally run 'npm run preview'. 

## Project structure

```text
recipe-cookbook-app/
├── public/
│
├── src/
│   ├── assets/
│   │
│   ├── components/
│   │   ├── AddRecipeModal.jsx
│   │   ├── RecipeOfTheDay.jsx
│   │   └── SearchResults.jsx
│   │
│   ├── pages/
│   │   ├── Baking.css
│   │   ├── Baking.jsx
│   │   ├── Cooking.css
│   │   ├── Cooking.jsx
│   │   ├── Home.css
│   │   ├── Home.jsx
│   │   ├── MyCookbook.css
│   │   └── MyCookbook.jsx
│   │
│   ├── utils/
│   │   └── cookbookHelper.js
│   │
│   ├── App.css
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
│
├── .gitignore
├── index.html
├── package.json
├── package-lock.json
├── vite.config.js
└── README.md
```

## API
Recipe data is provided by TheMealDB.
The application uses the API to search for recipes and retrieve recipe details such as ingredients, measurements, instructions, categories, and images.

## Git and Version Control
The project is maintained using Git.
Development was committed regularly so that the commit history reflects how the application evolved throughout the development process.
The GitHub repository is publicly accessible: https://github.com/J-u-lia/recipe-cookbook-app 

## Author
Julia Rössler

## Course
Web Programming I