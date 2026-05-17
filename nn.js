export class NeuralNetwork {
  constructor(
    number_of_inputs,
    number_of_hidden_neurons,
    number_of_outputs,
    learning_rate = 0.01,
    bias = 0.1,
  ) {
    this.number_of_inputs = number_of_inputs;
    this.number_of_hidden_neurons = number_of_hidden_neurons;
    this.number_of_outputs = number_of_outputs;
    this.learning_rate = learning_rate;
    this.bias = bias;
    this.hidden_output = [];
    this.hidden_z = [];
    this.final_output = [];
  }
  relu(z) {
    return z > 0 ? z : 0;
  }
  forward_pass(inputs, weights_hidden, weights_output) {
    for (let i = 0; i < this.number_of_hidden_neurons; i++) {
      let sum = 0;
      for (let j = 0; j < this.number_of_inputs; j++) {
        sum += inputs[j] * weights_hidden[i][j];
      }
      sum += this.bias;
      this.hidden_z[i] = sum;
      this.hidden_output[i] = this.relu(sum);
    }

    for (let i = 0; i < this.number_of_outputs; i++) {
      let sum = 0;
      for (let j = 0; j < this.number_of_hidden_neurons; j++) {
        sum += this.hidden_output[j] * weights_output[i][j];
      }
      this.final_output[i] = sum + this.bias;
    }

    return this.final_output;
  }
}
