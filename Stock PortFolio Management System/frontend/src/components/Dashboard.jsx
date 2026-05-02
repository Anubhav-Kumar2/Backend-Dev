import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, DollarSign, Plus, X, Edit2, Trash2, Search, Filter } from 'lucide-react';
import api from '../api';

export default function Dashboard() {
  const [portfolio, setPortfolio] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Form states
  const [showForm, setShowForm] = useState(false);
  const [symbol, setSymbol] = useState('');
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');
  const [type, setType] = useState('BUY');
  const [formError, setFormError] = useState('');

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('ALL');
  const [editItem, setEditItem] = useState(null);
  // Removed mock currentPrices. We will now use the currentPrice from the backend.

  const fetchData = async () => {
    try {
      const [portfolioRes, transactionsRes] = await Promise.all([
        api.get('/portfolio'),
        api.get('/portfolio/transactions')
      ]);
      setPortfolio(portfolioRes.data);
      setTransactions(transactionsRes.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    try {
      const endpoint = type === 'BUY' ? '/portfolio/buy' : '/portfolio/sell';
      await api.post(endpoint, { 
        symbol: symbol.toUpperCase(), 
        quantity: Number(quantity), 
        price: Number(price) 
      });
      setShowForm(false);
      setSymbol('');
      setQuantity('');
      setPrice('');
      fetchData(); // Refresh data
    } catch (err) {
      setFormError(err.response?.data?.message || 'Transaction failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to remove this stock completely?')) return;
    try {
      await api.delete(`/portfolio/${id}`);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/portfolio/${editItem._id}`, {
        quantity: Number(editItem.quantity),
        averagePrice: Number(editItem.averagePrice),
        currentPrice: Number(editItem.currentPrice)
      });
      setEditItem(null);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64 text-brand-primary">Loading dashboard...</div>;
  }

  // Calculations
  let totalInvestment = 0;
  let totalCurrentValue = 0;
  let totalUnrealizedProfit = 0;
  let totalUnrealizedLoss = 0;

  const enrichedPortfolio = portfolio.map(item => {
    const currentPrice = item.currentPrice !== undefined ? item.currentPrice : item.averagePrice;
    const investment = item.quantity * item.averagePrice;
    const currentValue = item.quantity * currentPrice;
    const profitLoss = currentValue - investment;
    const profitLossPercent = investment > 0 ? (profitLoss / investment) * 100 : 0;
    
    totalInvestment += investment;
    totalCurrentValue += currentValue;

    if (profitLoss > 0) {
      totalUnrealizedProfit += profitLoss;
    } else if (profitLoss < 0) {
      totalUnrealizedLoss += Math.abs(profitLoss);
    }

    return { ...item, currentPrice, investment, currentValue, profitLoss, profitLossPercent };
  });

  const filteredPortfolio = enrichedPortfolio.filter(item => {
    const matchesSearch = item.symbol.toLowerCase().includes(searchQuery.toLowerCase());
    let matchesFilter = true;
    if (filterType === 'PROFIT') matchesFilter = item.profitLoss >= 0;
    if (filterType === 'LOSS') matchesFilter = item.profitLoss < 0;
    return matchesSearch && matchesFilter;
  });

  let totalRealizedProfit = 0;
  let totalRealizedLoss = 0;
  transactions.forEach(tx => {
    if (tx.type === 'SELL' && tx.realizedProfit !== undefined) {
      if (tx.realizedProfit > 0) {
        totalRealizedProfit += tx.realizedProfit;
      } else if (tx.realizedProfit < 0) {
        totalRealizedLoss += Math.abs(tx.realizedProfit);
      }
    }
  });

  const totalProfit = totalUnrealizedProfit + totalRealizedProfit;
  const totalLoss = totalUnrealizedLoss + totalRealizedLoss;
  const netProfitLoss = totalProfit - totalLoss;
  const isPositive = netProfitLoss >= 0;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-dark-card border border-dark-border rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-dark-muted font-medium">Total Value</h3>
            <div className="bg-brand-primary/20 p-2 rounded-lg text-brand-primary">
              <DollarSign size={20} />
            </div>
          </div>
          <p className="text-3xl font-bold">${totalCurrentValue.toFixed(2)}</p>
        </div>

        <div className="bg-dark-card border border-dark-border rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-dark-muted font-medium">Total Profit</h3>
            <div className="bg-brand-secondary/20 p-2 rounded-lg text-brand-secondary">
              <TrendingUp size={20} />
            </div>
          </div>
          <div>
            <p className="text-3xl font-bold text-brand-secondary">
              +${totalProfit.toFixed(2)}
            </p>
            <div className="flex flex-col text-xs mt-2 text-dark-muted space-y-1">
              <div className="flex justify-between">
                <span>Unrealized:</span>
                <span className="text-brand-secondary">+${totalUnrealizedProfit.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Realized:</span>
                <span className="text-brand-secondary">+${totalRealizedProfit.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-dark-card border border-dark-border rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-dark-muted font-medium">Total Loss</h3>
            <div className="bg-brand-danger/20 p-2 rounded-lg text-brand-danger">
              <TrendingDown size={20} />
            </div>
          </div>
          <div>
            <p className="text-3xl font-bold text-brand-danger">
              -${totalLoss.toFixed(2)}
            </p>
            <div className="flex flex-col text-xs mt-2 text-dark-muted space-y-1">
              <div className="flex justify-between">
                <span>Unrealized:</span>
                <span className="text-brand-danger">-${totalUnrealizedLoss.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Realized:</span>
                <span className="text-brand-danger">-${totalRealizedLoss.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Portfolio Table */}
        <div className="lg:col-span-2 bg-dark-card border border-dark-border rounded-2xl p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 sm:gap-0">
            <h2 className="text-xl font-bold">Your Assets</h2>
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-muted" />
                <input 
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-4 py-2 bg-dark-bg border border-dark-border rounded-lg text-sm focus:outline-none focus:border-brand-primary w-full sm:w-48"
                />
              </div>
              <div className="relative">
                <Filter size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-muted z-10 pointer-events-none" />
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="pl-9 pr-8 py-2 bg-dark-bg border border-dark-border rounded-lg text-sm focus:outline-none focus:border-brand-primary appearance-none cursor-pointer text-white"
                >
                  <option value="ALL">All Assets</option>
                  <option value="PROFIT">In Profit</option>
                  <option value="LOSS">In Loss</option>
                </select>
              </div>
              <button 
                onClick={() => setShowForm(true)}
                className="bg-brand-primary hover:bg-brand-primary/80 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors text-sm font-medium whitespace-nowrap"
              >
                <Plus size={16} />
                <span className="hidden sm:inline">Add Transaction</span>
              </button>
            </div>
          </div>

          {filteredPortfolio.length === 0 ? (
            <div className="text-center py-12 text-dark-muted border border-dashed border-dark-border rounded-xl">
              <p>No assets in your portfolio yet.</p>
              <p className="text-sm mt-2">Click 'Add Transaction' to get started.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-dark-muted text-sm border-b border-dark-border">
                    <th className="pb-3 font-medium">Asset</th>
                    <th className="pb-3 font-medium">Qty</th>
                    <th className="pb-3 font-medium">Avg Cost</th>
                    <th className="pb-3 font-medium">Current Price</th>
                    <th className="pb-3 font-medium text-right">Profit/Loss</th>
                    <th className="pb-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-border">
                  {filteredPortfolio.map(item => {
                    const itemPositive = item.profitLoss >= 0;
                    return (
                      <tr key={item._id} className="hover:bg-dark-bg/50 transition-colors">
                        <td className="py-4 font-bold">{item.symbol}</td>
                        <td className="py-4">{item.quantity}</td>
                        <td className="py-4">${item.averagePrice.toFixed(2)}</td>
                        <td className="py-4">${item.currentPrice.toFixed(2)}</td>
                        <td className="py-4 text-right">
                          <p className={`font-medium ${itemPositive ? 'text-brand-secondary' : 'text-brand-danger'}`}>
                            {itemPositive ? '+' : ''}${item.profitLoss.toFixed(2)}
                          </p>
                          <p className={`text-xs ${itemPositive ? 'text-brand-secondary/80' : 'text-brand-danger/80'}`}>
                            {itemPositive ? '+' : ''}{item.profitLossPercent.toFixed(2)}%
                          </p>
                        </td>
                        <td className="py-4 text-right space-x-2">
                          <button onClick={() => setEditItem(item)} className="text-dark-muted hover:text-brand-primary transition-colors p-2 bg-dark-bg rounded-lg" title="Edit Stock">
                            <Edit2 size={16} />
                          </button>
                          <button onClick={() => handleDelete(item._id)} className="text-dark-muted hover:text-brand-danger transition-colors p-2 bg-dark-bg rounded-lg" title="Delete Stock">
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Recent Transactions Sidebar */}
        <div className="bg-dark-card border border-dark-border rounded-2xl p-6">
          <h2 className="text-xl font-bold mb-6">Recent Transactions</h2>
          {transactions.length === 0 ? (
            <p className="text-dark-muted text-sm text-center py-8">No recent transactions.</p>
          ) : (
            <div className="space-y-4">
              {transactions.slice(0, 8).map(tx => (
                <div key={tx._id} className="flex justify-between items-center p-3 hover:bg-dark-bg rounded-lg border border-transparent hover:border-dark-border transition-all">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className={`text-xs font-bold px-2 py-1 rounded ${tx.type === 'BUY' ? 'bg-brand-primary/20 text-brand-primary' : 'bg-brand-secondary/20 text-brand-secondary'}`}>
                        {tx.type}
                      </span>
                      <span className="font-bold">{tx.symbol}</span>
                    </div>
                    <p className="text-xs text-dark-muted mt-1">{new Date(tx.date).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{tx.quantity} shares</p>
                    <p className="text-xs text-dark-muted">@ ${tx.price.toFixed(2)}</p>
                    {tx.type === 'SELL' && tx.realizedProfit !== undefined && (
                      <p className={`text-xs mt-1 font-medium ${tx.realizedProfit >= 0 ? 'text-brand-secondary' : 'text-brand-danger'}`}>
                        {tx.realizedProfit >= 0 ? 'Profit: +' : 'Loss: '}${tx.realizedProfit.toFixed(2)}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Transaction Modal Overlay */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-dark-card border border-dark-border rounded-2xl w-full max-w-md p-6 relative">
            <button 
              onClick={() => setShowForm(false)}
              className="absolute top-4 right-4 text-dark-muted hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
            
            <h3 className="text-xl font-bold mb-6">Add Transaction</h3>
            
            {formError && <div className="bg-brand-danger/20 text-brand-danger p-3 rounded-lg mb-4 text-sm">{formError}</div>}
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex space-x-4 mb-4">
                <label className="flex-1 cursor-pointer">
                  <input type="radio" name="type" value="BUY" checked={type === 'BUY'} onChange={() => setType('BUY')} className="sr-only" />
                  <div className={`text-center py-2 rounded-lg border transition-all ${type === 'BUY' ? 'bg-brand-primary/20 border-brand-primary text-brand-primary' : 'border-dark-border text-dark-muted hover:border-dark-muted'}`}>
                    Buy
                  </div>
                </label>
                <label className="flex-1 cursor-pointer">
                  <input type="radio" name="type" value="SELL" checked={type === 'SELL'} onChange={() => setType('SELL')} className="sr-only" />
                  <div className={`text-center py-2 rounded-lg border transition-all ${type === 'SELL' ? 'bg-brand-secondary/20 border-brand-secondary text-brand-secondary' : 'border-dark-border text-dark-muted hover:border-dark-muted'}`}>
                    Sell
                  </div>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-dark-muted mb-1">Asset Symbol (e.g. AAPL)</label>
                <input 
                  type="text" 
                  required
                  className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-brand-primary uppercase"
                  value={symbol}
                  onChange={(e) => setSymbol(e.target.value)}
                  placeholder="AAPL"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-dark-muted mb-1">Quantity</label>
                  <input 
                    type="number" 
                    required min="0.01" step="any"
                    className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-brand-primary"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    placeholder="10"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-muted mb-1">Price per Share</label>
                  <input 
                    type="number" 
                    required min="0.01" step="any"
                    className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-brand-primary"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="150.00"
                  />
                </div>
              </div>

              <button 
                type="submit"
                className={`w-full font-bold py-3 rounded-lg transition-colors mt-4 text-white ${type === 'BUY' ? 'bg-brand-primary hover:bg-brand-primary/80' : 'bg-brand-secondary hover:bg-brand-secondary/80'}`}
              >
                Confirm {type}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal Overlay */}
      {editItem && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-dark-card border border-dark-border rounded-2xl w-full max-w-md p-6 relative">
            <button 
              onClick={() => setEditItem(null)}
              className="absolute top-4 right-4 text-dark-muted hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
            
            <h3 className="text-xl font-bold mb-6">Edit Asset: {editItem.symbol}</h3>
            
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-dark-muted mb-1">Quantity</label>
                  <input 
                    type="number" 
                    required min="0.01" step="any"
                    className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-brand-primary"
                    value={editItem.quantity}
                    onChange={(e) => setEditItem({...editItem, quantity: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-muted mb-1">Avg Price (Buy)</label>
                  <input 
                    type="number" 
                    required min="0.01" step="any"
                    className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-brand-primary"
                    value={editItem.averagePrice}
                    onChange={(e) => setEditItem({...editItem, averagePrice: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-muted mb-1">Current Price</label>
                  <input 
                    type="number" 
                    required min="0.01" step="any"
                    className="w-full bg-dark-bg border border-dark-border rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-brand-primary"
                    value={editItem.currentPrice !== undefined ? editItem.currentPrice : editItem.averagePrice}
                    onChange={(e) => setEditItem({...editItem, currentPrice: e.target.value})}
                  />
                </div>
              </div>

              <button 
                type="submit"
                className="w-full font-bold py-3 rounded-lg transition-colors mt-4 text-white bg-brand-primary hover:bg-brand-primary/80"
              >
                Save Changes
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
