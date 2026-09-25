const OpenAI = require("openai");

/**
 * POST /api/detect
 */
const detectBillboard = async (req, res) => {
  console.log("\n========================================");
  console.log("[DetectionController] 🚀 REQUEST RECEIVED");
  console.log("========================================");

  try {
    // ---------------------------------------------------------
    // STEP 0: Inspect incoming request
    // ---------------------------------------------------------
    console.log("[DetectionController] STEP 0 - Request reached controller");
    console.log("[DetectionController] Method:", req.method);
    console.log("[DetectionController] URL:", req.originalUrl);
    console.log(
      "[DetectionController] Content-Type:",
      req.headers["content-type"]
    );

    console.log(
      "[DetectionController] File received:",
      req.file
        ? {
            fieldname: req.file.fieldname,
            originalname: req.file.originalname,
            mimetype: req.file.mimetype,
            size: req.file.size,
            path: req.file.path,
          }
        : "❌ NO FILE"
    );

    // ---------------------------------------------------------
    // STEP 1: Check file
    // ---------------------------------------------------------
    console.log("[DetectionController] STEP 1 - Checking uploaded file...");

    if (!req.file) {
      console.error("[DetectionController] ❌ No file received in req.file");

      return res.status(400).json({
        success: false,
        error: "No photo uploaded",
      });
    }

    console.log("[DetectionController] ✅ File exists:", req.file.originalname);

    // ---------------------------------------------------------
    // STEP 2: Check HF token
    // ---------------------------------------------------------
    console.log("[DetectionController] STEP 2 - Checking HF_TOKEN...");

    if (!process.env.HF_TOKEN) {
      console.error("[DetectionController] ❌ HF_TOKEN is missing");

      return res.status(500).json({
        success: false,
        error: "HF_TOKEN is not configured in the backend environment.",
      });
    }

    console.log("[DetectionController] ✅ HF_TOKEN exists");

    // ---------------------------------------------------------
    // STEP 3: Cloudinary URL
    // ---------------------------------------------------------
    const imageUrl = req.file.path;

    console.log("[DetectionController] STEP 3 - Cloudinary URL:");
    console.log(imageUrl);

    if (!imageUrl) {
      console.error("[DetectionController] ❌ Cloudinary URL is missing");

      return res.status(500).json({
        success: false,
        error: "Cloudinary image URL is missing",
      });
    }

    console.log("[DetectionController] ✅ Cloudinary URL received");

    // ---------------------------------------------------------
    // STEP 4: Initialize OpenAI-compatible HF client
    // ---------------------------------------------------------
    console.log(
      "[DetectionController] STEP 4 - Initializing Hugging Face client..."
    );

    const client = new OpenAI({
      baseURL: "https://router.huggingface.co/v1",
      apiKey: process.env.HF_TOKEN,
    });

    console.log("[DetectionController] ✅ Hugging Face client initialized");

    // ---------------------------------------------------------
    // STEP 5: Prepare prompt
    // ---------------------------------------------------------
    console.log("[DetectionController] STEP 5 - Preparing AI prompt...");

    const prompt = `You are a billboard compliance inspector. Analyze this image and identify any potential billboard violations.

Respond with ONLY a valid JSON object in this exact format (no markdown, no extra text):
{
  "analysis": "A 1-2 sentence description of what you see in the image.",
  "violations": [
    { "type": "Size", "description": "Specific reason if the billboard exceeds size limits" },
    { "type": "Location", "description": "Specific reason if placed in a restricted zone" },
    { "type": "Content", "description": "Specific reason if content violates regulations" }
  ]
}

Only include violations that actually apply. If no violations are found, return an empty violations array with an analysis explaining why the billboard appears compliant.`;

    console.log("[DetectionController] ✅ Prompt prepared");

    // ---------------------------------------------------------
    // STEP 6: Call Qwen
    // ---------------------------------------------------------
    console.log("\n----------------------------------------");
    console.log("[DetectionController] STEP 6 - 🤖 CALLING QWEN");
    console.log("----------------------------------------");

    console.log("[DetectionController] Model:", "Qwen/Qwen3.8-27B:novita");

    console.log("[DetectionController] Image URL being sent:", imageUrl);

    const startTime = Date.now();

    const completion = await client.chat.completions.create({
      model: "Qwen/Qwen3.8-27B:novita",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: prompt,
            },
            {
              type: "image_url",
              image_url: {
                url: imageUrl,
              },
            },
          ],
        },
      ],
    });

    const elapsedTime = Date.now() - startTime;

    console.log(
      `[DetectionController] ✅ QWEN RESPONSE RECEIVED in ${elapsedTime}ms`
    );

    // ---------------------------------------------------------
    // STEP 7: Inspect Qwen response
    // ---------------------------------------------------------
    console.log("[DetectionController] STEP 7 - Inspecting model response...");

    console.log(
      "[DetectionController] Choices count:",
      completion.choices?.length
    );

    const rawText = (completion.choices?.[0]?.message?.content || "").trim();

    console.log("[DetectionController] Raw model response:");

    console.log(rawText);

    if (!rawText) {
      console.error("[DetectionController] ❌ Model returned empty response");
    }

    // ---------------------------------------------------------
    // STEP 8: Parse JSON
    // ---------------------------------------------------------
    console.log("[DetectionController] STEP 8 - Parsing model JSON...");

    let parsedResult;

    try {
      const jsonString = rawText
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

      parsedResult = JSON.parse(jsonString);

      console.log("[DetectionController] ✅ JSON parsed successfully");

      console.log("[DetectionController] Analysis:", parsedResult.analysis);

      console.log("[DetectionController] Violations:", parsedResult.violations);
    } catch (parseError) {
      console.error("[DetectionController] ❌ JSON parsing failed");

      console.error("[DetectionController] Parse error:", parseError.message);

      console.error("[DetectionController] Raw text:", rawText);

      parsedResult = {
        analysis: rawText,
        violations: [
          {
            type: "Analysis",
            description: rawText,
          },
        ],
      };
    }

    // ---------------------------------------------------------
    // STEP 9: Final response
    // ---------------------------------------------------------
    console.log("\n========================================");
    console.log("[DetectionController] STEP 9 - ✅ ANALYSIS COMPLETE");
    console.log(
      "[DetectionController] Violations found:",
      parsedResult.violations?.length || 0
    );
    console.log("[DetectionController] Sending response to mobile app...");
    console.log("========================================\n");

    return res.json({
      success: true,
      message: "Billboard analyzed successfully",
      imageUrl,
      analysis: parsedResult.analysis,
      violations: parsedResult.violations || [],
    });
  } catch (error) {
    // ---------------------------------------------------------
    // FATAL ERROR
    // ---------------------------------------------------------
    console.error("\n========================================");
    console.error("[DetectionController] 💥 FATAL ERROR");
    console.error("========================================");

    console.error("Message:", error.message);
    console.error("Name:", error.name);
    console.error("Status:", error.status);
    console.error("Code:", error.code);
    console.error("Type:", error.type);

    if (error.response) {
      console.error("Response status:", error.response.status);

      console.error("Response data:", error.response.data);
    }

    console.error("Stack:");
    console.error(error.stack);

    console.error("========================================\n");

    return res.status(500).json({
      success: false,
      error: "Server error during ML detection: " + error.message,
    });
  }
};

module.exports = { detectBillboard };
