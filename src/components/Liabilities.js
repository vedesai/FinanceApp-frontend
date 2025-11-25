import React, { useState, useEffect, useCallback } from 'react';
import { liabilitiesAPI } from '../services/api';
import { AlertCircle, DollarSign, Plus, Edit, Trash2, Home, Car, CreditCard, GraduationCap } from 'lucide-react';
import './Liabilities.css';

const Liabilities = () => {
  const [liabilities, setLiabilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingLiability, setEditingLiability] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    liabilityType: '',
    amount: '',
    description: '',
  });

  const fetchLiabilities = useCallback(async () => {
    try {
      setLoading(true);
      const response = await liabilitiesAPI.getAll();
      setLiabilities(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to load liabilities');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLiabilities();
  }, [fetchLiabilities]);

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
        name: formData.name,
        liabilityType: formData.liabilityType,
        amount: parseFloat(formData.amount),
        description: formData.description || null,
      };

      if (editingLiability) {
        await liabilitiesAPI.update(editingLiability.id, data);
      } else {
        await liabilitiesAPI.create(data);
      }

      resetForm();
      fetchLiabilities();
    } catch (err) {
      setError('Failed to save liability');
      console.error(err);
    }
  };

  const handleEdit = (liability) => {
    setEditingLiability(liability);
    setFormData({
      name: liability.name,
      liabilityType: liability.liabilityType,
      amount: liability.amount.toString(),
      description: liability.description || '',
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this liability?')) {
      try {
        await liabilitiesAPI.delete(id);
        fetchLiabilities();
      } catch (err) {
        setError('Failed to delete liability');
        console.error(err);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      liabilityType: '',
      amount: '',
      description: '',
    });
    setEditingLiability(null);
    setShowForm(false);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount || 0);
  };

  const calculateSummary = () => {
    const totalLiabilities = liabilities.reduce((sum, liab) => sum + (liab.amount || 0), 0);
    // Mock monthly payments - in real app, this would come from liability data
    const monthlyPayments = totalLiabilities * 0.01; // 1% as placeholder
    // Mock total paid - in real app, this would track payments
    const totalPaid = totalLiabilities * 0.202; // 20.2% as per design
    const paidPercent = 20.2;
    return { totalLiabilities, monthlyPayments, totalPaid, paidPercent };
  };

  const getLiabilityIcon = (liabilityType) => {
    const type = liabilityType?.toLowerCase() || '';
    if (type.includes('mortgage') || type.includes('home')) {
      return <Home size={24} />;
    } else if (type.includes('car') || type.includes('auto') || type.includes('vehicle')) {
      return <Car size={24} />;
    } else if (type.includes('credit') || type.includes('card')) {
      return <CreditCard size={24} />;
    } else if (type.includes('student') || type.includes('education')) {
      return <GraduationCap size={24} />;
    }
    return <DollarSign size={24} />;
  };

  const calculateProgress = (liability) => {
    // Mock calculation - in real app, this would use original amount and remaining balance
    const originalAmount = liability.amount || 0;
    const remainingBalance = originalAmount * 0.875; // Mock 12.5% paid
    const paid = originalAmount - remainingBalance;
    const percentPaid = originalAmount > 0 ? ((paid / originalAmount) * 100).toFixed(1) : 0;
    return { originalAmount, remainingBalance, paid, percentPaid };
  };

  if (loading) {
    return <div className="loading">Loading liabilities...</div>;
  }

  const summary = calculateSummary();

  return (
    <div className="liabilities">
      {/* Summary Cards */}
      <div className="liabilities-summary">
        <div className="summary-card summary-card-danger">
          <div className="summary-card-header">
            <AlertCircle className="summary-icon" size={20} />
            <span className="summary-card-title summary-card-title-danger">Total Liabilities</span>
          </div>
          <div className="summary-card-content">
            <div className="summary-card-value-large summary-card-value-danger">{formatCurrency(summary.totalLiabilities)}</div>
            <div className="summary-card-subtitle summary-card-subtitle-danger">Outstanding balance</div>
          </div>
        </div>
        <div className="summary-card">
          <div className="summary-card-title">Monthly Payments</div>
          <div className="summary-card-content">
            <div className="summary-card-value-large">{formatCurrency(summary.monthlyPayments)}</div>
            <div className="summary-card-subtitle">Per month</div>
          </div>
        </div>
        <div className="summary-card summary-card-success">
          <div className="summary-card-title summary-card-title-success">Total Paid</div>
          <div className="summary-card-content">
            <div className="summary-card-value-large summary-card-value-success">{formatCurrency(summary.totalPaid)}</div>
            <div className="summary-card-subtitle summary-card-subtitle-success">{summary.paidPercent}% of original amount</div>
          </div>
        </div>
      </div>

      {/* Add Liability Button */}
      <div className="liabilities-header-actions">
        <button className="btn btn-primary btn-add" onClick={() => setShowForm(!showForm)}>
          <Plus size={16} />
          <span>Add Liability</span>
        </button>
      </div>

      {error && <div className="error">{error}</div>}

      {showForm && (
        <form className="liability-form" onSubmit={handleSubmit}>
          <h2>{editingLiability ? 'Edit Liability' : 'New Liability'}</h2>
          <div className="form-group">
            <label>Liability Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              placeholder="e.g., Mortgage, Credit Card, Car Loan"
            />
          </div>
          <div className="form-group">
            <label>Liability Type *</label>
            <input
              type="text"
              name="liabilityType"
              value={formData.liabilityType}
              onChange={handleInputChange}
              required
              placeholder="e.g., Loan, Credit Card, Mortgage"
            />
          </div>
          <div className="form-group">
            <label>Amount *</label>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleInputChange}
              required
              step="0.01"
              min="0"
              placeholder="0.00"
            />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows="3"
              placeholder="Optional description"
            />
          </div>
          <div className="form-actions">
            <button type="submit" className="btn btn-primary">
              {editingLiability ? 'Update' : 'Create'}
            </button>
            <button type="button" className="btn btn-secondary" onClick={resetForm}>
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Liabilities List */}
      <div className="liabilities-list">
        {liabilities.length === 0 ? (
          <div className="empty-state">No liabilities found. Add your first liability!</div>
        ) : (
          <div className="liabilities-cards">
            {liabilities.map((liability) => {
              const progress = calculateProgress(liability);
              const monthlyPayment = (liability.amount || 0) * 0.006; // Mock 0.6% monthly
              const interestRate = 3.5; // Mock interest rate
              return (
                <div key={liability.id} className="liability-card">
                  <div className="liability-card-header">
                    <div className="liability-header-left">
                      <div className="liability-icon-wrapper">
                        {getLiabilityIcon(liability.liabilityType)}
                      </div>
                      <div className="liability-title-group">
                        <div className="liability-card-title">{liability.name}</div>
                        <span className="liability-badge">{liability.liabilityType}</span>
                      </div>
                    </div>
                    <div className="liability-header-right">
                      <div className="liability-interest-rate">
                        <div className="liability-interest-label">Interest Rate</div>
                        <div className="liability-interest-value">{interestRate}%</div>
                      </div>
                      <div className="liability-card-actions-header">
                        <button className="btn-icon" onClick={() => handleEdit(liability)} title="Edit">
                          <Edit size={16} />
                        </button>
                        <button className="btn-icon" onClick={() => handleDelete(liability.id)} title="Delete">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="liability-card-content">
                    <div className="liability-details-grid">
                      <div className="liability-detail">
                        <div className="liability-detail-label">Original Amount</div>
                        <div className="liability-detail-value">{formatCurrency(progress.originalAmount)}</div>
                      </div>
                      <div className="liability-detail">
                        <div className="liability-detail-label">Remaining Balance</div>
                        <div className="liability-detail-value liability-detail-value-danger">{formatCurrency(progress.remainingBalance)}</div>
                      </div>
                      <div className="liability-detail">
                        <div className="liability-detail-label">Monthly Payment</div>
                        <div className="liability-detail-value">{formatCurrency(monthlyPayment)}</div>
                      </div>
                      <div className="liability-detail">
                        <div className="liability-detail-label">Payoff Date</div>
                        <div className="liability-detail-value">Jun 2048</div>
                      </div>
                    </div>
                    <div className="liability-progress">
                      <div className="liability-progress-header">
                        <span className="liability-progress-label">Payment Progress</span>
                        <span className="liability-progress-percent">{progress.percentPaid}% paid</span>
                      </div>
                      <div className="liability-progress-bar">
                        <div 
                          className="liability-progress-fill" 
                          style={{ width: `${progress.percentPaid}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Tip Card */}
      <div className="liability-tip-card">
        <span className="tip-icon">💡</span>
        <span className="tip-bold">Tip:</span>
        <span className="tip-text">Consider making extra payments towards your high-interest debts (like credit cards) to reduce the total interest paid over time.</span>
      </div>
    </div>
  );
};

export default Liabilities;

