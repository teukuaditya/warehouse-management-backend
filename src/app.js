const express = require("express");
const app = express();
const dotenv = require("dotenv");
dotenv.config();
const PORT = 3000;
const adminAuthorization = require("./middleware/adminAuthorization");
const cors = require("cors");

app.use(express.json());
app.use(cors());
app.get("/", (req, res) => {
  res.send("hello world");
});

const authController = require("./auth/auth.controller");
const materialController = require("./material/material.controller");
const spkController = require("./spk/spk.controller");
const userController = require("./user/user.controller");
const authorizeJWT = require("./middleware/authorizeJWT");

app.use("/api/auth", authController);
app.use("/api/materials", materialController);
app.use("/api/spk", spkController);
app.use("/api/user", authorizeJWT, userController);

app.listen(PORT, () => {
  console.log("server berjalan port : " + PORT);
});
