const express = require('express')
const bcrypt = require('bcryptjs');
const passport = require('passport');
const router = express.Router();

// Modelo de usuário
const Usuario = require('../models/Usuario');
const { forwardAuthenticated, ensureAuthenticated } = require('../config/auth');

// Modelo de tarefa
const Tarefa = require('../models/Tarefa')

//Página de login
router.get('/login', forwardAuthenticated, (req, res) => res.render('login'))
//Página de registro de usuários
router.get('/registrar', forwardAuthenticated, (req, res) => res.render('registrar'))
// Registrar usuário
router.post('/registrar', (req, res) => {
  const { nome, email, senha, senha2 } = req.body;

  //Validar erros no preenchimento do formulário
  let errors = [];

  if (!nome || !email || !senha || !senha2) {
    errors.push({ msg: 'Preencha todos os campos.' });
    console.log(senha)
    console.log(senha2)
  }

  if (senha != senha2) {
    errors.push({ msg: 'As senhas não são iguais.' });
  }

  if (senha.length < 6) {
    errors.push({ msg: 'A senha ter pelo menos 6 caracteres.' });
  }

  if (errors.length > 0) {
    res.render('registrar', {
      errors,
      nome,
      email,
      senha,
      senha2
    });
  } else { //Valida se o usuário já existe
    Usuario.findOne({ email: email }).then(usuario => {
      if (usuario) {
        errors.push({ msg: 'O e-mail já está cadastrado.' });
        res.render('registrar', {
          errors,
          nome,
          email,
          senha,
          senha2
        });
      } else {
        const newUsuario = new Usuario({
          nome,
          email,
          senha
        });
        //Gerar hash para a senha do usuário
        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(newUsuario.senha, salt, (err, hash) => {
            if (err) throw err;
            newUsuario.senha = hash;
            newUsuario
              .save()
              .then(usuario => {
                req.flash('success_msg', 'Cadastro realizado com sucesso.')
                res.redirect('/usuarios/login');
              })
              .catch(err => console.log(err));
          });
        });
      }
    });
  }
});

// Login handle
router.post('/login', (req, res, next) => {
  passport.authenticate('local', {
    successRedirect: '/todos',
    failureRedirect: '/usuarios/login',
    failureFlash: true
  })(req, res, next);
});

// Login com Google
router.get('/login/google', 
  passport.authenticate('google', {
    scope: ['profile', 'email']
  })
)

// Callback do login google

router.get('/login/google/redirecionar',  (req, res, next) => {
  passport.authenticate('google', {
    successRedirect: '/todos',
    failureRedirect: '/usuarios/login',
    failureFlash: true
  })(req, res, next);
})


// Logout handle
router.get('/logout', (req, res) => {
  req.logout();
  req.flash('success_msg', 'Deslogado com sucesso.')
  res.redirect('/usuarios/login');
});

// Registrar tarefa
router.post('/todos', ensureAuthenticated, (req, res) => {
  const { descricao, email } = req.body;

  console.log(req.body)
  console.log(descricao.length)

  //Valida se o campo de descrição da tarefa está vazio
  let errors = []

  if (descricao.length < 1) {
    errors.push({ msg: 'Preencha a descrição.' });
  }

  const newTarefa = new Tarefa({
    email,
    descricao
  });
  //Salvar a tarefa no banco
  newTarefa.save()
    .then(tarefa => {
      req.flash('success_msg', 'Tarefa cadastrada!')
      res.redirect('/todos')
    })
    .catch(err => console.log(err));
})

// Deletar tarefa
router.get('/todos/delete/:id', ensureAuthenticated, (req, res) => {

  Tarefa.findOne({ _id: req.params.id }).then(tarefa => {
    if (tarefa) {
      Tarefa.findOneAndDelete({ _id: req.params.id }).then(() => {
        req.flash('success_msg', 'Tarefa removida!')
        res.redirect('/todos')
      })
    } else {
      res.send("Tarefa não encontrada")
    }
  })
})

// Editar tarefa
router.post('/todos/edit', ensureAuthenticated, (req, res) => {
  const descricao = req.body.novaDescricao
  const id = req.body.tarefaId

  Tarefa.findByIdAndUpdate({ _id: id }, { descricao: descricao }, function(err, result) {
    if (err) {
      res.send(err)
    } else {
      req.flash('success_msg', 'Tarefa editada!')
      res.redirect('/todos')
    }})

})

module.exports = router;