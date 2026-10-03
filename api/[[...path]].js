// Vercel serverless entry for every /api/* route.
//
// Express apps are supported directly, so this mounts the shared router and
// nothing else. Note what is absent: any reference to dist/. The frontend is
// served as static output by the CDN, never through this function, so the built
// ESM chunks are never handed to the function bundler.
import express from "express";
import api from "./routes.js";

const app = express();
app.disable("x-powered-by");
app.use(express.json({ limit: "32kb" }));
app.use(api);

export default app;