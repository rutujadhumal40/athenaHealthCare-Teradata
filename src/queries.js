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

    const dataFromEthena = await axios
      .get(`https://api.preview.platform.athenahealth.com/v1/195900/patients`, {
        headers: { Authorization: `Bearer ${accessToken}` },
        params: { suffix: "Mr." },
      })
      .then((data) => {
        return data.data;
      })
      .catch(function (err) {
        console.log("ERROR", err);
      });

    return dataFromEthena;
  });
};

const getPatient = (cursor) => {
 // const sQuery = "SELECT * FROM testProject.testPatient";
 const sQuery = "SELECT * FROM testProject.testPatientComplete";

  try {
    cursor.execute(sQuery);
    const fetchedRows = cursor.fetchall();
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
            params: { suffix: "Mr."},
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
    var balance=[];

   /*  await updatedData.map((item) => {
      data12.push([item.suffix, item.firstname, item.lastname, item.status]);
    });  */
    await updatedData.map(async (item) => {
      //var obj={patientid: item.patientid}
      //balance.push(obj)
     //await item.balances.push(obj)
     //await balance.push(item.balances)
     /* item.donotcall==true ? item.donotcall=1:item.donotcall=0
     item.driverslicense==true ? item.driverslicense=1:item.driverslicense=0
     item.contactpreference_announcement_phone==true ? item.contactpreference_announcement_phone=1:item.contactpreference_announcement_phone=0
     item.guarantoraddresssameaspatient==true ? item.guarantoraddresssameaspatient=1:item.guarantoraddresssameaspatient=0
     item.portaltermsonfile==true ? item.portaltermsonfile=1:item.portaltermsonfile=0
     item.privacyinformationverified==true ? item.privacyinformationverified=1:item.privacyinformationverified=0
     item.emailexists==true ? item.emailexists=1:item.emailexists=0
     item.patientphoto==true ? item.patientphoto=1:item.patientphoto=0
     item.consenttotext==true ? item.consenttotext=1:item.consenttotext=0
     item.contactpreference_lab_phone==true ? item.contactpreference_lab_phone=1:item.contactpreference_lab_phone=0
 */

    delete item.balances;

  
    data12.push([item.patientid,
    item.firstname,
    item.lastname,
    item.suffix,
    item.countrycode,
    item.state,
    item.homephone,
    item.mobilephone,
    item.zip,
    item.dob,
    item.departmentid,
    item.status,
    ])
    }); 


    //console.log(balan)
  //  balance.map(item=>console.log(item))
  
   

    console.log("The fetched data is:",data12)
    await cursor.execute(
      "insert into testProject.testPatientComplete (?, ?, ?, ?,?,?,?,?,?,?,?,?)",
      data12
    ); 
    res.send("SUCCESS");
  } catch (error) {
    if (!anIgnoreError(error)) {
      throw error;
    }
  }
};


module.exports = {
  getPatient,
  addPatient,
  getPatientDataFromAthena,
};
