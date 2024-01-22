//accesing the inputs in the form
const form = document.querySelector("form");
const sexInput = document.querySelector("#sex");
const ageInput = document.querySelector("#age");
const currentSmokerInput = document.querySelector("#currenStmoker");
const cigsPerDayInput = document.querySelector("#cigsPerDay");
const BPMedsInput = document.querySelector("#BPMeds");
const prevalentStrokeInput = document.querySelector("#prevalentStroke");
const prevalentHypInput = document.querySelector("#prevalentHyp");
const diabetesInput = document.querySelector("#diabetes");
const BMIInput = document.querySelector("#BMI");
//saving data to local storage
function saveToLocalStorage(event) {
  //preventing the form from reloading the page
  event.preventDefault();

  //storing the data from the form in the local storage
  localStorage.setItem("sex", sexInput.value);
  localStorage.setItem("age", ageInput.value);
  localStorage.setItem("currentSmoker", currentSmokerInput.value);
  localStorage.setItem("cigsPerDay", cigsPerDayInput.value);
  localStorage.setItem("BPMeds", BPMedsInput.value);
  localStorage.setItem("prevalentStroke", prevalentStrokeInput.value);
  localStorage.setItem("prevalentHyp", prevalentHypInput.value);
  localStorage.setItem("diabetes", diabetesInput.value);
  localStorage.setItem("BMI", BMIInput.value);

  //reset the form
  form.reset();

  // redirect the user to the google oauth login screen
  goToLogIn();
}
//sending a get request to the backend server to get a login url
function goToLogIn() {
  fetch("/get-login-url", {
    method: "GET",
    headers: {
      "Content-Type": "application/json; charset=UTF-8",
    },
  })
    .then((response) => response.json())
    .then((data) => {
      // redirecting the user to the login url
      window.location.href = data.url;
    })
    .catch((error) => {
      // Handle any error that occurs during the request
      console.error("Error:", error);
    });
}
//sending the data to the backend server to use them in the AI model
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
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      // Handle the response from the Flask server
      for (let key in data) {
        console.log(key);
        console.log(data[key]);
      }
    })
    .catch((error) => {
      // Handle any error that occurs during the request
      console.error("Error:", error);
    });
}
