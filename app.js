require("dotenv").config();
const express = require("express");
const http = require("http");
const cors = require("cors");
const path = require("path");
const connectDB = require("./src/database/db");
const userModel = require("./src/modules/user/user.model");
const featureProductModel = require("./src/modules/featureProduct/featureProduct.model");

const app = express();

// Connect to MongoDB and start the server
const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();

    // Check for Super Admin and create if not exists
    console.log("Checking for Super Admin...");
    const checkSuperAdmin = await userModel.findOne({
      email: "superadmin@digicom.com",
      role: "superadmin",
    });
    console.log("Super Admin check complete:", checkSuperAdmin);

    if (!checkSuperAdmin) {
      await userModel.create({
        email: "superadmin@digicom.com",
        role: "superadmin",
        firstname: "Super",
        lastname: "Admin",
        hash: "$2a$10$YL1LurPkeUu41HWk1bMg8uSOxY6ScQYF0M44eqNUl6LhO5t06uaTy",
      });
    }

    console.log("Checking for Latest Product...");
    const checkLatestProduct = await featureProductModel.findOne({
      feature_name: "722eb324-1ce5-4200-862f-0dd0894a3568",
    });
    console.log("Latest Product check complete:", checkLatestProduct);

    if (!checkLatestProduct) {
      await featureProductModel.create({
        feature_name: "722eb324-1ce5-4200-862f-0dd0894a3568",
        order: 0,
      });
    }

    console.log("Setting up CORS...");
    const allowedOrigins = process.env.URL ? process.env.URL.split(",") : [];
    console.log("Allowed Origins:", allowedOrigins);

    app.use(
      cors({
        origin: function (origin, callback) {
          const allowedOrigins = [
            'http://94.136.185.141:3000', // Frontend
            'http://94.136.185.141:8888', // Backend (if called directly)
            'http://api.digicom.com.hk',
            'http://digicom.com.hk'         
            
          ].concat(process.env.URL ? process.env.URL.split(",") : []);
    
          if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
          } else {
            callback(new Error("Not allowed by CORS"));
          }
        },
        credentials: true
      })
    );

    console.log("CORS setup complete.");

    console.log("Setting up JSON middleware...");
    app.use(express.json({ limit: "50mb" }));
    console.log("JSON middleware setup complete.");

    console.log("Setting up URL-encoded middleware...");
    app.use(
      express.urlencoded({
        extended: false,
        limit: "50mb",
      })
    );
    console.log("URL-encoded middleware setup complete.");

    console.log("Setting up static file serving...");
    app.use("/", express.static(path.join(__dirname, "./public/uploads/")));
    console.log("Static file serving setup complete.");

    // Define a default route to check if the server is connected
    app.get("/", (req, res) => {
      res.send("Connected");
    });

    console.log("Setting up routes...");
    const router = require("./src/routes/allRoutes");
    app.use("/api", router);
    console.log("Routes setup complete.");

    // Error handling middleware
    app.use((err, req, res, next) => {
      res.status(500).json({
        success: false,
        message: err.message || "Internal Server Error!!",
      });
    });

    const port = process.env.PORT || 8888;
    const url = process.env.URL;
    const env = process.env.ENV;
    const app_name = process.env.APP_NAME;

    const server = http.createServer(app);

    // Handle uncaught exceptions
    process.on("uncaughtException", (err) => {
      console.log("Uncaught Exception occurred:", err);
    });

    server.listen(port, () => {
      console.log(`Server is starting at port ${port} || SUCCESS`);
      console.log(`Hosting at ${url}:${port} || SUCCESS`);
      console.log(`${app_name} is running on env ${env} || SUCCESS`);
      console.log(
        "--------------------------------------------------------------------------------------------------------------------------------------------------"
      );
    });

    // Handle unhandled rejections
    process.on("unhandledRejection", (err) => {
      console.log("Unhandled Rejection occurred:", err);
    });
  } catch (error) {
    console.error("Error during MongoDB connection or setup:", error);
    process.exit(1); // Exit the process if there's an error
  }
};

app.use((err, req, res, next) => {
  console.error("Global error handler:", err);
  res.status(500).json({ error: "Internal Server Error" });
});

// Start the server
startServer();
