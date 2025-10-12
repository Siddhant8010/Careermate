const express = require("express");
const router = express.Router();

const { registerStudent } = require("../controller/form");

router.post("/registeration", registerStudent);

module.exports = router;
