const TeradataConnection = require("teradata-nodejs-driver/teradata-connection");
const TeradataExceptions = require("teradata-nodejs-driver/teradata-exceptions");
const utils = require("../utils");
const { default: axios } = require("axios");
const { all } = require("./routes");

//Error Handlers
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

//Patient
const addPatientAthena = async (patientData, cursor) => {
  try {
    const updatedData = await utils.get_access_token().then(async (data) => 
    {
      const abc = `suffix=${data1.suffix}&firstname=${data1.first_name}&lastname=${data1.last_name}&departmentid=${data1.department_id}&countrycode3166=${data1.country_code}&zip=${data1.zip}&dob=${data1.dob}&status=${data1.status}&state=${data1.state}`;
      const accessToken = data.access_token;
      const response = await axios({
        method: "post",
        url: `https://api.preview.platform.athenahealth.com/v1/195900/patients`,
        data: `suffix=${patientData.suffix}&firstname=${patientData.first_name}&lastname=${patientData.last_name}&departmentid=${patientData.department_id}&countrycode3166=${patientData.country_code}&zip=${patientData.zip}&dob=11/22/2003&status=${patientData.status}&state=${patientData.state}`,
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "content-type": "application/x-www-form-urlencoded",
        },
      })
        .then((data) => {
          patientData = { ...patientData, patientid: data.data[0].patientid };
          insertPatient(patientData, cursor);
          return data.data[0].patientid;
        })
        .catch(function (err) {
          console.log("ERROR", err);
        });
      return response;
    });
    return updatedData;
  } catch (error) {
    if (!anIgnoreError(error)) {
      throw error;
    }
  }
};

const getPatientDataFromAthena = async (cursor) => {
  return await utils.get_access_token().then(async (data) => {
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
        suffix,
        first_name,
        last_name,
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
    return allPatient;
  } catch (error) {
    if (!anIgnoreError(error)) {
      throw error;
    }
  }
};

const getPatientPrivacyInfo = (patient_id, cursor) => {
  const sQuery = `Select * from testProject.patientPrivacyInfo where patient_id=${patient_id}`;
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

const insertPatient = async (data, cursor) => {
  const sQuery = `insert into testProject.testPatientComplete (?, ?, ?, ?,?,?,?,?,?,?,?,?)`;
  const patientData = [];
  patientData.push([
    data.patientid,
    data.first_name,
    data.last_name,
    data.suffix,
    data.country_code,
    data.state,
    data.home_phone,
    data.mobile_phone,
    data.zip,
    data.dob,
    data.department_id,
    data.status,
  ]);
  try {
    cursor.execute(sQuery, patientData);
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
      const accessToken = data.access_token;
      const patient = await axios
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
      return patient;
    });
    var patientData = [];
    await updatedData.map(async (item) => {
      console.log(item.balances);
      patientData.push([
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
    await cursor.execute(
      "insert into testProject.testPatientComplete (?, ?, ?, ?,?,?,?,?,?,?,?,?)",
      patientData
    );
    res.send("SUCCESS");
  } catch (error) {
    if (!anIgnoreError(error)) {
      throw error;
    }
  }
};

//Appointments
const getOpenAppointments = (id, cursor) => {
  const sQuery = `Select * from testProject.openAppointments where department_id=${id}`;
  try {
    cursor.execute(sQuery);
    const fetchedRows = cursor.fetchall();
    const allOpenAppointments = [];
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
      });
    });
    return allOpenAppointments;
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
      const appointment = await axios
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
      return appointment;
    });
    var appointmentData = [];
    await updatedData.map(async (item) => {
      appointmentData.push([
        item.appointmentid.toString(),
        item.departmentid.toString(),
        item.appointmenttype,
        item.providerid.toString(),
        item.starttime,
        item.duration.toString(),
        item.date,
      ]);
    });
    await cursor.execute(
      "insert into testProject.openAppointments (?, ?, ?, ?,?,?,?)",
      appointmentData
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
      const appointment = await axios
        .get(
          `https://api.preview.platform.athenahealth.com/v1/195900/patients/${id}/appointments`,
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
      return appointment;
    });
    var appointmentData = [];
    await updatedData.map(async (item) => {
      appointmentData.push([
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
    await cursor.execute(
      "insert into testProject.appointments (?, ?, ?, ?,?,?,?,?)",
      appointmentData
    );
    res.send("SUCCESS");
  } catch (error) {
    if (!anIgnoreError(error)) {
      throw error;
    }
  }
};

const getAppointments = (id, cursor) => {
  const sQuery = `Select * from testProject.appointments where patient_id=${id}`;
  try {
    cursor.execute(sQuery);
    const allAppointments = [];
    const fetchedRows = cursor.fetchall();
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
  const sQuery = `Select * from testProject.appointments where patient_id=${patient_id} and appointment_id=${appointment_id}`;
  try {
    cursor.execute(sQuery);
    const allAppointments = [];
    const fetchedRows = cursor.fetchall();
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
  try {
    cursor.execute(sQuery);
    const allAppointments = [];
    const fetchedRows = cursor.fetchall();
    fetchedRows.map((item) =>
      allAppointments.push(
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
    cursor.execute(
      "insert into testProject.appointments (?, ?, ?, ?,?,?,?,?)",
      allAppointments
    );
    let appointments = {};
    deleteOpenAppointment(appointment_id, cursor);
    allAppointments.map((element) => {
      const [
        patientid,
        appointmentid,
        departmentid,
        appointmenttype,
        providerid,
        starttime,
        duration,
      ] = element;
      appointments = {
        patientid,
        appointmentid,
        departmentid,
        appointmenttype,
        providerid,
        starttime,
        duration,
      };
    });
    return appointments;
  } catch (error) {
    if (!anIgnoreError(error)) {
      throw error;
    }
  }
};

const deleteOpenAppointment = (appointment_id, cursor) => {
  try {
    cursor.execute(
      `delete from testProject.openAppointments where appointment_id=${appointment_id}`
    );
    console.log(`Appointment for ${appointment_id} deleted`);
  } catch (error) {
    if (!anIgnoreError(error)) {
      throw error;
    }
  }
};

//Balances
const addBalances = async (req, res, cursor) => {
  try {
    const updatedData = await utils.get_access_token().then(async (data) => {
      const accessToken = data.access_token;
      const balances = await axios
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
      return balances;
    });
    var patientBalances = [];
    await updatedData.map(async (patient) => {
      patient.balances.map((item) => {
        patientBalances.push([
          patient.patientid,
          item.balance.toString(),
          (item.cleanbalance = true
            ? (item.cleanbalance = 1)
            : (item.cleanbalance = 0)),
          item.providergroupid.toString(),
        ]);
      });
    });
    await cursor.execute("insert into testProject.balance (?, ?, ?,?)", patientBalances);
    res.send("SUCCESS");
  } catch (error) {
    if (!anIgnoreError(error)) {
      throw error;
    }
  }
};

const getBalance = (id, cursor) => {
  const sQuery = `Select * from testProject.balance where patient_id=${id}`;
  const allBalances = [];
  try {
    cursor.execute(sQuery);
    const fetchedRows = cursor.fetchall();
    fetchedRows.map((element) => {
      const [patient_id, balance, cleanbalance, providergroupid] = element;
      allBalances.push({
        patient_id: patient_id,
        balance: balance,
        cleanbalance: cleanbalance,
        providergroupid: providergroupid,
      });
    });
    return allBalances;
  } catch (error) {
    if (!anIgnoreError(error)) {
      throw error;
    }
  }
};

//Departments
const addDepartment = async (req, res, cursor) => {
  try {
    const updatedData = await utils.get_access_token().then(async (data) => {
      const accessToken = data.access_token;
      const department = await axios
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
      return department;
    });
    var allDepartments = [];
    await updatedData.map(async (item) => {
      allDepartments.push([
        item.departmentid,
        item.name,
        item.state,
        item.city,
        item.timezonename,
      ]);
    });
    await cursor.execute(
      "insert into testProject.department (?, ?, ?, ?,?)",
      allDepartments
    );
    res.send("SUCCESS");
  } catch (error) {
    if (!anIgnoreError(error)) {
      throw error;
    }
  }
};

const getDepartments = (cursor) => {
  const sQuery = `SELECT * FROM testProject.department`;

  try {
    cursor.execute(sQuery);
    const fetchedRows = cursor.fetchall();
    const departments = [];
    fetchedRows.map((element) => {
      const [department_id, department_name, state, city, timezone] = element;
      departments.push({
        department_id,
        department_name,
        state,
        city,
        timezone,
      });
    });
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

//Insurances
const addInsurances = async (id, res, cursor) => {
  try {
    const updatedData = await utils.get_access_token().then(async (data) => {
      const accessToken = data.access_token;
      const insurance = await axios
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
      return insurance;
    });
    var addInsurance = [];
    await updatedData.map(async (item) => {
      addInsurance.push([
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
    if (addInsurance.length === 0) {
      res.send("Nothing to Insert.");
    } else {
      await cursor.execute(
        "insert into testProject.insurances (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
        addInsurance
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
  const sQuery = `Select * from testProject.insurances where appointment_id=${id}`;
  try {
    cursor.execute(sQuery);
    const allInsurances = [];
    const fetchedRows = cursor.fetchall();
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
      allInsurances.push({
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
    return allInsurances;
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
  getPatientPrivacyInfo,
  addDepartment,
  getDepartments,
  addOpenAppointments,
  getOpenAppointments,
  addPatientAthena,
  addBalances,
  getBalance,
  addAppointments,
  getAppointments,
  addInsurances,
  getInsurances,
  createNewAppointment,
  getAppointmentsById,
};
