import express from "express";
import cors from "cors";
import routes from "../routes";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// API роуты
app.use("/api", routes);

export default app;
