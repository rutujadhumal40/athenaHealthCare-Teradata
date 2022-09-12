"use strict";
const { default: axios } = require("axios");

const express = require("express");
const cors = require("cors");
const patientRoutes = require("./src/routes");
const utils = require("./utils");

const app = express();

// middleware
app.use(cors());
app.use(express.json()); // req.body

const port = 6000;

app.use("/api/v1/patient", patientRoutes);

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
