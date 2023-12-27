import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const hashPassword = async (password) => {
  let salt = await bcrypt.genSalt(Number(process.env.SALT_ROUNDS));
  const hash = await bcrypt.hash(password, salt);
  return hash;
};

const hashCompare = async (password, hash) => {
  return await bcrypt.compare(password, hash);
};

const createToken = async (payload) => {
  const token = await jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
  return token;
};

const decodeToken = async (token) => {
  const payload = await jwt.decode(token);
  return payload;
};

const validate = async (req, res, next) => {
  let token = req.headers.authorization?.split(" ")[1];
  console.log(token);
  if (token) {
    let payload = await decodeToken(token);
    console.log(payload);

    let currentTime = +new Date() / 1000;
    if (currentTime < payload.exp);
    next();
  } else {
    res.status(400).send({
      message: "Token Not found",
    });
  }
};

const adminGuard = async (req, res, next) => {
  let token = req.headers.authorization?.split(" ")[1];

  if (token) {
    let payload = await decodeToken(token);
    if (payload.role === "admin") next();
  } else {
    res.status(400).send({
      message: "Only Admins are allowed",
    });
  }
};

export default {
  hashPassword,
  hashCompare,
  createToken,
  decodeToken,
  validate,
  adminGuard,
};
