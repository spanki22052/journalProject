import { createServer } from "http";
import app from "./app/http/app";
import { loadConfig } from "./config/env";

const config = loadConfig();
const server = createServer(app);

server.listen(config.PORT, () => {
  console.log(`Server listening on port ${config.PORT}`);
});
