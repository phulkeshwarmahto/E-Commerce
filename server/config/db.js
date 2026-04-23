export const connectDB = async () => {
  if (process.env.NODE_ENV !== "test") {
    console.log("Mock data store ready.");
  }
};
