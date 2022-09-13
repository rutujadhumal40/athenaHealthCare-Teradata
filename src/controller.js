const queries = require("./queries");
const { setupAndRun } = require("./helpers");

const cursor = setupAndRun();

const getPatientDataFromAthena = async (req, res) => {
  await res.send(queries.getPatientDataFromAthena(cursor));
};

const getPatient = (req, res) => {
  res.send(queries.getPatient(cursor));
};

const addPatient = async (req, res) => {
 await queries.addPatient(req, res, cursor);
 return "SUCCESS"
};

module.exports = {
  getPatient,
  addPatient,
  getPatientDataFromAthena,
};
