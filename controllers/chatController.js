const { GoogleGenerativeAI } = require('@google/generative-ai');
const { response } = require('express');

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

const sendMessage = async (req, res) => {
  try {
    const { message } = req.body;
    
  // Try a list of candidate models until one works
  const preferredModel = process.env.GOOGLE_GEMINI_MODEL && process.env.GOOGLE_GEMINI_MODEL.trim();
  const candidates = [
    preferredModel,
    "gemini-2.0-flash",
    "gemini-2.0-pro",
    "gemini-1.5-flash",
    "gemini-1.5-pro",
    "gemini-pro"
  ].filter(Boolean);

  const attemptErrors = [];
  for (const modelName of candidates) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(message);
      const response = await result.response;
      const text = response.text();
      return res.status(200).json({
        success: true,
        msg: "AI Response successfully",
        data: { model: modelName, response: text }
      });
    } catch (err) {
      attemptErrors.push({ model: modelName, error: err.message });
    }
  }


  return res.status(502).json({
    success: false,
    msg: "No supported Gemini model available for this API key",
    attemptedModels: candidates,
    errors: attemptErrors
  });
  } catch (error) {
    return res.status(500).json({
      success: false,
      msg: "Internal server error",
      error: error.message,
    });
  }
};



module.exports = {
  sendMessage,
};
