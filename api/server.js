import express from "express";
import cors from "cors";
import { loadWeights } from "../model.js";
import { NeuralNetwork } from "../nn.js";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.use(express.static(path.join(__dirname, "../public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

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
const app = express();

app.use(cors());
app.use(express.json());

const nn = new NeuralNetwork(124, 496, 8, 0.0001, 0.1);

app.post("/predict", (req, res) => {
  const { weights_hidden, weights_output } = loadWeights();
  const { features } = req.body;
  const rawOutput = nn.forward_pass(features, weights_hidden, weights_output);

  // Apply temperature scaling before sending
  const temperature = 0.1;
  const scaled = rawOutput.map((v) => v / temperature);
  const max = Math.max(...scaled);
  const exps = scaled.map((v) => Math.exp(v - max));
  const sum = exps.reduce((a, b) => a + b, 0);
  const predictedOutput = exps.map((v) => v / sum);

  const predicted = predictedOutput.indexOf(Math.max(...predictedOutput));
  const predictedLabel = labels[predicted];
  res.json({ predictedLabel, predictedOutput, predicted });
});
