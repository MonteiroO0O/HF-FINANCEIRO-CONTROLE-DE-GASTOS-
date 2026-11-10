const db = require('../config/database');

exports.getTransactions = (req, res) => {
  const userId = req.userId;
  const query = `SELECT * FROM transactions WHERE user_id = ? ORDER BY date DESC, id DESC`;

  db.all(query, [userId], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Erro ao buscar transações' });
    return res.json(rows);
  });
};

exports.createTransaction = (req, res) => {
  const userId = req.userId;
  const { description, amount, type, category, date } = req.body;

  if (!description || !amount || !type || !category || !date) {
    return res.status(400).json({ error: 'Preencha todos os campos da transação' });
  }

  const query = `INSERT INTO transactions (user_id, description, amount, type, category, date) VALUES (?, ?, ?, ?, ?, ?)`;
  db.run(query, [userId, description, amount, type, category, date], function (err) {
    if (err) return res.status(500).json({ error: 'Erro ao criar transação' });
    
    db.get(`SELECT * FROM transactions WHERE id = ?`, [this.lastID], (err, transaction) => {
      return res.status(201).json(transaction);
    });
  });
};

exports.deleteTransaction = (req, res) => {
  const userId = req.userId;
  const { id } = req.params;

  const query = `DELETE FROM transactions WHERE id = ? AND user_id = ?`;
  db.run(query, [id, userId], function (err) {
    if (err) return res.status(500).json({ error: 'Erro ao deletar transação' });
    if (this.changes === 0) return res.status(404).json({ error: 'Transação não encontrada ou não pertence ao usuário' });

    return res.json({ message: 'Transação excluída com sucesso' });
  });
};