import React, { useState, useEffect, useCallback } from 'react';
import { investmentsAPI } from '../services/api';
import { DollarSign, TrendingUp, Plus, Edit, Trash2, ArrowUp, ArrowDown } from 'lucide-react';
import './Investments.css';

const Investments = () => {
  const [investments, setInvestments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingInvestment, setEditingInvestment] = useState(null);
  const [formData, setFormData] = useState({
    investmentType: '',
    providerBroker: '',
    investmentAmount: '',
    currentAmount: '',
    purchasedDate: '',
    maturityDate: '',
  });

  const fetchInvestments = useCallback(async () => {
    try {
      setLoading(true);
      const response = await investmentsAPI.getAll();
      setInvestments(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to load investments');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInvestments();
  }, [fetchInvestments]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        investmentType: formData.investmentType,
        providerBroker: formData.providerBroker,
        investmentAmount: parseFloat(formData.investmentAmount),
        currentAmount: parseFloat(formData.currentAmount),
        purchasedDate: formData.purchasedDate || null,
        maturityDate: formData.maturityDate || null,
      };

      if (editingInvestment) {
        await investmentsAPI.update(editingInvestment.id, data);
      } else {
        await investmentsAPI.create(data);
      }

      resetForm();
      fetchInvestments();
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to save investment';
      setError(errorMessage);
      console.error('Investment save error:', err.response?.data || err);
    }
  };

  const handleEdit = (investment) => {
    setEditingInvestment(investment);
    setFormData({
      investmentType: investment.investmentType,
      providerBroker: investment.providerBroker,
      investmentAmount: investment.investmentAmount.toString(),
      currentAmount: investment.currentAmount.toString(),
      purchasedDate: investment.purchasedDate || '',
      maturityDate: investment.maturityDate || '',
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this investment?')) {
      try {
        await investmentsAPI.delete(id);
        fetchInvestments();
      } catch (err) {
        setError('Failed to delete investment');
        console.error(err);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      investmentType: '',
      providerBroker: '',
      investmentAmount: '',
      currentAmount: '',
      purchasedDate: '',
      maturityDate: '',
    });
    setEditingInvestment(null);
    setShowForm(false);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const calculateGainLoss = (investmentAmount, currentAmount) => {
    const difference = currentAmount - investmentAmount;
    const percentage = ((difference / investmentAmount) * 100).toFixed(2);
    return { difference, percentage };
  };

  const calculateSummary = () => {
    const totalInvested = investments.reduce((sum, inv) => sum + (inv.investmentAmount || 0), 0);
    const totalCurrent = investments.reduce((sum, inv) => sum + (inv.currentAmount || 0), 0);
    const totalGainLoss = totalCurrent - totalInvested;
    const totalGainLossPercent = totalInvested > 0 ? ((totalGainLoss / totalInvested) * 100).toFixed(2) : 0;
    return { totalInvested, totalCurrent, totalGainLoss, totalGainLossPercent };
  };

  if (loading) {
    return <div className="loading">Loading investments...</div>;
  }

  const summary = calculateSummary();

  return (
    <div className="investments">
      {/* Summary Cards */}
      <div className="investments-summary">
        <div className="summary-card">
          <div className="summary-card-header">
            <DollarSign className="summary-icon" size={16} />
            <span className="summary-card-title">Total Invested</span>
          </div>
          <div className="summary-card-value">{formatCurrency(summary.totalInvested)}</div>
        </div>
        <div className="summary-card">
          <div className="summary-card-header">
            <TrendingUp className="summary-icon" size={16} />
            <span className="summary-card-title">Current Value</span>
          </div>
          <div className="summary-card-value">{formatCurrency(summary.totalCurrent)}</div>
        </div>
        <div className="summary-card summary-card-success">
          <div className="summary-card-header">
            <TrendingUp className="summary-icon" size={16} />
            <span className="summary-card-title">Total Gain/Loss</span>
          </div>
          <div className="summary-card-value summary-card-value-success">
            {formatCurrency(summary.totalGainLoss)} ({summary.totalGainLossPercent}%)
          </div>
        </div>
      </div>

      {/* Investment Portfolio Card */}
      <div className="investments-portfolio-card">
        <div className="portfolio-card-header">
          <h2 className="portfolio-title">Investment Portfolio</h2>
          <button className="btn btn-primary btn-add" onClick={() => setShowForm(!showForm)}>
            <Plus size={16} />
            <span>Add Investment</span>
          </button>
        </div>

        {error && <div className="error">{error}</div>}

        {showForm && (
          <form className="investment-form" onSubmit={handleSubmit}>
            <h2>{editingInvestment ? 'Edit Investment' : 'New Investment'}</h2>
            <div className="form-group">
              <label>Investment Type *</label>
              <input
                type="text"
                name="investmentType"
                value={formData.investmentType}
                onChange={handleInputChange}
                required
                placeholder="e.g., Stocks, Bonds, Mutual Funds"
              />
            </div>
            <div className="form-group">
              <label>Provider/Broker *</label>
              <input
                type="text"
                name="providerBroker"
                value={formData.providerBroker}
                onChange={handleInputChange}
                required
                placeholder="e.g., Vanguard, Fidelity"
              />
            </div>
            <div className="form-group">
              <label>Investment Amount *</label>
              <input
                type="number"
                name="investmentAmount"
                value={formData.investmentAmount}
                onChange={handleInputChange}
                required
                step="0.01"
                min="0.01"
                placeholder="0.00"
              />
            </div>
            <div className="form-group">
              <label>Current Amount *</label>
              <input
                type="number"
                name="currentAmount"
                value={formData.currentAmount}
                onChange={handleInputChange}
                required
                step="0.01"
                min="0"
                placeholder="0.00"
              />
            </div>
            <div className="form-group">
              <label>Purchased Date</label>
              <input
                type="date"
                name="purchasedDate"
                value={formData.purchasedDate}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-group">
              <label>Maturity Date</label>
              <input
                type="date"
                name="maturityDate"
                value={formData.maturityDate}
                onChange={handleInputChange}
              />
            </div>
            <div className="form-actions">
              <button type="submit" className="btn btn-primary">
                {editingInvestment ? 'Update' : 'Create'}
              </button>
              <button type="button" className="btn btn-secondary" onClick={resetForm}>
                Cancel
              </button>
            </div>
          </form>
        )}

        <div className="investments-table-container">
          {investments.length === 0 ? (
            <div className="empty-state">No investments found. Add your first investment!</div>
          ) : (
            <table className="investments-table">
              <thead>
                <tr>
                  <th>Asset</th>
                  <th>Type</th>
                  <th className="text-right">Quantity</th>
                  <th className="text-right">Buy Price</th>
                  <th className="text-right">Current Price</th>
                  <th className="text-right">Total Value</th>
                  <th className="text-right">Gain/Loss</th>
                  <th>Purchased Date</th>
                  <th>Maturity Date</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {investments.map((investment) => {
                  const { difference, percentage } = calculateGainLoss(
                    investment.investmentAmount,
                    investment.currentAmount
                  );
                  const isGain = difference >= 0;
                  return (
                    <tr key={investment.id}>
                      <td>
                        <div className="asset-cell">
                          <div className="asset-name">{investment.investmentType}</div>
                          <div className="asset-symbol">{investment.providerBroker}</div>
                        </div>
                      </td>
                      <td>
                        <span className="badge">{investment.investmentType}</span>
                      </td>
                      <td className="text-right">1</td>
                      <td className="text-right">{formatCurrency(investment.investmentAmount)}</td>
                      <td className="text-right">{formatCurrency(investment.currentAmount)}</td>
                      <td className="text-right">{formatCurrency(investment.currentAmount)}</td>
                      <td className={`text-right ${isGain ? 'gain' : 'loss'}`}>
                        <div className="gain-loss-cell">
                          <div className="gain-loss-value">
                            {isGain ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
                            <span>{formatCurrency(Math.abs(difference))}</span>
                          </div>
                          <div className={`gain-loss-percentage ${isGain ? 'gain' : 'loss'}`}>
                            ({isGain ? '+' : ''}{percentage}%)
                          </div>
                        </div>
                      </td>
                      <td>{formatDate(investment.purchasedDate)}</td>
                      <td>{formatDate(investment.maturityDate)}</td>
                      <td className="text-right">
                        <div className="table-actions">
                          <button
                            className="btn-icon"
                            onClick={() => handleEdit(investment)}
                            title="Edit"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            className="btn-icon"
                            onClick={() => handleDelete(investment.id)}
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default Investments;

