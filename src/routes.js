const { Router } = require('express');
const controller = require('./controller');

const router = Router();
router.get('/', controller.getPatientDataFromAthena);

router.get('/getData', controller.getPatient);
router.post('/add', controller.addPatient);
router.get('/getPrivacyInfo/:id',controller.getPatientPrivacyInfo);


module.exports = router;