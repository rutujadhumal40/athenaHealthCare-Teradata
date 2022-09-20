const queries = require("./queries");
const { setupAndRun } = require("./helpers");

const cursor = setupAndRun();

const getPatientDataFromAthena = async (req, res) => {
  await res.send(queries.getPatientDataFromAthena(cursor));
};

const getPatient = (req, res) => {
  res.send(queries.getPatient(cursor));
};

const getPatientPrivacyInfo=(req,res)=>{
  var id=req.params.id
 res.send(queries.getPatientPrivacyInfo(id,cursor))
}

const addPatient = async (req, res) => {
  console.log("ADD")
 await queries.addPatient(req, res, cursor);

 return "SUCCESS"
};



module.exports = {
  getPatient,
  addPatient,
  getPatientDataFromAthena,
  getPatientPrivacyInfo
};
