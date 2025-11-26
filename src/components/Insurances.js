import React, { useState, useEffect, useCallback } from 'react';
import { insurancesAPI } from '../services/api';
import { Plus, Edit, Trash2, Shield, Heart, Car, Home, AlertTriangle, FileText } from 'lucide-react';
import './Insurances.css';

const Insurances = () => {
  const [insurances, setInsurances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingInsurance, setEditingInsurance] = useState(null);
  const [formData, setFormData] = useState({
    policyNumber: '',
    insuranceType: '',
    provider: '',
    premium: '',
    coverageAmount: '',
    startDate: '',
    endDate: '',
    status: 'Active',
    description: '',
  });

  const fetchInsurances = useCallback(async () => {
    try {
      setLoading(true);
      const response = await insurancesAPI.getAll();
      setInsurances(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to load insurances');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInsurances();
  }, [fetchInsurances]);

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
        policyNumber: formData.policyNumber,
        insuranceType: formData.insuranceType,
        provider: formData.provider,
        premium: parseFloat(formData.premium),
        coverageAmount: parseFloat(formData.coverageAmount),
        startDate: formData.startDate || null,
        endDate: formData.endDate || null,
        status: formData.status,
        description: formData.description || null,
      };

      if (editingInsurance) {
        await insurancesAPI.update(editingInsurance.id, data);
      } else {
        await insurancesAPI.create(data);
      }

      resetForm();
      fetchInsurances();
    } catch (err) {
      setError('Failed to save insurance');
      console.error(err);
    }
  };

  const handleEdit = (insurance) => {
    setEditingInsurance(insurance);
    setFormData({
      policyNumber: insurance.policyNumber || '',
      insuranceType: insurance.insuranceType || '',
      provider: insurance.provider || '',
      premium: insurance.premium?.toString() || '',
      coverageAmount: insurance.coverageAmount?.toString() || '',
      startDate: insurance.startDate || '',
      endDate: insurance.endDate || '',
      status: insurance.status || 'Active',
      description: insurance.description || '',
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this insurance policy?')) {
      try {
        await insurancesAPI.delete(id);
        fetchInsurances();
      } catch (err) {
        setError('Failed to delete insurance');
        console.error(err);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      policyNumber: '',
      insuranceType: '',
      provider: '',
      premium: '',
      coverageAmount: '',
      startDate: '',
      endDate: '',
      status: 'Active',
      description: '',
    });
    setEditingInsurance(null);
    setShowForm(false);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  const calculateSummary = () => {
    const totalAnnualPremiums = insurances.reduce((sum, ins) => sum + (ins.premium || 0), 0);
    const totalCoverage = insurances.reduce((sum, ins) => sum + (ins.coverageAmount || 0), 0);
    const policyCount = insurances.length;
    return { totalAnnualPremiums, totalCoverage, policyCount };
  };

  const getCoverageByType = () => {
    const coverageMap = {};
    insurances.forEach(ins => {
      const type = ins.insuranceType || 'Other';
      coverageMap[type] = (coverageMap[type] || 0) + (ins.coverageAmount || 0);
    });
    return coverageMap;
  };

  const getInsuranceIcon = (insuranceType) => {
    const type = insuranceType?.toLowerCase() || '';
    if (type.includes('term') || type.includes('life')) {
      return <Shield size={32} />;
    } else if (type.includes('health')) {
      return <Heart size={32} />;
    } else if (type.includes('auto') || type.includes('car') || type.includes('vehicle')) {
      return <Car size={32} />;
    } else if (type.includes('home') || type.includes('homeowner')) {
      return <Home size={32} />;
    } else if (type.includes('disability')) {
      return <AlertTriangle size={32} />;
    }
    return <FileText size={32} />;
  };

  const calculateMonthlyPremium = (annualPremium) => {
    return annualPremium / 12;
  };

  if (loading) {
    return <div className="loading">Loading insurances...</div>;
  }

  const summary = calculateSummary();
  const coverageByType = getCoverageByType();

  return (
    <div className="insurances">
      {/* Summary Cards */}
      <div className="insurances-summary">
        <div className="summary-card">
          <div className="summary-card-title">Total Annual Premiums</div>
          <div className="summary-card-content">
            <div className="summary-card-value-large">{formatCurrency(summary.totalAnnualPremiums)}</div>
            <div className="summary-card-subtitle">Across {summary.policyCount} {summary.policyCount === 1 ? 'policy' : 'policies'}</div>
          </div>
        </div>
        <div className="summary-card summary-card-primary">
          <div className="summary-card-title summary-card-title-primary">Total Coverage</div>
          <div className="summary-card-content">
            <div className="summary-card-value-large summary-card-value-primary">{formatCurrency(summary.totalCoverage)}</div>
            <div className="summary-card-subtitle summary-card-subtitle-primary">Sum insured amount</div>
          </div>
        </div>
      </div>

      {/* Coverage by Type */}
      {Object.keys(coverageByType).length > 0 && (
        <div className="coverage-by-type-card">
          <div className="coverage-by-type-title">Coverage by Type</div>
          <div className="coverage-by-type-grid">
            {Object.entries(coverageByType).map(([type, amount]) => (
              <div key={type} className="coverage-type-item">
                <span className="coverage-type-label">{type}</span>
                <span className="coverage-type-value">{formatCurrency(amount)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Insurance Button */}
      <div className="insurances-header-actions">
        <button className="btn btn-primary btn-add" onClick={() => setShowForm(!showForm)}>
          <Plus size={16} />
          <span>Add Insurance Policy</span>
        </button>
      </div>

      {error && <div className="error">{error}</div>}

      {showForm && (
        <form className="insurance-form" onSubmit={handleSubmit}>
          <h2>{editingInsurance ? 'Edit Insurance Policy' : 'New Insurance Policy'}</h2>
          <div className="form-group">
            <label>Policy Number *</label>
            <input
              type="text"
              name="policyNumber"
              value={formData.policyNumber}
              onChange={handleInputChange}
              required
              placeholder="e.g., POL-123456"
            />
          </div>
          <div className="form-group">
            <label>Insurance Type *</label>
            <select
              name="insuranceType"
              value={formData.insuranceType}
              onChange={handleInputChange}
              required
            >
              <option value="">Select type</option>
              <option value="Term">Term</option>
              <option value="Health">Health</option>
              <option value="Auto">Auto</option>
              <option value="Home">Home</option>
              <option value="Disability">Disability</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div className="form-group">
            <label>Provider *</label>
            <input
              type="text"
              name="provider"
              value={formData.provider}
              onChange={handleInputChange}
              required
              placeholder="e.g., Insurance Company Name"
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Annual Premium *</label>
              <input
                type="number"
                name="premium"
                value={formData.premium}
                onChange={handleInputChange}
                required
                step="0.01"
                min="0"
                placeholder="0.00"
              />
            </div>
            <div className="form-group">
              <label>Coverage Amount *</label>
              <input
                type="number"
                name="coverageAmount"
                value={formData.coverageAmount}
                onChange={handleInputChange}
                required
                step="0.01"
                min="0"
                placeholder="0.00"
              />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Start Date *</label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label>End Date</label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleInputChange}
              />
            </div>
          </div>
          <div className="form-group">
            <label>Status *</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              required
            >
              <option value="Active">Active</option>
              <option value="Expired">Expired</option>
              <option value="Cancelled">Cancelled</option>
            </select>
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
              {editingInsurance ? 'Update' : 'Create'}
            </button>
            <button type="button" className="btn btn-secondary" onClick={resetForm}>
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Insurances List */}
      <div className="insurances-list">
        {insurances.length === 0 ? (
          <div className="empty-state">No insurance policies found. Add your first policy!</div>
        ) : (
          <div className="insurances-cards">
            {insurances.map((insurance) => {
              const monthlyPremium = calculateMonthlyPremium(insurance.premium || 0);
              return (
                <div key={insurance.id} className="insurance-card">
                  <div className="insurance-card-header">
                    <div className="insurance-header-left">
                      <div className="insurance-icon-wrapper">
                        {getInsuranceIcon(insurance.insuranceType)}
                      </div>
                      <div className="insurance-title-group">
                        <div className="insurance-card-title">{insurance.provider}</div>
                        <span className="insurance-badge">{insurance.insuranceType}</span>
                      </div>
                    </div>
                  </div>
                  <div className="insurance-card-content">
                    <div className="insurance-details-grid">
                      <div className="insurance-detail">
                        <div className="insurance-detail-label">Sum Insured</div>
                        <div className="insurance-detail-value">{formatCurrency(insurance.coverageAmount)}</div>
                      </div>
                      <div className="insurance-detail">
                        <div className="insurance-detail-label">Annual Premium</div>
                        <div className="insurance-detail-value">{formatCurrency(insurance.premium)}</div>
                        <div className="insurance-detail-subtitle">~{formatCurrency(monthlyPremium)}/month</div>
                      </div>
                      <div className="insurance-detail">
                        <div className="insurance-detail-label">Start Date</div>
                        <div className="insurance-detail-value">{formatDate(insurance.startDate)}</div>
                      </div>
                    </div>
                    <div className="insurance-card-actions">
                      <button className="btn btn-secondary btn-sm" onClick={() => handleEdit(insurance)}>
                        <Edit size={16} />
                        <span>Edit</span>
                      </button>
                      <button className="btn btn-secondary btn-sm" onClick={() => handleDelete(insurance.id)}>
                        <Trash2 size={16} />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Insurances;
