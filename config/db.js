const mongoose = require("mongoose");

const connectDb = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`Connect to DB ${conn.connection.host} `);
  } catch (error) {
    console.log(`Error in Db connection ${error.message}`);
    process.exit();
  }
};

module.exports = connectDb;
