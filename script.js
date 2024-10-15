// Reference to the form element
let recipeForm = document.getElementById("recipe-form");

// Input fields and textarea elements
let recipeName = document.getElementById("recipe-name");
let ingredients = document.getElementById("recipe-ingredients");
let steps = document.getElementById("recipe-steps");

// Reference to the display area where recipes will appear
let displayArea = document.getElementById("recipe-display");

// Array to store recipes
let recipes = [];

// Function to display a recipe
function displayRecipe(recipe, index) {
  let recipeDiv = document.createElement("div");
  recipeDiv.classList.add("recipe-card");

  let recipeNameElement = document.createElement("h3");
  recipeNameElement.textContent = recipe.name;

  let ingredientsElement = document.createElement("p");
  ingredientsElement.innerHTML = `<strong>Ingredients:</strong> ${recipe.ingredients.join(
    ", "
  )}`;

  let stepsElement = document.createElement("p");
  stepsElement.innerHTML = `<strong>Steps:</strong> ${recipe.steps}`;

  if (recipe.imageURL) {
    let recipeImage = document.createElement("img");
    recipeImage.src = recipe.imageURL;
    recipeImage.alt = `${recipe.name} image`;
    recipeImage.classList.add("recipe-image");
    recipeDiv.appendChild(recipeImage);
  }

  let deleteButton = document.createElement("button");
  deleteButton.textContent = "Delete";
  deleteButton.classList.add("delete-btn");
  deleteButton.onclick = function () {
    deleteRecipe(recipe.id);
  };

  let editButton = document.createElement("button");
  editButton.textContent = "Edit";
  editButton.classList.add("edit-btn");
  editButton.onclick = function () {
    editRecipe(index);
  };

  recipeDiv.appendChild(recipeNameElement);
  recipeDiv.appendChild(ingredientsElement);
  recipeDiv.appendChild(stepsElement);
  recipeDiv.appendChild(deleteButton);
  recipeDiv.appendChild(editButton);

  displayArea.appendChild(recipeDiv);
}

// Event listener for form submission
recipeForm.addEventListener("submit", async function (e) {
  e.preventDefault();

  let imageURL = document.getElementById("recipeImage").value;

  let newRecipe = {
    name: recipeName.value,
    ingredients: ingredients.value.split(",").map((item) => item.trim()),
    steps: steps.value,
    imageURL: imageURL,
  };

  // POST new recipe to the backend API
  await postRecipe(newRecipe);
  await refreshRecipeDisplay(); // Fetch and display updated recipes
  recipeForm.reset();
});

// Function to delete a recipe (Delete from the backend API)
async function deleteRecipe(recipe_id) {
  try {
    const url = `http://127.0.0.1:8000/recipes/${recipe_id}`;
    const response = await fetch(url, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    await refreshRecipeDisplay(); // Refresh after deletion
  } catch (err) {
    console.error("Error deleting recipe:", err);
    throw err;
  }
}

// Function to refresh the display (Fetch recipes from the backend)
async function refreshRecipeDisplay() {
  displayArea.innerHTML = ""; // Clear the display area
  recipes = await getRecipes(); // Fetch from backend
  recipes.forEach((recipe, index) => {
    displayRecipe(recipe, index);
  });
}

// Function to switch to editing mode
function editRecipe(index) {
  const recipe = recipes[index];
  let recipeDiv = displayArea.children[index];
  recipeDiv.innerHTML = "";

  let nameLabel = document.createElement("label");
  nameLabel.textContent = "Recipe Name:";
  let nameInput = document.createElement("input");
  nameInput.type = "text";
  nameInput.value = recipe.name;

  let ingredientsLabel = document.createElement("label");
  ingredientsLabel.textContent = "Ingredients:";
  let ingredientsInput = document.createElement("textarea");
  ingredientsInput.value = recipe.ingredients.join(", ");

  let stepsLabel = document.createElement("label");
  stepsLabel.textContent = "Steps:";
  let stepsInput = document.createElement("textarea");
  stepsInput.value = recipe.steps;

  let imageLabel = document.createElement("label");
  imageLabel.textContent = "Image URL:";
  let imageInput = document.createElement("input");
  imageInput.type = "url";
  imageInput.value = recipe.imageURL || "";

  let saveButton = document.createElement("button");
  saveButton.textContent = "Save";
  saveButton.onclick = async function () {
    await saveEditedRecipe(
      recipe.id,
      nameInput.value,
      ingredientsInput.value,
      stepsInput.value,
      imageInput.value
    );
    await refreshRecipeDisplay(); // Fetch and display updated recipes
  };

  recipeDiv.appendChild(nameLabel);
  recipeDiv.appendChild(nameInput);
  recipeDiv.appendChild(ingredientsLabel);
  recipeDiv.appendChild(ingredientsInput);
  recipeDiv.appendChild(stepsLabel);
  recipeDiv.appendChild(stepsInput);
  recipeDiv.appendChild(imageLabel);
  recipeDiv.appendChild(imageInput);
  recipeDiv.appendChild(saveButton);
}

// Function to save the edited recipe (PUT request to backend)
async function saveEditedRecipe(
  recipe_id,
  newName,
  newIngredients,
  newSteps,
  newImageURL
) {
  if (!newName || !newIngredients || !newSteps) {
    alert("Please fill in all fields.");
    return;
  }

  const updatedRecipe = {
    name: newName,
    ingredients: newIngredients.split(",").map((item) => item.trim()),
    steps: newSteps,
    imageURL: newImageURL || "",
  };

  try {
    const url = `http://127.0.0.1:8000/recipes/${recipe_id}`;
    const response = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedRecipe),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
  } catch (err) {
    console.error("Error saving edited recipe:", err);
    throw err;
  }
}

// Function to get recipes from the backend
const getRecipes = async () => {
  try {
    const url = "http://127.0.0.1:8000/recipes";
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (err) {
    console.error("Error getting recipes:", err);
    throw err;
  }
};

// Function to post a new recipe to the backend
const postRecipe = async (recipe) => {
  try {
    const url = "http://127.0.0.1:8000/recipes";
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(recipe),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (err) {
    console.error("Error posting recipe:", err);
    throw err;
  }
};

// Load recipes on page load
window.addEventListener("DOMContentLoaded", refreshRecipeDisplay);
