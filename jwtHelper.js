const jwt = require("jsonwebtoken");
const fs = require("fs");
const crypto = require("crypto");
const privateKey = fs.readFileSync("private.pem");
const publicKey = fs.readFileSync("public.pem");

const njwt = require("njwt");

const jwtHelper = {
  issueJwt: () => {
    const clientId = "0oaeb95cxduUU6IZA297";
    const now = Math.floor(new Date().getTime() / 1000);
    const expire = new Date((now + 300) * 1000);

    const claims = {
      aud: "https://athena.okta.com/oauth2/aus2hfei6ookPyyCA297/v1/token",
    };

    const njwtToken = njwt
      .create(claims, privateKey, "RS256")
      // .setHeader("kid", "kid")
      .setIssuedAt(now)
      .setExpiration(expire)
      .setIssuer(clientId)
      .setSubject(clientId)
      .compact();

    const decoded = jwt.verify(njwtToken, publicKey);
    console.log("decoded", decoded);
    return njwtToken;
  },
};

module.exports = {
  jwtHelper,
};
