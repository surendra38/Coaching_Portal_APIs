const jwt = require("jsonwebtoken");
const jwttoken = "e-coaching";

verifyToken = (req, res, next) => {
  const token = req.headers["authorization"];
  if (token) {
    const token = token.split(" ")[1];
    jwt.verify(token, jwttoken, (err, valid) => {
      if (err) {
        res.status(401).send({ result: "Please provide valid token" });
      } else {
        next();
      }
    });
    res.status(403).send({ result: "Please add token with header" });
  }
};

module.exports = verifyToken();
