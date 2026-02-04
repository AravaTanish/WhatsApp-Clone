import mongoose from "mongoose";
const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGODB_URI}`,
    );
    console.log(
      `MongoDB Atlas connected successfully.\nDB HOST: ${connectionInstance.connection.host}`,
    );
  } catch (error) {
    console.log("MongoDB Atlas connection error:", error);
    process.exit(1);
  }
};

export default connectDB;
