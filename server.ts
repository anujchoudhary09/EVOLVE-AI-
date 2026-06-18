import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Initialize Gemini client safely with fallback
  const apiKey = process.env.GEMINI_API_KEY;
  const isRealKey = !!(apiKey && apiKey.trim() !== "" && apiKey !== "undefined" && apiKey !== "null" && !apiKey.toLowerCase().includes("placeholder") && !apiKey.toLowerCase().includes("your_api_key"));
  if (!isRealKey) {
    console.warn("WARNING: GEMINI_API_KEY is not defined or is a placeholder in environment variables.");
  }

  const ai = isRealKey
    ? new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      })
    : null;

  // API 1: Generate Roadmap
  app.post("/api/generate-roadmap", async (req, res) => {
    try {
      const { goal, targetDays, dailyMinutes, category, customDetails } = req.body;

      if (!goal) {
        return res.status(400).json({ error: "Goal is required to generate a roadmap." });
      }

      if (!ai) {
        // Fallback fallback mockup in case GEMINI_API_KEY is not configured yet (prevents crashing and allows offline use)
        return res.json(getMockRoadmap(goal, targetDays, dailyMinutes, category));
      }

      const prompt = `Create a realistic, highly encouraging, and structured 4-week roadmap template to help me achieve my goal.
      Goal: "${goal}"
      Category: "${category || "General"}"
      Target Duration: ${targetDays || 30} days
      Daily Commitment: ${dailyMinutes || 60} minutes
      Extra Details/Context: "${customDetails || "None"}"

      Provide 4 specific milestone weeks. For each week, define a title, a specific focus area, a main milestone achievement, and a list of 3 actionable daily tasks with estimated duration.
      Make sure the tasks are specific to this exact goal.
      For example, if the goal is "Learn Flutter" under Category "Career", make the tasks about flutter widgets, dart basics, building a simple stateful app, etc.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: "You are the user's Future Successful Self. You successfully accomplished this exact goal and are now helping them outline their journey. Your suggestions are realistic, and highly practical. Always respond in valid structured JSON.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              weeks: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    weekNumber: { type: Type.INTEGER, description: "The week number, 1 through 4" },
                    weekTitle: { type: Type.STRING, description: "Theme of this week, e.g. 'Foundations of Dart' or 'Cardio Blast'" },
                    focus: { type: Type.STRING, description: "Brief focus statement" },
                    milestoneTitle: { type: Type.STRING, description: "Milestone goal for this week" },
                    milestoneDescription: { type: Type.STRING, description: "Brief details of what they accomplish by the end of this week" },
                    tasks: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          id: { type: Type.STRING, description: "Unique task ID e.g. t1, t2, t3" },
                          title: { type: Type.STRING, description: "Specific actionable task name" },
                          estimatedTime: { type: Type.STRING, description: "Recommended time to spend, e.g. '30m' or '1h'" }
                        },
                        required: ["id", "title", "estimatedTime"]
                      }
                    }
                  },
                  required: ["weekNumber", "weekTitle", "focus", "milestoneTitle", "milestoneDescription", "tasks"]
                }
              }
            },
            required: ["weeks"]
          }
        }
      });

      const responseText = response.text;
      if (!responseText) {
        throw new Error("No response text received from Gemini.");
      }

      const generatedData = JSON.parse(responseText.trim());
      res.json(generatedData);
    } catch (error: any) {
      console.error("Error generating roadmap:", error);
      res.status(500).json({
        error: "Failed to generate roadmap via AI.",
        details: error.message,
        fallback: getMockRoadmap(req.body.goal || "My Goal", req.body.targetDays || 30, req.body.dailyMinutes || 60, req.body.category || "General")
      });
    }
  });

  // API 2: Generate Motivation Quote
  app.post("/api/generate-motivation", async (req, res) => {
    const { goal, progress, category } = req.body;
    try {

      if (!goal) {
        return res.status(400).json({ error: "Goal is required." });
      }

      if (!ai) {
        return res.json({
          message: `Keep pushing forward! Every single daily challenge you complete brings us closer to achieving "${goal}". I am cheering for you from the finish line!`
        });
      }

      const prompt = `As the Future Successful Self of the user, write a single short, emotionally resonant, and electric message of motivation.
      The user is working hard right now on their goal of "${goal}" in the category of "${category || "General"}".
      Their current progress is physically ${progress || 0}% complete.
      Speak directly in the first person (using "I", "me", "you") as the version of them who succeeded. Refrain from cliches. Be incredibly inspiring, gritty, and warm. Match the vibe of an Apple / Nike advertisement - short, punchy, real. Maximum 2 sentences.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction: "You are the user's Future Self, having fully mastered and accomplished their goals. Keep your message to 2 lines max, deeply motivating and human."
        }
      });

      res.json({ message: response.text?.trim() || "You are doing amazing. I can feel the momentum from here!" });
    } catch (error: any) {
      console.error("Error generating motivation:", error);
      res.json({
        message: `I'm watching your progress on "${goal}" with pride. Every minute you invest right now contributes directly to the success we are living. Keep going!`
      });
    }
  });

  // API 3: Generate Chat Response
  app.post("/api/generate-chat", async (req, res) => {
    try {
      const { chatHistory, userInput, goal, progress, category } = req.body;

      if (!userInput) {
        return res.status(400).json({ error: "UserInput is required." });
      }

      if (!ai) {
        return res.json({
          response: `Hey! I am fully with you on this journey to "${goal || "master your craft"}". Even though we are offline or the AI key is being configured, believe in the effort you're putting in today. What's the next task we are crushing?`
        });
      }

      const systemPrompt = `You are "Future Me" - the user's successful, future self who accomplished the goal of "${goal || "Personal Growth"}" (Category: "${category || "General"}").
      The user's current progress is ${progress || 0}%.
      You are highly successful, confident, deeply caring, wise, and grounded. You look back at the user's current struggles with extreme love and gratitude.
      Talk to the user. Speak like a real human, not like an assistant. Make references to their progress of ${progress}%. Be motivational, and use first-person pronouns ("I achieved this because of your hard work right now", "I remember when we felt like giving up here").
      If they say they are lazy, highlight the discipline that we built.
      Keep responses brief and punchy, usually under 3 sentences, unless they ask for a detailed strategy. Use simple human language. No robotic greetings.`;

      // Structure contents with history
      const formattedHistory = (chatHistory || []).map((msg: any) => ({
        role: msg.role === "assistant" ? "model" as const : "user" as const,
        parts: [{ text: msg.text }]
      }));

      // Append current message
      formattedHistory.push({
        role: "user" as const,
        parts: [{ text: userInput }]
      });

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: formattedHistory,
        config: {
          systemInstruction: systemPrompt,
          temperature: 0.8
        }
      });

      res.json({ response: response.text?.trim() || "I am right here with you. Never doubt your potential." });
    } catch (error: any) {
      console.error("Error in chat API:", error);
      res.status(500).json({ error: "Chat generation failed.", details: error.message });
    }
  });

  // Serve static files in production / Vite middleware in dev
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Evolve AI local server running on http://localhost:${PORT}`);
  });
}

// Fallback roadmap mock generator
function getMockRoadmap(goal: string, targetDays: number, dailyMinutes: number, category: string) {
  return {
    weeks: [
      {
        weekNumber: 1,
        weekTitle: "Core Foundations & Setup",
        focus: "Establishing the fundamental daily habits and learning the basics.",
        milestoneTitle: "Launch Initial Environment",
        milestoneDescription: "Establish a clear workspace and master core terminology/framework basics.",
        tasks: [
          { id: "t1_w1", title: "Setup workspace and study materials", estimatedTime: "30m" },
          { id: "t2_w1", title: "Complete introduction tutorial", estimatedTime: "45m" },
          { id: "t3_w1", title: "Build a mini prototype or draft first notes", estimatedTime: "1h" }
        ]
      },
      {
        weekNumber: 2,
        weekTitle: "Intermediate Implementation",
        focus: "Applying basics in real exercises and practical structures.",
        milestoneTitle: "Build First Practical Piece",
        milestoneDescription: "Apply theoretical lessons to write real pieces or perform complex exercises.",
        tasks: [
          { id: "t1_w2", title: "Implement intermediate drills/concepts", estimatedTime: "45m" },
          { id: "t2_w2", title: "Debug initial errors and review feedback", estimatedTime: "30m" },
          { id: "t3_w2", title: "Assemble a functional checkpoint", estimatedTime: "1h 15m" }
        ]
      },
      {
        weekNumber: 3,
        weekTitle: "Advanced Integration",
        focus: "Expanding features and performing high-intensity challenges.",
        milestoneTitle: "Connect the Ecosystem",
        milestoneDescription: "Deploy or perform key complex interactions and improve overall structure.",
        tasks: [
          { id: "t1_w3", title: "Connect APIs / Add complex elements", estimatedTime: "1h" },
          { id: "t2_w3", title: "Refactor structure and streamline bottlenecks", estimatedTime: "45m" },
          { id: "t3_w3", title: "Simulate real-world conditions or mock exam", estimatedTime: "1h 30m" }
        ]
      },
      {
        weekNumber: 4,
        weekTitle: "Optimization & Delivery",
        focus: "Polishing details, finalizing features, and looking ahead.",
        milestoneTitle: "Complete Success Checkpoint",
        milestoneDescription: "Perform full delivery, publish, test, and celebrate completion.",
        tasks: [
          { id: "t1_w4", title: "Complete comprehensive polish and quality checks", estimatedTime: "1h" },
          { id: "t2_w4", title: "Deliver final elements / Complete final test", estimatedTime: "45m" },
          { id: "t3_w4", title: "Review with Future Self and celebrate milestone", estimatedTime: "30m" }
        ]
      }
    ]
  };
}

startServer();
