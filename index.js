import express from "express";
import AppRoutes from "./src/routes/index.js";
import cors from 'cors'
import dotenv from 'dotenv'
dotenv.config()

const PORT = process.env.PORT
const App = express();

App.use(cors());

App.use(express.json());

App.use("/",AppRoutes)





App.listen(PORT, () => console.log(`App is listening to port ${PORT}`));