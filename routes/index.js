const express = require('express')
const router = express.Router();
const { ensureAuthenticated } = require('../config/auth')

//Página inicial
router.get('/', (req, res) => res.render('inicio'))

//Página de tarefas do usuário
router.get('/todos', ensureAuthenticated, (req, res) => {

  //Passa o e-mail do usuário para o request
  const email = req.user.email;

  // Modelo de tarefa
  const Tarefa = require('../models/Tarefa')
  Tarefa.find({ email: email }).then(tarefas => {
    if (tarefas.length>0) { //Se encontrou tarefas, renderiza a pagina to-dos com elas
      console.log("Achou tarefas")
      res.render('todos', {
        tarefas: tarefas,
        user: req.user
      }) 
    } else { //Se não, passa apenas o usuário
      console.log("Não achou tarefas")
      console.log(req.user)
      res.render('todos', {
        tarefas: "Esse usuário não tem nenhuma tarefa cadastrada",
        user: req.user
      }) 
    }
})});

module.exports = router;