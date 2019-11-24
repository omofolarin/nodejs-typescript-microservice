import express from "express";
import fs from "fs";
import compression from "compression"; // compresses requests
import session from "express-session";
import bodyParser from "body-parser";
import lusca from "lusca";
import mongo from "connect-mongo";
import path from "path";
import mongoose from "mongoose";
import bluebird from "bluebird";
import { MONGODB_URI, SESSION_SECRET } from "./util/secrets";
import serviceRoutes from "./service-routes";

const MongoStore = mongo(session);

// Create Express server
const service = express();

// Connect to MongoDB
const mongoUrl = MONGODB_URI;
mongoose.Promise = bluebird;
console.log(mongoUrl);
mongoose
  .connect(mongoUrl, {
    useNewUrlParser: true,
    useFindAndModify: false,
    useCreateIndex: true,
    useUnifiedTopology: true
  })
  .then(() => {
    /** ready to use. The `mongoose.connect()` promise resolves to undefined. */
  })
  .catch(err => {
    console.log(
      `MongoDB connection error. Please make sure MongoDB is running. ${err}`
    );
    // process.exit();
  });

// Express configuration
service.set("port", process.env.PORT || 8080);
service.use(compression());
service.use(bodyParser.json());
service.use(bodyParser.urlencoded({ extended: true }));
service.use(
  session({
    resave: true,
    saveUninitialized: true,
    secret: SESSION_SECRET,
    store: new MongoStore({
      url: mongoUrl,
      autoReconnect: true
    })
  })
);

service.use(lusca.xframe("SAMEORIGIN"));
service.use(lusca.xssProtection(true));
service.use((req, res, next) => {
  res.locals.user = (req as any).user;
  next();
});

/**
 * Primary service routes.
 */

service.get("/", async (req, res, next) => {
  const getApiVersion = (res: any) => {
    fs.readFile(path.resolve(__dirname, "../package.json"), (err, data) => {
      if (err) throw err;
      const packageJson = JSON.parse(data.toString());
      const { version } = packageJson;
      res.status(200).send(`Api Version - ${version}`);
    });
  };
  getApiVersion(res);
});

service.use("/api", serviceRoutes);

export default service;
