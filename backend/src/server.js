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
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) {
            return callback(new Error('The CORS policy for this site does not allow access from the specified Origin.'), false);
        }
        return callback(null, true);
    },
    credentials: true,
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
