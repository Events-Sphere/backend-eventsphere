import express, { Application , Request, Router } from "express";
import * as dotenv from "dotenv";
import cors from "cors";
import V1 from "./V1/V1";
import path from "path";
import { ApiResponseHandler } from "./Middleware/apiResponseMiddleware";
import { connectToDatabase } from "./Config/knex";
import AuthRouter from './Routes/authRoute';

dotenv.config();

const app: Application = express();

const PORT = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));

const ENVIRONMENT = process.env.NODE_ENV || 3000;
const corseOptions = {origin: "*"};

app.use(express.static("public"));


app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors(corseOptions));


app.get("/", (_, res) => {
  res.send({
    version : '1.0.0'
  })
});


app.use("/auth", AuthRouter);
// impement verfytoken here
//app.use("/api/v1", verifyToken , V1);
app.use("/api/v1" , V1);


app.all("*", (req, res, next) => {
  ApiResponseHandler.notFound(res, `URL ${req.path} not found` , 404);
});

connectToDatabase();
app.listen(PORT, () => {
  const serverInfo = `\n------------------------------------------\n` +
  `🚀 Server is up and running!\n` +
  `🌐 URL: http://localhost:${PORT}\n` +
  `🌍 Environment: ${ENVIRONMENT}\n` +
  `------------------------------------------\n`;
console.log(serverInfo);
});