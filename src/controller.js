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

const getOpenAppointments=(req,res)=>{
  var id=req.params.id
 res.send(queries.getOpenAppointments(id,cursor))
}

// const getPatientBillingInfo=(req,res)=>{

// }
const getDepartments=async(req,res)=>{
  console.log("Get Departments")
  await res.send(queries.getDepartments(cursor))
  return 'SUCCESS'
}

const addOpenAppointments=async(req,res)=>{
 // var id=req.params.id
  console.log("Add Open Appointments")

  await queries.addOpenAppointments(req, res, cursor);
  return "SUCCESS"
}

const addAppointments=async(req,res)=>{
  // var id=req.params.id
   console.log("Add Appointments by ID")
   await queries.addAppointments(req.params.id, res, cursor);
   return "SUCCESS"
 }

 const getAppointments=async(req,res)=>{
  console.log("Get Appointments", req.params.id)
  await res.send(queries.getAppointments(req.params.id,cursor))
  return 'SUCCESS'
}

const insertPatient=async(req,res)=>{
  console.log("Inserting Patient to Tera")
  var data=req.data
await queries.insertPatient(data,cursor)
}

const addPatientAthena=async(req,res)=>{
  console.log("Add Patient to Athena",req.body.values)
  const data=req.body.values;
  await queries.addPatientAthena(data,cursor);
  return "SUCCESS"
}
const addDepartment=async(req,res)=>{
  console.log("Add Departments")
  await queries.addDepartment(req, res, cursor);
  return "SUCCESS"
}

const addBalances= async(req,res)=>{
  console.log("Add Balances");
  await queries.addBalances(req, res, cursor);
  return 'SUCCESS'
}

const getBalance=async(req,res)=>{
  console.log("Get Balance", req.params.id)
  await res.send(queries.getBalance(req.params.id,cursor))
  return 'SUCCESS'
}

const addPatient = async (req, res) => {
  console.log("Add Patients")
 await queries.addPatient(req, res, cursor);

 return "SUCCESS"
};

const addInsurances = async (req, res) => {
  console.log("Add Insurances")
 await queries.addInsurances(req.params.id, res, cursor);

 return "SUCCESS"
};



module.exports = {
  getPatient,
  addPatient,
  getPatientDataFromAthena,
  getPatientPrivacyInfo,
  addDepartment,
  getDepartments,
  addOpenAppointments,
  getOpenAppointments,
  addPatientAthena,
  insertPatient,
  addBalances,
  getBalance,
  addAppointments,
  getAppointments,
  addInsurances
};
