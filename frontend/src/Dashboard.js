// Dashboard.js
import './App.css';
import { useEffect, useState, useRef } from 'react';
import { Pie, Bar, Line } from 'react-chartjs-2';
import Select from 'react-select';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import {
  Chart,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement
} from 'chart.js';

Chart.register(
  ArcElement, Tooltip, Legend,
  CategoryScale, LinearScale,
  BarElement, PointElement, LineElement
);

const API = 'http://localhost:4000/api/transactions';

const categoryOptions = [
  { value: 'All', label: 'All' },
  { value: 'Food', label: 'Food' },
  { value: 'Rent', label: 'Rent' },
  { value: 'Salary', label: 'Salary' },
  { value: 'Transport', label: 'Transport' },
  { value: 'Entertainment', label: 'Entertainment' },
  { value: 'Other', label: 'Other' }
];

export default function Dashboard() {
  const [transactions, setTransactions] = useState([]);
  const [chosenCategories, setChosenCategories] = useState(['All']);
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  const [monthly, setMonthly] = useState(false);
  const chartRef = useRef();

  useEffect(() => {
    fetch(API)
      .then(res => res.json())
      .then(setTransactions)
      .catch(err => alert('Failed to fetch: ' + err.message));
  }, []);

  const filtered = transactions.filter(t => {
    if (!chosenCategories.includes('All') && !chosenCategories.includes(t.category))
      return false;
    const dt = new Date(t.datetime);
    if (dateRange.from && dt < new Date(dateRange.from)) return false;
    if (dateRange.to && dt > new Date(dateRange.to) + 86400000) return false;
    return true;
  });

  const totals = {};
  filtered.forEach(t => {
    if (t.price < 0) totals[t.category] = (totals[t.category] || 0) + Math.abs(t.price);
  });
  const pie = { labels: Object.keys(totals), datasets: [{ data: Object.values(totals), backgroundColor: ['#FF6384','#36A2EB','#FFCE56','#00d084','#c11','#8e44ad'] }] };

  const bucketFormat = monthly
    ? dt => new Date(dt).toLocaleDateString('default', { month: 'short', year: 'numeric' })
    : dt => new Date(dt).toLocaleDateString();

  const buckets = {};
  filtered.forEach(t => {
    const key = bucketFormat(t.datetime);
    if (!buckets[key]) buckets[key] = { income: 0, expense: 0 };
    if (t.price > 0) buckets[key].income += t.price;
    else buckets[key].expense += Math.abs(t.price);
  });
  const labels = Object.keys(buckets);
  const bar = { labels, datasets: [
    { label: 'Income', data: labels.map(l => buckets[l].income), backgroundColor: '#00d084' },
    { label: 'Expense', data: labels.map(l => buckets[l].expense), backgroundColor: '#c11' }
  ] };

  const sorted = [...filtered].sort((a, b) => new Date(a.datetime) - new Date(b.datetime));
  const line = { labels: sorted.map(t => new Date(t.datetime).toLocaleDateString()), datasets: [{
    label: 'Cumulative Balance',
    data: sorted.reduce((acc, t, i) => {
      acc.push((acc[i - 1] || 0) + t.price);
      return acc;
    }, []),
    fill: false, borderColor: '#36A2EB'
  }] };

  const exportPDF = () => {
    html2canvas(chartRef.current).then(canvas => {
      const img = canvas.toDataURL('image/png');
      const pdf = new jsPDF('l', 'px', [canvas.width, canvas.height]);
      pdf.addImage(img, 'PNG', 0, 0);
      pdf.save('report.pdf');
    });
  };

  const exportCSV = () => {
    const rows = filtered.map(t => [`"${t.name}"`, `"${t.category}"`, t.price, `"${new Date(t.datetime).toLocaleString()}"`, `"${t.description}"`]);
    const csv = ['Name,Category,Price,DateTime,Description', ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'transactions.csv';
    a.click();
  };

  return (
    <main>
      <h1>Dashboard</h1>

      <div className="filter dashboard-filter">
        <Select
          options={categoryOptions}
          isMulti
          value={categoryOptions.filter(o => chosenCategories.includes(o.value))}
          onChange={arr => setChosenCategories(arr.length ? arr.map(o => o.value) : ['All'])}
          placeholder="Select categories..."
          className="react-select-container"
          classNamePrefix="react-select"
        />
        <input
          type="date"
          value={dateRange.from}
          onChange={e => setDateRange(r => ({ ...r, from: e.target.value }))}
        />
        <input
          type="date"
          value={dateRange.to}
          onChange={e => setDateRange(r => ({ ...r, to: e.target.value }))}
        />
        <label>
          <input type="checkbox" checked={monthly} onChange={e => setMonthly(e.target.checked)} /> Monthly View
        </label>
      </div>

      <div ref={chartRef}>
        <div className="chart-container"><h3>🧾 Expenses by Category</h3><Pie data={pie} /></div>
        <div className="chart-container"><h3>📈 Income vs Expense</h3><Bar data={bar} /></div>
        <div className="chart-container"><h3>💹 Cumulative Balance</h3><Line data={line} /></div>
      </div>

      <div className="report-buttons">
        <button onClick={exportCSV}>📤 Export CSV</button>
        <button onClick={exportPDF}>📄 Export PDF</button>
      </div>
    </main>
  );
}
