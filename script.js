// FormDataManager class to handle form data and operations
class FormDataManager {
  constructor(apiUrl, elements) {
    this.apiUrl = apiUrl; // API URL for fetching gender prediction
    this.name = "";       // User input name
    this.gender = undefined; // Selected gender value
    this.elements = elements; // DOM elements
  }

  // Updates the name property based on user input
  updateName(name) {
    this.name = name;
  }

  // Updates the gender property based on selected radio button
  updateGender(gender) {
    this.gender = gender;
  }

  // Fetches gender prediction from the API
  async fetchGenderPrediction() {
    if (!this.name) throw new Error("Name is required");
    try {
      const response = await fetch(`${this.apiUrl}${this.name}`);
      if (!response.ok) throw new Error("Failed to fetch data");
      const data = await response.json();
      if (!data.gender) throw new Error("No prediction available for this name");
      return data;
    } catch (error) {
      // Handle network errors or other fetch issues
      throw new Error("Network error or no data available");
    }
  }

  // Saves the current name and gender to localStorage
  saveToLocalStorage() {
    if (!this.name || !this.gender) throw new Error("Complete the form");
    localStorage.setItem(this.name, this.gender);
  }

  // Clears the saved gender information from localStorage for the current name
  clearLocalStorage() {
    if (!this.name) throw new Error("Name is required");
    localStorage.removeItem(this.name);
  }

  // Retrieves saved gender information from localStorage
  getSavedGender() {
    return localStorage.getItem(this.name) || "NO DATA";
  }
}

window.addEventListener("DOMContentLoaded", () => {
  // Object containing references to necessary DOM elements
  const elements = {
    nameInput: document.querySelector("#name"),
    form: document.querySelector("#form"),
    saveButton: document.querySelector("#save"),
    genderTxt: document.querySelector("#gender-txt"),
    genderVal: document.querySelector("#gender-val"),
    saved: document.querySelector("#saved-answer"),
    clear: document.querySelector("#clear"),
    error: document.querySelector("#error")
  };

  // Instance of FormDataManager
  const formDataManager = new FormDataManager("https://api.genderize.io/?name=", elements);

  // Event listener for name input changes
  elements.nameInput.addEventListener("input", (event) => {
    formDataManager.updateName(event.target.value);
  });

  // Event listener for any changes in the form (gender selection)
  elements.form.addEventListener("change", () => {
    const selectedGender = document.querySelector('input[name="radio-group"]:checked')?.value;
    formDataManager.updateGender(selectedGender);
  });

  // Event listener for form submission
  elements.form.addEventListener("submit", async (event) => {
    event.preventDefault();
    try {
      elements.error.style.display = "none";
      elements.saved.innerHTML = formDataManager.getSavedGender();
      updateUI("loading...", "loading...");
      const prediction = await formDataManager.fetchGenderPrediction();
      updateUI(prediction.gender, prediction.probability);
    } catch (error) {
      handleError(error.message);
    }
  });

  // Event listener for save button click
  elements.saveButton.addEventListener("click", () => {
    try {
      elements.error.style.display = "none";
      formDataManager.saveToLocalStorage();
    } catch (error) {
      handleError(error.message);
    }
  });

  // Event listener for clear button click
  elements.clear.addEventListener("click", () => {
    try {
      formDataManager.clearLocalStorage();
      elements.saved.innerHTML = "CLEARED";
    } catch (error) {
      handleError(error.message);
    }
  });

  // Function to update UI with gender and probability
  function updateUI(gender, probability) {
    elements.genderTxt.innerHTML = gender;
    elements.genderVal.innerHTML = probability;
  }

  // Function to handle and display errors
  function handleError(message) {
    elements.error.style.display = "flex";
    elements.error.innerHTML = message;
    updateUI("GENDER", "Probability");
  }
});
