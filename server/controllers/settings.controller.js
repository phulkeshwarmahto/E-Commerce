import { Settings } from "../models/Settings.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";

export const getSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({});
    }
    return res.json(new ApiResponse(true, "Settings retrieved.", { settings: settings.toClient() }));
  } catch (err) {
    return res.status(500).json(new ApiResponse(false, err.message || "Failed to retrieve settings."));
  }
};
