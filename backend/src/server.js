import 'dotenv/config';
import express from "express";
import routes from "./routes.js";
import { errorHandler } from "./middleware/error.middleware.js";
import cors from "cors";

const app = express();

const allowedOrigins = [
    "http://localhost:3000",
    "https://kitchen-os-sdse.vercel.app",
    process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
    origin: true, // Dynamically allow whatever origin is making the request
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"],
    optionsSuccessStatus: 200
}));
app.use(express.json());
// app.use("/v1/auth", authRoutes);
app.get("/", (req, res) => {
    res.send("Health Check ok!");
});


routes(app);

app.use(errorHandler);

app.listen(4040, () => {
    console.log("Server started on port 4040");
});
