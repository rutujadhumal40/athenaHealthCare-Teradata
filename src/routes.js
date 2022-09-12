const { Router } = require('express');
const controller = require('./controller');

const router = Router();
router.get('/', controller.getPatientDataFromAthena);

router.get('/getData', controller.getPatient);
router.post('/add', controller.addPatient);
// router.get('/:patient_id', controller.getPatientById);

module.exports = router;