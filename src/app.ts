import express from "express";
import cors from "cors";
import routes from "./routes/routes";
import { errorHandler } from "./middleware/errorHandling";
const app = express();

app.use(cors({
origin:"http://localhost:5173",
credentials:true
}));
app.use(express.json());

routes(app)


app.use(errorHandler)


export default app;
