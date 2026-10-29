# Recipy

Recipy is a React recipe cookbook for discovering cooking and baking ideas, searching for recipes, and keeping a personal collection of favorite and custom recipes.

## Features

- Browse cooking and baking recipes by category
- Search recipes by name, ingredient, category, area, or tag
- View ingredients and instructions, adjust serving sizes, and check off ingredients
- Save and remove favorite recipes
- Create, edit, filter, and delete custom recipes
- See a recipe of the day
- Store cookbook data in browser `localStorage`
- Use the app on desktop and mobile screen sizes

Saved recipes are kept in the current browser on the current device. They are not synced between browsers or devices.

## Technologies

- **React** and **Vite** for the user interface and development/build tooling
- **React Router** for navigation between the app's screens
- **Bootstrap** for layout and styling
- **Lucide React** for icons
- **TheMealDB API** for recipe data
- Browser `localStorage` for favorites, custom recipes, and the daily recipe

Recipe data is requested from TheMealDB's public REST API using `fetch` and `async`/`await`.

## Screens

- **Home:** recipe search, category shortcuts, and recipe of the day
- **Stove & Pan:** browse and filter cooking recipes
- **Oven & Bakery:** browse and filter baking recipes
- **My Cookbook:** manage favorite recipes and custom recipes

## Run locally

### Prerequisites

Install Node.js and npm. Check that they are available:

```bash
node --version
npm --version
```

### Install and start

```bash
git clone https://github.com/J-u-lia/recipe-cookbook-app.git
cd recipe-cookbook-app
npm install
npm run dev
```

Open the local URL printed by Vite in your browser.

### Other commands

```bash
npm run lint    # Check the code with ESLint
npm run build   # Create a production build in dist/
npm run preview # Preview the production build locally
```

## Deployment

GitHub Pages deployment has not been done yet. After configuring and publishing the site, working public URL will be added here. The expected project-site URL is:

`asdf`

## Project structure

```text
recipe-cookbook-app/
├── public/
│   ├── favicon.svg
│   └── icons.svg
├── src/
│   ├── assets/
│   │   ├── hero.png
│   │   ├── react.svg
│   │   └── vite.svg
│   ├── components/
│   │   ├── AddRecipeModal.jsx
│   │   ├── RecipeDetailModal.jsx
│   │   ├── RecipeOfTheDay.jsx
│   │   └── SearchResults.jsx
│   ├── hooks/
│   │   └── useModalAccessibility.js
│   ├── pages/
│   │   ├── Baking.css
│   │   ├── Baking.jsx
│   │   ├── Cooking.css
│   │   ├── Cooking.jsx
│   │   ├── Home.css
│   │   ├── Home.jsx
│   │   ├── MyCookbook.css
│   │   └── MyCookbook.jsx
│   ├── utils/
│   │   └── cookbookHelper.js
│   ├── App.css
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
├── .gitignore
├── eslint.config.js
├── index.html
├── package.json
├── package-lock.json
├── vite.config.js
└── README.md
```

## Repository

Public GitHub repository: <https://github.com/J-u-lia/recipe-cookbook-app>

## Author

Julia Rössler

## Course

Web Programming I
