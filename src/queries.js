const TeradataConnection = require("teradata-nodejs-driver/teradata-connection");
const TeradataExceptions = require("teradata-nodejs-driver/teradata-exceptions");
const utils = require("../utils");
const { default: axios } = require("axios");

const anIgnoreError = (error) => {
  var ignoreErrorCodes = [
    3526, // The specified index does not exist.
    3802, // Database '%VSTR' does not exist.
    3807, // Object '%VSTR' does not exist.
    3824, // Macro '%VSTR' does not exist.
    3913, // The specified check does not exist.
    4322, // Schema %VSTR does not exist # DR176193
    5322, // The specified constraint name '%VSTR' does not exist.
    5495, // Stored Procedure "%VSTR" does not exist.
    5589, // Function "%VSTR" does not exist.
    5620, // Role '%VSTR' does not exist.
    5623, // User or role '%VSTR' does not exist.
    5653, // Profile '%VSTR' does not exist.
    5901, // Replication Group '%VSTR' does not exist.
    6808, // Ordering is not defined for UDT '%TVMID'.
    6831, // UDT "%VSTR" does not exist.
    6834, // Method "%VSTR" does not exist.
    6849, // The UDT (%VSTR) does not have Transform, or does not have the specified Transform Group.
    6863, // Cast with specified source and target does not exist
    6934, // External Stored Procedure "%VSTR" does not exist.
    6938, // Authorization "%VSTR" does not exist.
    7972, // JAVA Stored Procedure "%VSTR" does not exist.
    9213, // Connect Through privilege for %VSTR not found
    9403, // Specified constraint name "%VSTR" does not exist
  ];

  if (error instanceof TeradataExceptions.OperationalError) {
    if (ignoreErrorCodes.includes(getErrorCode(error.message))) {
      return true;
    } else {
      return false;
    }
  } else {
    return false;
  }
};

const getErrorCode = (msg) => {
  var regex = /\[Error (\d+)\]/;
  var found = msg.match(regex);
  var errorCode = "";
  if (found && found.length > 0) {
    errorCode = found[1];
  }
  return parseInt(errorCode, 10);
};

const getPatientDataFromAthena = async (cursor) => {
  return await utils.get_access_token().then(async (data) => {
    console.log("EPIC_access_token", data);
    const accessToken = data.access_token;
    // await axios
    //   .get("https://api.preview.platform.athenahealth.com/v1/195900/patients", {
    //     // .get("https://api.preview.platform.athenahealth.com/v1/195900/ping", {
    //     headers: { Authorization: `Bearer ${accessToken}` },
    //     params: { dob: "03/19/1996", guarantordob: "03/19/1996" },
    //   })
    //   .then((data) => {
    //     console.log("DATA!!!!!!!", data.data);
    //   })
    //   .catch(function (err) {
    //     console.log("ERROR", err);
    //   });

    const data12 = await axios
      .get(`https://api.preview.platform.athenahealth.com/v1/195900/patients`, {
        headers: { Authorization: `Bearer ${accessToken}` },
        params: { suffix: "Mr." },
      })
      .then((data) => {
        //console.log("DATA!!!!!!!", data.data);
        return data.data;
      })
      .catch(function (err) {
        console.log("ERROR", err);
      });

    return data12;
    //console.log("DATA12" , data12);
  });
};

const getPatient = (cursor) => {
  console.log("INSIDE getPatient");
  const sQuery = "SELECT * FROM testProject.patient";
  console.log("sQuery", sQuery);
  try {
    console.log("INSIDE TRY BLOCK");
    cursor.execute(sQuery);
    const fetchedRows = cursor.fetchall();
    console.log("Fetched Rows Count: " + fetchedRows);
    return fetchedRows;
  } catch (error) {
    if (!anIgnoreError(error)) {
      throw error;
    }
  }
};

const addPatient = async (req, res, cursor) => {
  try {
    const updatedData = await utils.get_access_token().then(async (data) => {
      console.log("EPIC_access_token", data);
      const accessToken = data.access_token;
      const data12 = await axios
        .get(
          `https://api.preview.platform.athenahealth.com/v1/195900/patients`,
          {
            headers: { Authorization: `Bearer ${accessToken}` },
            params: { suffix: "Mr." },
          }
        )
        .then((data) => {
          return data.data.patients;
        })
        .catch(function (err) {
          console.log("ERROR", err);
        });
      return data12;
    });
    var data12 = [];
    await updatedData.map((item) => {
      data12.push([item.suffix, item.firstname, item.lastname, item.status]);
    });

    await cursor.execute(
      "insert into testProject.testPatient (?, ?, ?, ?)",
      data12
    );

    res.send("SUCCESS");
  } catch (error) {
    if (!anIgnoreError(error)) {
      throw error;
    }
  }
};

const getPatientById = `SELECT * FROM patientbasicinfo INNER JOIN patientfollowupappointments ON
  patientbasicinfo.patient_id = patientfollowupappointments.patient_id
  INNER JOIN patientbreastfeeding
  ON
  patientbasicinfo.patient_id = patientbreastfeeding.patient_id
  INNER JOIN patientpsychosocialassess
  ON
  patientbasicinfo.patient_id = patientpsychosocialassess.patient_id
  INNER JOIN patientsafespacing
  ON
  patientbasicinfo.patient_id = patientsafespacing.patient_id
  INNER JOIN patientvisit
  ON
  patientbasicinfo.patient_id = patientvisit.patient_id
  INNER JOIN patienteducationalmaterial
  ON
  patientbasicinfo.patient_id = patienteducationalmaterial.patient_id
  WHERE patientfollowupappointments.patient_id = $1`;

module.exports = {
  getPatient,
  addPatient,
  getPatientById,
  getPatientDataFromAthena,
};
