<!DOCTYPE html>
<html>
<head>
  <title>Jotter App</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      margin: 20px;
    }
    .jotter-form {
      margin-bottom: 20px;
    }
    .jotter-text {
      border: 1px solid #ccc;
      padding: 5px;
      width: 100%;
    }
    .jotter-item {
      border: 1px solid #ccc;
      padding: 10px;
      margin: 10px 0;
    }
  </style>
</head>
<body>
  <h1>Jotter App</h1>
  
  <div class="jotter-form">
    <form id="text-form">
      <input type="text" id="text-input" class="jotter-text" placeholder="Enter your text" required>
      <button type="submit">Save</button>
    </form>
  </div>

  <div id="saved-text">
    
  </div>

  <script>
    const textForm = document.getElementById("text-form");
    const textInput = document.getElementById("text-input");
    const savedTextContainer = document.getElementById("saved-text");

    // Function to save text to the browser
    function saveText(text) {
      const savedText = localStorage.getItem("savedText");
      let textArray = savedText ? JSON.parse(savedText) : [];

      textArray.push(text);
      localStorage.setItem("savedText", JSON.stringify(textArray));
    }

    // Function to display the saved text
    function displaySavedText() {
      const savedText = localStorage.getItem("savedText");
      let textArray = savedText ? JSON.parse(savedText) : [];

      savedTextContainer.innerHTML = "";

      textArray.forEach((text, index) => {
        const item = document.createElement("div");
        item.className = "jotter-item";
        item.innerHTML = `${text} 
          <button onclick="editText(${index})">Edit</button>
          <button onclick="deleteText(${index})">Delete</button>`;
        savedTextContainer.appendChild(item);
      });
    }

    // Function to edit saved text
    function editText(index) {
      const savedText = localStorage.getItem("savedText");
      let textArray = savedText ? JSON.parse(savedText) : [];
      const newText = prompt("Edit your text:", textArray[index]);

      if (newText !== null) {
        textArray[index] = newText;
        localStorage.setItem("savedText", JSON.stringify(textArray));
        displaySavedText();
      }
    }

    // Function to delete saved text
    function deleteText(index) {
      const savedText = localStorage.getItem("savedText");
      let textArray = savedText ? JSON.parse(savedText) : [];
      textArray.splice(index, 1);
      localStorage.setItem("savedText", JSON.stringify(textArray));
      displaySavedText();
    }

    textForm.addEventListener("submit", function (e) {
      e.preventDefault();
      const text = textInput.value;
      if (text.trim() !== "") {
        saveText(text);
        textInput.value = "";
        displaySavedText();
      }
    });

    displaySavedText();
  </script>
</body>
</html>
