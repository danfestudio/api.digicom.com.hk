const mongoose = require("mongoose");

const URL = process.env.MONGO_DB_REMOTE;
const APP_NAME = process.env.APP_NAME;

console.log("MongoDB URL:", URL); // Debugging line
console.log("App Name:", APP_NAME); // Debugging line

const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

mongoose.Promise = global.Promise;

const connectDB = async () => {
  try {
    await mongoose.connect(URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(
      "------------------------------------------------------------------------------------------------------"
    );
    console.log(`✅ Successfully connected to database: ${APP_NAME}`);
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    process.exit(1); // Exit process with failure
  }
};

module.exports = connectDB;
