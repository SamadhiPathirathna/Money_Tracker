// Tracker.js
import './App.css';
import { useEffect, useState, useRef } from 'react';
const API = 'http://localhost:4000/api';
const categories = ['Food','Rent','Salary','Transport','Entertainment','Other'];

export default function Tracker() {
  const [transactions, setTransactions] = useState([]);
  const [name, setName] = useState('');
  const [datetime, setDatetime] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(categories[0]);
  const [editId, setEditId] = useState(null);
  const [filterCategory, setFilterCategory] = useState('All');
  const [loading, setLoading] = useState(false);
  const nameRef = useRef();

  useEffect(() => { fetchTransactions(); }, []);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/transactions`);
      if (!res.ok) throw new Error();
      setTransactions(await res.json());
    } catch { alert('Fetch failed'); }
    setLoading(false);
  };

  const filtered = filterCategory === 'All'
    ? transactions
    : transactions.filter(t => t.category === filterCategory);

  const income = filtered.filter(t => t.price > 0).reduce((s,t)=>s+t.price,0);
  const expense = filtered.filter(t => t.price < 0).reduce((s,t)=>s+t.price,0);
  const balance = income + expense;

  const handleSubmit = async e => {
    e.preventDefault();
    const parts = name.trim().split(' ');
    const price = parseFloat(parts[0]);
    const tname = parts.slice(1).join(' ');
    if (isNaN(price)||!tname||!datetime||!category) return alert('Invalid input');
    setLoading(true);
    try {
      await fetch(`${API}/transaction${editId?'/'+editId:''}`, {
        method: editId?'PUT':'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({ name: tname, price, datetime, description, category })
      });
      resetForm(); fetchTransactions();
    } catch { alert('Save failed'); }
    setLoading(false);
  };

  const resetForm = () => {
    setName(''); setDatetime(''); setDescription(''); setCategory(categories[0]); setEditId(null);
  };

  const startEdit = t => {
    setEditId(t._id);
    setName(`${t.price>0?'+':''}${t.price} ${t.name}`);
    setDatetime(new Date(t.datetime).toISOString().slice(0,16));
    setDescription(t.description);
    setCategory(t.category);
    setTimeout(() => nameRef.current.focus(), 100);
  };

  const handleDelete = async id => {
    if (!window.confirm('Delete?')) return;
    setLoading(true);
    try {
      await fetch(`${API}/transaction/${id}`, { method: 'DELETE' });
      fetchTransactions();
    } catch { alert('Delete failed'); }
    setLoading(false);
  };

  return (
    <main>
      <h1>Rs.{balance.toFixed(2)}</h1>
      <div className="summary">
  <div className="income">Income: Rs.{income.toFixed(2)}</div>
  <div className="expense">Expense: Rs.{Math.abs(expense).toFixed(2)}</div>
</div>
      <div className="filter">
        <label>Filter:</label>
        <select value={filterCategory} onChange={e=>setFilterCategory(e.target.value)}>
          <option>All</option>{categories.map(c=><option key={c}>{c}</option>)}
        </select>
      </div>
      <form onSubmit={handleSubmit}>
        <input ref={nameRef} type="text" placeholder="+200 Rent" value={name} onChange={e=>setName(e.target.value)} />
        <input type="datetime-local" value={datetime} onChange={e=>setDatetime(e.target.value)} />
        <input type="text" placeholder="Description" value={description} onChange={e=>setDescription(e.target.value)} />
        <select value={category} onChange={e=>setCategory(e.target.value)}>{categories.map(c=><option key={c}>{c}</option>)}</select>
        <button disabled={loading}>{editId?'Update':'Add'} Transaction</button>
      </form>
      {loading && <p>Loading...</p>}
      {filtered.map(t => (
        <div className="transaction" key={t._id}>
          <div className="left">
            <div className="name">{t.name}</div>
            <div className="description">{t.description}</div>
            <div className="category">{t.category}</div>
          </div>
          <div className="right">
            <div className={'price '+(t.price<0?'red':'green')}>
              {t.price<0?'-':'+'}Rs.{Math.abs(t.price)}
            </div>
            <div className="datetime">{new Date(t.datetime).toLocaleString()}</div>
            <div className="actions">
              <button className="edit-btn" onClick={()=>startEdit(t)}>✏️</button>
              <button className="delete-btn" onClick={()=>handleDelete(t._id)}>🗑️</button>
            </div>
          </div>
        </div>
      ))}
    </main>
  );
}
