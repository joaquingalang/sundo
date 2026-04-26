const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require("dotenv");
dotenv.config({ path: ".env.local" });

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL || "gemini-1.5-flash" });

async function test() {
  try {
    const result = await model.generateContent("Hello, are you working?");
    const response = await result.response;
    console.log("Success:", response.text());
  } catch (err) {
    console.error("Error:", err.message);
  }
}

test();
