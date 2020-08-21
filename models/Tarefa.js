const mongoose = require('mongoose');

const TarefaSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true
  },
  descricao: {
    type: String,
    required: true
  },
  data: {
    type: Date,
    default: Date.now
  }
});

const Tarefa = mongoose.model('Tarefa', TarefaSchema);

module.exports = Tarefa;