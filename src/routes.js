const { Router } = require("express");
const controller = require("./controller");

const router = Router();

//Patient APIs
router.get("/", controller.getPatientDataFromAthena);
router.get("/getData", controller.getPatient);
router.post("/addPatients", controller.addPatient);
router.get("/getPrivacyInfo/:id", controller.getPatientPrivacyInfo);
router.post("/addPatientAthena", controller.addPatientAthena);
router.post("/insertPatient", controller.insertPatient);

//Appointment APIs
router.get("/getOpenAppointments/:id", controller.getOpenAppointments);
router.post("/addOpenAppointments", controller.addOpenAppointments);
router.post("/addAppointments/:id", controller.addAppointments);
router.get("/getAppointments/:patient_id", controller.getAppointments);
router.get("/getAppointment/:patient_id/:appointment_id", controller.getAppointmentsById);
router.get("/createNewAppointment/:patient_id/:appointment_id",controller.createNewAppointment);

//Balances APIs
router.post("/addBalances", controller.addBalances);
router.get("/getBalance/:id", controller.getBalance);

//Department APIs
router.post("/addDepartments", controller.addDepartment);
router.get("/getDepartments", controller.getDepartments);


//Insurance APIs
router.post("/addInsurances/:id", controller.addInsurances);
router.get("/getInsurances/:id", controller.getInsurances);

module.exports = router;
