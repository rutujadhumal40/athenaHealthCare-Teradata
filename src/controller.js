const queries = require("./queries");
const { setupAndRun } = require("./helpers");

const cursor = setupAndRun();

//Patients

const getPatientDataFromAthena = async (req, res) => {
  const result = await res.send(queries.getPatientDataFromAthena(cursor));
  return result;
};

const getPatient = (req, res) => {
  const result = res.send(queries.getPatient(cursor));
  return result;
};

const getPatientPrivacyInfo = (req, res) => {
  const result = res.send(queries.getPatientPrivacyInfo(req.params.id, cursor));
  return result;
};

const insertPatient = async (req, res) => {
  const result = await queries.insertPatient(req.data, cursor);
  return result;
};

const addPatient = async (req, res) => {
  const result = await queries.addPatient(req, res, cursor);
  return result;
};

const addPatientAthena = async (req, res) => {
  const patient = await queries.addPatientAthena(req.body.values, cursor);
  res.json({
    patient_id: patient,
  });
  return patient;
};

//Appointments

const createNewAppointment = async (req, res) => {
  const result = await res.send(
    queries.createNewAppointment(
      req.params.patient_id,
      req.params.appointment_id,
      cursor
    )
  );
  return result;
};

const addOpenAppointments = async (req, res) => {
  const result = await queries.addOpenAppointments(req, res, cursor);
  return result;
};

const getOpenAppointments = (req, res) => {
  const result = res.send(queries.getOpenAppointments(req.params.id, cursor));
  return result;
};

const addAppointments = async (req, res) => {
  const result = await queries.addAppointments(req.params.id, res, cursor);
  return result;
};

const getAppointments = async (req, res) => {
  const result = await res.send(
    queries.getAppointments(req.params.patient_id, cursor)
  );
  return result;
};

const getAppointmentsById = async (req, res) => {
  const result = await res.send(
    queries.getAppointmentsById(
      req.params.patient_id,
      req.params.appointment_id,
      cursor
    )
  );
  return result;
};

//Departments

const addDepartment = async (req, res) => {
  const result = await queries.addDepartment(req, res, cursor);
  return result;
};

const getDepartments = async (req, res) => {
  const result = await res.send(queries.getDepartments(cursor));
  return result;
};

//Balances

const addBalances = async (req, res) => {
  const result = await queries.addBalances(req, res, cursor);
  return result;
};

const getBalance = async (req, res) => {
  const result = await res.send(queries.getBalance(req.params.id, cursor));
  return result;
};

//Insurances

const addInsurances = async (req, res) => {
  const result = await queries.addInsurances(req.params.id, res, cursor);
  return result;
};

const getInsurances = async (req, res) => {
  if (typeof req.params.id === undefined) return "Wrong Input Parameter";

  const result = await res.send(queries.getInsurances(req.params.id, cursor));
  return result;
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
  addInsurances,
  getInsurances,
  createNewAppointment,
  getAppointmentsById,
};
