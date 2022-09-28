const TeradataConnection = require("teradata-nodejs-driver/teradata-connection");
const TeradataExceptions = require("teradata-nodejs-driver/teradata-exceptions");
const utils = require("../utils");
const { default: axios } = require("axios");
const { all } = require("./routes");

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
  const sQuery = `SELECT * FROM testProject.testPatientComplete`;

  try {
    cursor.execute(sQuery);
    const fetchedRows = cursor.fetchall();
    const allPatient = [];
    fetchedRows.forEach((element) => {
      const [
        patient_id,
        first_name,
        last_name,
        suffix,
        country_code,
        state,
        homephone,
        mobilephone,
        zip,
        dob,
        department_id,
        status,
      ] = element;
      allPatient.push({
        patient_id: patient_id,
        firstname: first_name,
        lastname: last_name,
        suffix: suffix,
        countrycode: country_code,
        state: state,
        homephone: homephone,
        mobilephone: mobilephone,
        zip: zip,
        dob: dob,
        department_id: department_id,
        status: status,
      });
    });
    console.log(allPatient);

    return allPatient;
  } catch (error) {
    if (!anIgnoreError(error)) {
      throw error;
    }
  }
};

const getPatientPrivacyInfo = (id, cursor) => {
  var id = id;
  const sQuery = `Select * from testProject.patientPrivacyInfo where patient_id=${id}`;
  try {
    cursor.execute(sQuery);
    const fetchedRows = cursor.fetchall();
    console.log(`${id}:`, fetchedRows);
    return fetchedRows;
  } catch (error) {
    if (!anIgnoreError(error)) {
      throw error;
    }
  }
};

const getOpenAppointments = (id, cursor) => {
  var id = id;
  const sQuery = `Select * from testProject.openAppointments where department_id=${id}`;
  try {
    cursor.execute(sQuery);
    const fetchedRows = cursor.fetchall();
    console.log(`${id}:`, fetchedRows);
    const allOpenAppointments=[]
    fetchedRows.map((element) => {
      const [
        appointment_id,
        department_id,
        appointment_type,
        provider_id,
        start_time,
        duration,
        date,
      ] = element;
      allOpenAppointments.push({
        appointment_id,
        department_id,
        appointment_type,
        provider_id,
        start_time,
        duration,
        date,        
      })

    });
    console.log("Open Appointmnets",allOpenAppointments)
    return allOpenAppointments;
  } catch (error) {
    if (!anIgnoreError(error)) {
      throw error;
    }
  }
};

const addPatientAthena = async (data1, cursor) => {
  try {
    const updatedData = await utils.get_access_token().then(async (data) => {
      console.log("EPIC_access_token", data);
      console.log("Request Body Data:", data1);
      const abc = `suffix=${data1.suffix}&firstname=${data1.first_name}&lastname=${data1.last_name}&departmentid=${data1.department_id}&countrycode3166=${data1.country_code}&zip=${data1.zip}&dob=${data1.dob}&status=${data1.status}&state=${data1.state}`;
      console.log("abc", abc);
      const accessToken = data.access_token;
      const data12 = await axios({
        method: "post",
        url: `https://api.preview.platform.athenahealth.com/v1/195900/patients`,
        data: `suffix=${data1.suffix}&firstname=${data1.first_name}&lastname=${data1.last_name}&departmentid=${data1.department_id}&countrycode3166=${data1.country_code}&zip=${data1.zip}&dob=11/22/2003&status=${data1.status}&state=${data1.state}`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "content-type": "application/x-www-form-urlencoded",
        },
      })
        .then((data) => {
          console.log(data);
          data1 = { ...data1, patientid: data.data[0].patientid };
          insertPatient(data1, cursor);
          return data.data[0].patientid;
        })
        .catch(function (err) {
          console.log("ERROR", err);
        });
      return data12;
    });
    return updatedData;
  } catch (error) {
    if (!anIgnoreError(error)) {
      throw error;
    }
  }
};

const insertPatient = async (data, cursor) => {
  const sQuery = `insert into testProject.testPatientComplete (?, ?, ?, ?,?,?,?,?,?,?,?,?)`;

  const data12 = [];
  data12.push([
    data.patientid,
    data.suffix,
    data.first_name,
    data.last_name,
    data.country_code,
    data.state,
    data.home_phone,
    data.mobile_phone,
    data.zip,
    //data.dob,
    data.department_id,
    data.status,
    data.state,
  ]);
  try {
    cursor.execute(sQuery, data12);
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
    var balance = [];

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

      console.log(item.balances);

      data12.push([
        item.patientid,
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
      ]);
    });

    console.log("The fetched data is:", data12);
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

const addBalances = async (req, res, cursor) => {
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
    await updatedData.map(async (item1) => {
      item1.balances.map((item) => {
        data12.push([
          item1.patientid,
          item.balance.toString(),
          (item.cleanbalance = true
            ? (item.cleanbalance = 1)
            : (item.cleanbalance = 0)),
          item.providergroupid.toString(),
        ]);
      });

      //   data12.push([
      //     item.patientid,
      // item.firstname,
      // item.lastname,
      // item.suffix,
      // item.countrycode,
      // item.state,
      // item.homephone,
      // item.mobilephone,
      // item.zip,
      // item.dob,
      // item.departmentid,
      // item.status,
      //   ]);
    });

    console.log("The fetched data is:", data12);
    await cursor.execute("insert into testProject.balance (?, ?, ?,?)", data12);
    res.send("SUCCESS");
  } catch (error) {
    if (!anIgnoreError(error)) {
      throw error;
    }
  }
};

const getBalance = (id, cursor) => {
  //var dep_id=req.body.
  const sQuery = `Select * from testProject.balance where patient_id=${id}`;
  const allBalance = [];
  try {
    cursor.execute(sQuery);
    const fetchedRows = cursor.fetchall();
    console.log(`${id}:`, fetchedRows);
    fetchedRows.map((element) => {
      const [patient_id, balance, cleanbalance, providergroupid] = element;
      allBalance.push({
        patient_id: patient_id,
        balance: balance,
        cleanbalance: cleanbalance,
        providergroupid: providergroupid,
      });
    });
    console.log(allBalance);
    return allBalance;
  } catch (error) {
    if (!anIgnoreError(error)) {
      throw error;
    }
  }
};

const addDepartment = async (req, res, cursor) => {
  try {
    const updatedData = await utils.get_access_token().then(async (data) => {
      console.log("EPIC_access_token", data);
      const accessToken = data.access_token;
      const data12 = await axios
        .get(
          `https://api.preview.platform.athenahealth.com/v1/195900/departments`,
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          }
        )
        .then((data) => {
          return data.data.departments;
        })
        .catch(function (err) {
          console.log("ERROR", err);
        });
      return data12;
    });
    var data12 = [];
    await updatedData.map(async (item) => {
      data12.push([
        item.departmentid,
        item.name,
        item.state,
        item.city,
        item.timezonename,
      ]);
    });

    console.log("The fetched data is:", data12);
    await cursor.execute(
      "insert into testProject.department (?, ?, ?, ?,?)",
      data12
    );
    res.send("SUCCESS");
  } catch (error) {
    if (!anIgnoreError(error)) {
      throw error;
    }
  }
};

const addOpenAppointments = async (req, res, cursor) => {
  try {
    const updatedData = await utils.get_access_token().then(async (data) => {
      console.log("EPIC_access_token", data);
      const accessToken = data.access_token;
      const data12 = await axios
        .get(
          `https://api.preview.platform.athenahealth.com/v1/195900/appointments/open`,
          {
            headers: { Authorization: `Bearer ${accessToken}` },
            params: { reasonid: "-1", departmentid: 1 },
          }
        )
        .then((data) => {
          return data.data.appointments;
        })
        .catch(function (err) {
          console.log("ERROR", err);
        });
      return data12;
    });
    var data12 = [];
    await updatedData.map(async (item) => {
      data12.push([
        item.appointmentid.toString(),
        item.departmentid.toString(),
        item.appointmenttype,
        item.providerid.toString(),
        item.starttime,
        item.duration.toString(),
        item.date,
      ]);
    });

    console.log("The fetched data is:", data12);
    await cursor.execute(
      "insert into testProject.openAppointments (?, ?, ?, ?,?,?,?)",
      data12
    );
    res.send("SUCCESS");
  } catch (error) {
    if (!anIgnoreError(error)) {
      throw error;
    }
  }
};

const addAppointments = async (id, res, cursor) => {
  try {
    const updatedData = await utils.get_access_token().then(async (data) => {
      console.log("EPIC_access_token", data);
      const accessToken = data.access_token;
      const data12 = await axios
        .get(
          `https://api.preview.platform.athenahealth.com/v1/195900/patients/${id}/appointments`,
          {
            headers: { Authorization: `Bearer ${accessToken}` },
            params: { reasonid: "-1", departmentid: 1 },
          }
        )
        .then((data) => {
          console.log(data);
          return data.data.appointments;
        })
        .catch(function (err) {
          console.log("ERROR", err);
        });
      return data12;
    });
    var data12 = [];
    await updatedData.map(async (item) => {
      data12.push([
        id,
        item.appointmentid.toString(),
        item.departmentid.toString(),
        item.appointmenttype,
        item.providerid.toString(),
        item.starttime,
        item.duration.toString(),
        item.date,
      ]);
    });

    console.log("The fetched data is:", data12);
    await cursor.execute(
      "insert into testProject.appointments (?, ?, ?, ?,?,?,?,?)",
      data12
    );
    res.send("SUCCESS");
  } catch (error) {
    if (!anIgnoreError(error)) {
      throw error;
    }
  }
};

const getAppointments = (id, cursor) => {
  //var dep_id=req.body.
  var id = id;
  const sQuery = `Select * from testProject.appointments where patient_id=${id}`;
  try {
    cursor.execute(sQuery);
    const allAppointments = [];
    const fetchedRows = cursor.fetchall();
    console.log(`${id}:`, fetchedRows);
    fetchedRows.map(async (element) => {
      const [
        patientid,
        appointmentid,
        departmentid,
        appointmenttype,
        providerid,
        starttime,
        duration,
        date,
      ] = element;
      allAppointments.push({
        patientid: patientid,
        appointmentid: appointmentid,
        departmentid: getDepartmentName(departmentid, cursor),
        appointmenttype: appointmenttype,
        providerid: providerid,
        starttime: starttime,
        duration: duration,
        date: date,
      });
    });
    return allAppointments;
  } catch (error) {
    if (!anIgnoreError(error)) {
      throw error;
    }
  }
};

const getAppointmentsById = (patient_id, appointment_id, cursor) => {
  //var dep_id=req.body.
  var id = id;
  const sQuery = `Select * from testProject.appointments where patient_id=${patient_id} and appointment_id=${appointment_id}`;
  try {
    cursor.execute(sQuery);
    const allAppointments = [];
    const fetchedRows = cursor.fetchall();
   // console.log(`${id}:`, fetchedRows);
    fetchedRows.map(async (element) => {
      const [
        patientid,
        appointmentid,
        departmentid,
        appointmenttype,
        providerid,
        starttime,
        duration,
        date,
      ] = element;
      allAppointments.push({
        patientid: patientid,
        appointmentid: appointmentid,
        departmentid: getDepartmentName(departmentid, cursor),
        appointmenttype: appointmenttype,
        providerid: providerid,
        starttime: starttime,
        duration: duration,
        date: date,
      });
    });
    return allAppointments;
  } catch (error) {
    if (!anIgnoreError(error)) {
      throw error;
    }
  }
};

const createNewAppointment = (patient_id, appointment_id, cursor) => {
  let id = appointment_id.toString();
  const sQuery = `select * from testProject.openAppointments where appointment_id=${id}`;
  console.log(sQuery);
  try {
    cursor.execute(sQuery);
    const allAppointments = [];
    const fetchedRows = cursor.fetchall();
    //console.log(fetchedRows)
    const data12 = [];
    fetchedRows.map((item) =>
      data12.push(
        patient_id,
        item[0],
        item[1],
        item[2],
        item[3],
        item[4],
        item[5],
        item[6]
      )
    );
    console.log("Data 12:", data12);
    // fetchedRows.map(async (element1) => {
    // element1.map( (element)=>{
    //   allAppointments.push(
    //   patient_id,
    //   element.appointmentid,
    //   getDepartmentName(element.departmentid,cursor),
    //   element.appointmenttype,
    //   element.providerid,
    //   element.starttime,
    //   element.duration,
    //   element.date)
    //    })
    // });

    //console.log("The fetched data is:", allAppointments);
    // const data12=allAppointments.map(item=>{
    //   data12.push(
    //     item.patientid,
    //     item.appointmentid,
    //     item.departmentid,
    //     item.appointmenttype,
    //     item.providerid,
    //     item.starttime,
    //     item.duration
    //   )
    // })
    cursor.execute(
      "insert into testProject.appointments (?, ?, ?, ?,?,?,?,?)",
      data12
    );
    let appointments={}
    deleteOpenAppointment(appointment_id,cursor);
      data12.map(element=>{
        const[
              patientid,
              appointmentid,
              departmentid,
              appointmenttype,
              providerid,
              starttime,
              duration
            ]=element
        appointments={
          patientid,
              appointmentid,
              departmentid,
              appointmenttype,
              providerid,
              starttime,
              duration
        }
      })
   // console.log("Data Inserted in Appointments")
  // return data12;
   //const appointments=[]
  //  data12.map(element=>{
  //   const[
  //     patientid,
  //     appointmentid,
  //     departmentid,
  //     appointmenttype,
  //     providerid,
  //     starttime,
  //     duration
  //   ]=element

  //   appointments.push({
  //     patientid,
  //     appointmentid,
  //     departmentid,
  //     appointmenttype,
  //     providerid,
  //     starttime,
  //     duration
  //   })
  //  })
  return appointments;
  } catch (error) {
    if (!anIgnoreError(error)) {
      throw error;
    }
  }
};

const deleteOpenAppointment=(appointment_id,cursor)=>{
  try{
    cursor.execute(
      `delete from testProject.openAppointments where appointment_id=${appointment_id}`
    )
    console.log(`Appointment for ${appointment_id} deleted`)
  }
  catch (error) {
    if (!anIgnoreError(error)) {
      throw error;
    }
  }
}

const getDepartments = (cursor) => {
  // const sQuery = "SELECT * FROM testProject.testPatient";
  const sQuery = `SELECT * FROM testProject.department`;

  try {
    cursor.execute(sQuery);
    const fetchedRows = cursor.fetchall();
   // console.log(fetchedRows);
   const departments=[]
   fetchedRows.map(element=>{
    const[
      department_id,
      department_name,
      state,
      city,
      timezone
    ]=element;
    departments.push({
      department_id,
      department_name,
      state,
      city,
      timezone
    })
   })
    return departments;
  } catch (error) {
    if (!anIgnoreError(error)) {
      throw error;
    }
  }
};

const getDepartmentName = (id, cursor) => {
  const sQuery = `SELECT * FROM testProject.department where department_id=${id}`;
  try {
    cursor.execute(sQuery);
    const fetchedRows = cursor.fetchall();
    console.log(fetchedRows);
    var dept_name = fetchedRows.map((item) => {
      if (item[0] === id) return item[1];
    });
    console.log(dept_name);
    return dept_name[0];
  } catch (error) {
    if (!anIgnoreError(error)) {
      throw error;
    }
  }
};

const addInsurances = async (id, res, cursor) => {
  try {
    const updatedData = await utils.get_access_token().then(async (data) => {
      console.log("EPIC_access_token", data);
      const accessToken = data.access_token;
      const data12 = await axios
        .get(
          `https://api.preview.platform.athenahealth.com/v1/195900/appointments/${id}/insurances`,
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          }
        )
        .then((data) => {
          console.log(data.data.insurances);
          return data.data.insurances;
        })
        .catch(function (err) {
          console.log("ERROR", err);
        });
      return data12;
    });
    var data12 = [];
    await updatedData.map(async (item) => {
      data12.push([
        id,
        item.insuranceid,
        item.insurancepolicyholdersuffix,
        item.insurancepolicyholderfirstname,
        item.insurancepolicyholdermiddlename,
        item.insurancepolicyholderlastname,
        item.insurancepolicyholder,
        item.insurancepolicyholderdob,
        item.insurancepolicyholdersex,
        item.insurancepolicyholdercountrycode,
        item.insurancepolicyholderstate,
        item.insurancepolicyholdercity,
        item.insurancepolicyholderaddress1,
        item.insurancepolicyholderaddress2,
        item.insurancepolicyholderzip,
        item.policynumber,
        item.insuranceplanname,
        item.insurancetype,
        item.insurancephone,
        item.issuedate,
        item.expirationdate,
        item.eligibilitystatus,
        item.eligibilitylastchecked,
      ]);
    });

    console.log("The fetched data is:", data12);
    if (data12.length === 0) {
      res.send("Nothing to Insert.");
    } else {
      await cursor.execute(
        "insert into testProject.insurances (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
        data12
      );
      res.send("SUCCESS");
    }
  } catch (error) {
    if (!anIgnoreError(error)) {
      throw error;
    }
  }
};

const getInsurances = (id, cursor) => {
  //var dep_id=req.body.
  var id = id;
  const sQuery = `Select * from testProject.insurances where appointment_id=${id}`;
  try {
    cursor.execute(sQuery);
    const allAppointments = [];
    const fetchedRows = cursor.fetchall();
    //console.log(`${id}:`, fetchedRows);
    fetchedRows.map((element) => {
      const [
        appointment_id,
        insuranceid,
        insurancepolicyholdersuffix,
        insurancepolicyholderfirstname,
        insurancepolicyholdermiddlename,
        insurancepolicyholderlastname,
        insurancepolicyholder,
        insurancepolicyholderdob,
        insurancepolicyholdersex,
        insurancepolicyholdercountrycode,
        insurancepolicyholderstate,
        insurancepolicyholdercity,
        insurancepolicyholderaddress1,
        insurancepolicyholderaddress2,
        insurancepolicyholderzip,
        policynumber,
        insuranceplanname,
        insurancetype,
        insurancephone,
        issuedate,
        expirationdate,
        eligibilitystatus,
        eligibilitylastchecked,
      ] = element;
      allAppointments.push({
        appointment_id: appointment_id,
        insuranceid: insuranceid,
        insurancepolicyholdersuffix: insurancepolicyholdersuffix,
        insurancepolicyholderfirstname: insurancepolicyholderfirstname,
        insurancepolicyholdermiddlename: insurancepolicyholdermiddlename,
        insurancepolicyholderlastname: insurancepolicyholderlastname,
        insurancepolicyholder: insurancepolicyholder,
        insurancepolicyholderdob: insurancepolicyholderdob,
        insurancepolicyholdersex: insurancepolicyholdersex,
        insurancepolicyholdercountrycode: insurancepolicyholdercountrycode,
        insurancepolicyholderstate: insurancepolicyholderstate,
        insurancepolicyholdercity: insurancepolicyholdercity,
        insurancepolicyholderaddress1: insurancepolicyholderaddress1,
        insurancepolicyholderaddress2: insurancepolicyholderaddress2,
        insurancepolicyholderzip: insurancepolicyholderzip,
        policynumber: policynumber,
        insuranceplanname: insuranceplanname,
        insurancetype: insurancetype,
        insurancephone: insurancephone,
        issuedate: issuedate,
        expirationdate: expirationdate,
        eligibilitystatus: eligibilitystatus,
        eligibilitylastchecked: eligibilitylastchecked,
      });
    });
    console.log(allAppointments);
    return allAppointments;
  } catch (error) {
    if (!anIgnoreError(error)) {
      throw error;
    }
  }
};

const getPatientID = (cursor) => {};

module.exports = {
  getPatient,
  addPatient,
  getPatientDataFromAthena,
  getPatientPrivacyInfo,
  addDepartment,
  getDepartments,
  addOpenAppointments,
  getOpenAppointments,
  //insertPatient
  addPatientAthena,
  addBalances,
  getBalance,
  addAppointments,
  getAppointments,
  addInsurances,
  getInsurances,
  createNewAppointment,
  getAppointmentsById
};
