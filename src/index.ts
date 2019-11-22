require("module-alias/register");
import errorHandler from "errorhandler";

import service from "./service";

/**
 * Error Handler. Provides full stack - remove for production
 */
service.use(errorHandler());

/**
 * Start Express server.
 */

const server = service.listen(service.get("port"), () => {
  console.log(
    "  service is running at http://localhost:%d in %s mode",
    service.get("port"),
    service.get("env")
  );
  console.log("  Press CTRL-C to stop\n");
});
