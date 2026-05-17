import Database from "better-sqlite3";

export function loadWeights() {
  const saved_hidden = new Database("weights_hidden.db");
  const saved_output = new Database("weights_output.db");

  const hidden_row = saved_hidden
    .prepare("SELECT data FROM weights_hidden ORDER BY id DESC LIMIT 1")
    .get();
  const output_row = saved_output
    .prepare("SELECT data FROM weights_output ORDER BY id DESC LIMIT 1")
    .get();

  const weights_hidden = JSON.parse(hidden_row.data.toString());
  const weights_output = JSON.parse(output_row.data.toString());

  saved_hidden.close();
  saved_output.close();

  return { weights_hidden, weights_output };
}
