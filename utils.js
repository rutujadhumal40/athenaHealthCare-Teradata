const axios = require("axios");
const { jwtHelper } = require("./jwtHelper");

let clientId = "0oaeb95cxduUU6IZA297";
const ClientSecret = "4n7aUbDbBrbpGp9-cTW6KuqzeNLaHZXk_BO_p787";

const get_access_token = async () => {
  try {
    const access_token = await axios({
      method: "post",
      url: `https://api.preview.platform.athenahealth.com/oauth2/v1/token`,
      data: "grant_type=client_credentials&scope=system/Patient.read",
      headers: {
        authorization:
          "Basic " +
          Buffer.from(clientId + ":" + ClientSecret).toString("base64"),
      },
    });
    return access_token.data;
  } catch (error) {
    console.log("get access token failed", error);
  }
};

module.exports = { get_access_token };
