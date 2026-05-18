import express from "express";
import cors from "cors";
import { loadWeights } from "../model.js";
import { NeuralNetwork } from "../nn.js";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const app = express(); // ✅ MUST be first

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// middleware
app.use(cors());
app.use(express.json());
app.use(express.static(join(__dirname, "../public")));

const labels = [
  "analyst_error",
  "instrument_malfunction",
  "standard_reagent_issue",
  "raw_material_deviation",
  "process_variation",
  "equipment_failure",
  "environmental_condition",
  "sampling_error",
];

const nn = new NeuralNetwork(124, 992, 8, 0.0001, 0.1);

app.get("/", (req, res) => {
  res.sendFile(join(__dirname, "../public/index.html"));
});

app.post("/predict", (req, res) => {
  try {
    const { weights_hidden, weights_output } = loadWeights();
    const { features } = req.body;

    const rawOutput = nn.forward_pass(features, weights_hidden, weights_output);

    const temperature = 0.1;
    const scaled = rawOutput.map((v) => v / temperature);
    const max = Math.max(...scaled);
    const exps = scaled.map((v) => Math.exp(v - max));
    const sum = exps.reduce((a, b) => a + b, 0);
    const predictedOutput = exps.map((v) => v / sum);

    const predicted = predictedOutput.indexOf(Math.max(...predictedOutput));
    const predictedLabel = labels[predicted];

    res.json({ predictedLabel, predictedOutput, predicted });
  } catch (err) {
    console.error("Prediction error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

export default app;
