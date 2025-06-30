import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Transaction from './models/transactions.js';

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log('✅ MongoDB connected'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

// GET all
app.get('/api/transactions', async (req, res) => {
  try {
    const transactions = await Transaction.find().sort({ datetime: -1 });
    res.json(transactions);
  } catch (err) {
    console.error('Fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

// POST new
app.post('/api/transaction', async (req, res) => {
  try {
    const { name, price, datetime, description, category } = req.body;
    if (!name || !datetime || !category) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const transaction = await Transaction.create({
      name,
      price,
      datetime: new Date(datetime),
      description,
      category,
    });
    res.json(transaction);
  } catch (err) {
    console.error('Creation error:', err);
    res.status(500).json({ error: 'Failed to add transaction' });
  }
});

// DELETE
app.delete('/api/transaction/:id', async (req, res) => {
  try {
    await Transaction.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) {
    console.error('Delete error:', err);
    res.status(500).json({ error: 'Failed to delete' });
  }
});

// PUT update
app.put('/api/transaction/:id', async (req, res) => {
  try {
    const { name, price, datetime, description, category } = req.body;
    const updated = await Transaction.findByIdAndUpdate(
      req.params.id,
      { name, price, datetime: new Date(datetime), description, category },
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    console.error('Update error:', err);
    res.status(500).json({ error: 'Failed to update' });
  }
});

app.listen(4000, () => {
  console.log('Server is running on port 4000');
});
