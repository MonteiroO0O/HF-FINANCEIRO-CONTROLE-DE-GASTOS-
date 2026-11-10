const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');

const SECRET = process.env.JWT_SECRET || 'super_secret_key_crimson_finance_2026';

exports.register = (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Preencha todos os campos obrigatórios' });
  }

  const hashPassword = bcrypt.hashSync(password, 8);

  const query = `INSERT INTO users (name, email, password) VALUES (?, ?, ?)`;
  db.run(query, [name, email, hashPassword], function (err) {
    if (err) {
      if (err.message.includes('UNIQUE constraint failed')) {
        return res.status(400).json({ error: 'E-mail já cadastrado' });
      }
      return res.status(500).json({ error: 'Erro no servidor ao registrar usuário' });
    }

    const token = jwt.sign({ id: this.lastID, name, email }, SECRET, { expiresIn: '7d' });
    return res.status(201).json({
      user: { id: this.lastID, name, email },
      token
    });
  });
};

exports.login = (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Informe e-mail e senha' });
  }

  const query = `SELECT * FROM users WHERE email = ?`;
  db.get(query, [email], (err, user) => {
    if (err) return res.status(500).json({ error: 'Erro no banco de dados' });
    if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });

    const passwordIsValid = bcrypt.compareSync(password, user.password);
    if (!passwordIsValid) return res.status(401).json({ error: 'Senha incorreta' });

    const token = jwt.sign({ id: user.id, name: user.name, email: user.email }, SECRET, { expiresIn: '7d' });
    return res.json({
      user: { id: user.id, name: user.name, email: user.email },
      token
    });
  });
};