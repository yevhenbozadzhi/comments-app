import express from "express";
import cors from "cors";
import helmet from "helmet";
import routes from "./routes/routes.js";
import path from "path";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import http from "http";
import { initSocket } from "./socket.js";
import { initializeSocket } from "./sockets/scokets.js";
import { rateLimiterMiddleware } from "./middleware/protect.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  }),
);
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));
app.use("/api", routes);
app.use(rateLimiterMiddleware);

const server = http.createServer(app);

const io = initSocket(server);
initializeSocket(io);

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
