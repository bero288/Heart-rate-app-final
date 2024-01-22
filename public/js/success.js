const plotContainer = document.querySelector(".plot-container");
const avgHR = document.querySelector(".avg-HR p");

function handleLoginSuccess() {
  // Create a URLSearchParams object from the current URL
  const urlParams = new URLSearchParams(window.location.search);

  // Extract the value of the 'token' parameter
  const token = urlParams.get("token");

  //store the token in the local storage
  localStorage.setItem("token", token);

  // Use the token to make a request to the server
  fetchDataWithToken(token);
}

function postTheData() {
  fetch("/predict", {
    method: "POST",
    headers: {
      "Content-Type": "application/json; charset=UTF-8",
    },
    body: JSON.stringify({
      //getting the store data in the local storage
      sex: localStorage.getItem("sex"),
      age: localStorage.getItem("age"),
      currentSmoker: localStorage.getItem("currentSmoker"),
      cigsPerDay: localStorage.getItem("cigsPerDay"),
      BPMeds: localStorage.getItem("BPMeds"),
      prevalentStroke: localStorage.getItem("prevalentStroke"),
      prevalentHyp: localStorage.getItem("prevalentHyp"),
      diabetes: localStorage.getItem("diabetes"),
      BMI: localStorage.getItem("BMI"),
      sysBloodPressure: 120,
      diasBloodPressure: 80,
      heartRate: 69,
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      let imgElement = document.createElement("img");

      // Step 2: Set the src attribute to the URL of the image
      imgElement.src = "../imgs/heart-rate-plot.png";

      // Step 3 (Optional): Set other attributes
      imgElement.alt = "HR Image";
      imgElement.style.height = "70vh";
      plotContainer.appendChild(imgElement);

      let textNode = document.createTextNode("Average Heart Rate: " + data[1]);

      avgHR.appendChild(textNode);

      if (data[0] == "[0]") {
        Swal.fire({
          title: "You won't be heart attacked",
          icon: "success",
        });
      } else {
        Swal.fire({
          title: "You won't be heart attacked",
          icon: "You must go to a doctor",
        });
      }
      // Handle the response from the Flask server
    })
    .catch((error) => {
      // Handle any error that occurs during the request
      console.error("Error:", error);
    });
}

postTheData();
