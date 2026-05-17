import Database from "better-sqlite3";
import path from "path";

export function loadWeights() {
  const hiddenPath = path.join(process.cwd(), "models", "weights_hidden.db");

  const outputPath = path.join(process.cwd(), "models", "weights_output.db");

  const saved_hidden = new Database(hiddenPath, { readonly: true });
  const saved_output = new Database(outputPath, { readonly: true });

  const hidden_row = saved_hidden
    .prepare("SELECT data FROM weights_hidden ORDER BY id DESC LIMIT 1")
    .get();

  const output_row = saved_output
    .prepare("SELECT data FROM weights_output ORDER BY id DESC LIMIT 1")
    .get();

  if (!hidden_row || !output_row) {
    throw new Error("No weight data found in DB");
  }

  const weights_hidden = JSON.parse(hidden_row.data.toString());
  const weights_output = JSON.parse(output_row.data.toString());

  saved_hidden.close();
  saved_output.close();

  return { weights_hidden, weights_output };
}
