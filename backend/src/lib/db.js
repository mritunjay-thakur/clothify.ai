import mongoose from "mongoose";

let cachedConnection = null;
let isSettingUpListeners = false;

export const connectDB = async () => {
  if (cachedConnection && mongoose.connection.readyState === 1) {
    return cachedConnection;
  }

  try {
    if (cachedConnection) {
      await mongoose.disconnect();
      mongoose.connection.removeAllListeners();
      cachedConnection = null;
    }

    const options = {
      maxPoolSize: 20,
      minPoolSize: 5,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000,
      retryWrites: true,
      retryReads: true,
    };

    cachedConnection = await mongoose.connect(process.env.MONGO_URI, options);

    if (!isSettingUpListeners) {
      isSettingUpListeners = true;

      mongoose.connection.on("connected", () => {
        console.log("MongoDB reconnected");
      });

      mongoose.connection.on("disconnected", () => {
        console.warn("MongoDB disconnected");
      });

      mongoose.connection.on("error", (err) => {
        console.error("MongoDB connection error:", err);
      });

      mongoose.connection.on("reconnectFailed", async () => {
        console.error("MongoDB reconnection failed");
        cachedConnection = null;
        await mongoose.disconnect();
      });
    }

    return cachedConnection;
  } catch (err) {
    console.error("Initial MongoDB connection failed:", err);
    cachedConnection = null;

    const retryAfter = 5000;
    console.log(`Retrying connection in ${retryAfter / 1000} seconds...`);
    await new Promise((resolve) => setTimeout(resolve, retryAfter));
    return connectDB();
  }
};
