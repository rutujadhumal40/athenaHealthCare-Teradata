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

// const getPatientBillingInfo=(req,res)=>{

// }
const getDepartments=async(req,res)=>{
  console.log("Get Departments")
  await res.send(queries.getDepartments(cursor))
  return 'SUCCESS'
}

const addDepartment=async(req,res)=>{
  console.log("Add Departments")
  await queries.addDepartment(req, res, cursor);
  return "SUCCESS"
}

const addPatient = async (req, res) => {
  console.log("Add Patients")
 await queries.addPatient(req, res, cursor);

 return "SUCCESS"
};



module.exports = {
  getPatient,
  addPatient,
  getPatientDataFromAthena,
  getPatientPrivacyInfo,
  addDepartment,
  getDepartments
};
