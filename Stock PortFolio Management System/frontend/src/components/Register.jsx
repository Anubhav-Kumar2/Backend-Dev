import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';

export default function Register({ onLogin }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/auth/register', { name, email, password });
      onLogin(res.data.user, res.data.token);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-16 bg-dark-card p-8 rounded-2xl shadow-xl border border-dark-border">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">Create Account</h2>
        <p className="text-dark-muted">Start tracking your portfolio today</p>
      </div>
      
      {error && <div className="bg-brand-danger/20 text-brand-danger p-3 rounded-lg mb-6 text-sm border border-brand-danger/30 text-center">{error}</div>}
      
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-dark-muted mb-1">Full Name</label>
          <input 
            type="text" 
            required
            className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-3 text-white focus:outline-none focus:border-brand-primary transition-colors"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="John Doe"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-dark-muted mb-1">Email Address</label>
          <input 
            type="email" 
            required
            className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-3 text-white focus:outline-none focus:border-brand-primary transition-colors"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-dark-muted mb-1">Password</label>
          <input 
            type="password" 
            required
            className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-3 text-white focus:outline-none focus:border-brand-primary transition-colors"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />
        </div>
        <button 
          type="submit"
          className="w-full bg-brand-primary hover:bg-brand-primary/80 text-white font-bold py-3 rounded-lg transition-colors mt-2"
        >
          Create Account
        </button>
      </form>
      
      <p className="mt-6 text-center text-dark-muted text-sm">
        Already have an account? <Link to="/login" className="text-brand-primary hover:underline">Sign in</Link>
      </p>
    </div>
  );
}
