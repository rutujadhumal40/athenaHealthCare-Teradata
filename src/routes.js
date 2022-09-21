const { Router } = require('express');
const controller = require('./controller');

const router = Router();
router.get('/', controller.getPatientDataFromAthena);

router.get('/getData', controller.getPatient);
router.post('/addPatients', controller.addPatient);
router.post('/addBalances', controller.addBalances);
router.get('/getBalance/:id', controller.getBalance);

router.get('/getPrivacyInfo/:id',controller.getPatientPrivacyInfo);
router.get('/getOpenAppointments/:id',controller.getOpenAppointments);

//router.get('./getPatientBillingInfo/',controller.getPatientBillingInfo)
router.post('/addDepartments', controller.addDepartment);
router.post('/addOpenAppointments', controller.addOpenAppointments);
router.post('/addAppointments/:id', controller.addAppointments);
router.get('/getAppointments/:id',controller.getAppointments);
router.post('/addInsurances/:id', controller.addInsurances);

router.get('/getDepartments',controller.getDepartments);
router.post('/addPatientAthena',controller.addPatientAthena);
router.post('/insertPatient',controller.insertPatient);


module.exports = router;