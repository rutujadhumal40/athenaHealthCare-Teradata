const { Router } = require('express');
const controller = require('./controller');

const router = Router();
router.get('/', controller.getPatientDataFromAthena);

router.get('/getData', controller.getPatient);
router.post('/addPatients', controller.addPatient);
router.get('/getPrivacyInfo/:id',controller.getPatientPrivacyInfo);
//router.get('./getPatientBillingInfo/',controller.getPatientBillingInfo)
router.post('/addDepartments', controller.addDepartment);
router.get('/getDepartments',controller.getDepartments)

module.exports = router;