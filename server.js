//importing all important modules
import url from "url";
import { google } from "googleapis";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { PythonShell } from "python-shell";
import http from "http";
import bodyParser from "body-parser";
//making new application object and reading the env file and importing the file module to handle the path of static folder
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = process.env.NODE_PORT;
const app = express();

//new oauth object and identifying the client ID & secret & redirect URL
const oAuth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);
//setting static files
app.use(bodyParser.json());
app.use(express.static("public"));
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname + "/views/index.html"));
});
//the homepage login with offline type to get a refresh token
app.get("/get-login-url", (req, res) => {
  const url = oAuth2Client.generateAuthUrl({
    access_type: "offline",
    scope: process.env.GOOGLE_SCOPE,
  });
  res.json({ url });
});

//getting the token by exchanging the data in the request object after login in google oauth
app.get("/get-token", async (req, res, next) => {
  try {
    const { code } = url.parse(req.url, true).query;
    const { tokens } = await oAuth2Client.getToken(code);
    if (tokens.refresh_token) {
      oAuth2Client.setCredentials({ refresh_token: tokens.refresh_token });
      await oAuth2Client.refreshAccessToken();
    }
    res.redirect(`/login-success?token=${tokens.access_token}`);
  } catch (error) {
    next(error);
  }
});

//redirection after taking the token to a page that will send the data to get the BP and HR from its JS file
app.get("/login-success", (req, res) => {
  const accessToken = req.query.token;
  // sending this html success page
  res.sendFile(path.join(__dirname + "/views/success.html"));
});

//creating a route to get the prediction from the AI model
app.post("/predict", (req, res) => {
  const data = req.body; // Get the data from the request body
  // Configure the options for executing the Python script
  let options = {
    mode: "text",
    pythonOptions: ["-u"], // get print results in real-time
    scriptPath: "D:/Capstone/app-v2/model",
    args: [
      data.age,
      data.sex,
      data.cigsPerDay,
      data.sysBloodPressure,
      data.diasBloodPressure,
      data.currentSmoker,
      data.BPMeds,
      data.prevalentStroke,
      data.prevalentHyp,
      data.diabetes,
      data.BMI,
    ], // Pass the data as an argument
  };
  PythonShell.run("prediction.py", options).then((messages) => {
    // results is an array consisting of messages collected during execution
    res.json(messages);
  });
});

//midleware function which help in checking the authorization to all the coming routes
app.use((req, res, next) => {
  const token = req.headers?.authorization?.split(" ")[1];
  if (!token) {
    return next(new Error("Please provide a token to access this resource"));
  }
  req.token = token;
  next();
});
// using fit store ang getting steps after requesting them from success.js
// Set up your Fitness API options
const fitnessOptions = {
  addDataType: "HealthDataTypes.AGGREGATE_BLOOD_PRESSURE_SUMMARY",
  access: "FitnessOptions.ACCESS_READ",
  // Add other data types as needed
};

// error handler middleware
app.use((err, req, res, next) => {
  res.status(500).json({ error: err.message });
});

//making the app work
app.listen(PORT, () => {
  console.log(`App listening at ${PORT}`);
});
