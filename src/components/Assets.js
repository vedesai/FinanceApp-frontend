import React, { useState, useEffect } from 'react';
import { assetsAPI } from '../services/api';
import { TrendingUp, Plus, Edit, Trash2, Home, Car, Building2, Wallet, Coins, Gem } from 'lucide-react';
import './Assets.css';

const Assets = () => {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingAsset, setEditingAsset] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    assetType: '',
    value: '',
    description: '',
  });

  useEffect(() => {
    fetchAssets();
  }, []);

  const fetchAssets = async () => {
    try {
      setLoading(true);
      const response = await assetsAPI.getAll();
      setAssets(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to load assets');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

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
        assetType: formData.assetType,
        value: parseFloat(formData.value),
        description: formData.description || null,
      };

      if (editingAsset) {
        await assetsAPI.update(editingAsset.id, data);
      } else {
        await assetsAPI.create(data);
      }

      resetForm();
      fetchAssets();
    } catch (err) {
      setError('Failed to save asset');
      console.error(err);
    }
  };

  const handleEdit = (asset) => {
    setEditingAsset(asset);
    setFormData({
      name: asset.name,
      assetType: asset.assetType,
      value: asset.value.toString(),
      description: asset.description || '',
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this asset?')) {
      try {
        await assetsAPI.delete(id);
        fetchAssets();
      } catch (err) {
        setError('Failed to delete asset');
        console.error(err);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      assetType: '',
      value: '',
      description: '',
    });
    setEditingAsset(null);
    setShowForm(false);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount || 0);
  };

  const calculateSummary = () => {
    const totalValue = assets.reduce((sum, asset) => sum + (asset.value || 0), 0);
    // Mock appreciation calculation - in real app, this would come from purchase price
    const totalAppreciation = totalValue * 0.1521; // 15.21% as per design
    const appreciationPercent = 15.21;
    return { totalValue, totalAppreciation, appreciationPercent };
  };

  const getCategoryTotals = () => {
    const categories = {};
    assets.forEach(asset => {
      const type = asset.assetType || 'Other';
      categories[type] = (categories[type] || 0) + (asset.value || 0);
    });
    return categories;
  };

  const getAssetIcon = (assetType) => {
    const type = assetType?.toLowerCase() || '';
    if (type.includes('real estate') || type.includes('property') || type.includes('residence')) {
      return <Home size={32} />;
    } else if (type.includes('vehicle') || type.includes('car')) {
      return <Car size={32} />;
    } else if (type.includes('retirement') || type.includes('401')) {
      return <Building2 size={32} />;
    } else if (type.includes('cash') || type.includes('savings')) {
      return <Wallet size={32} />;
    } else if (type.includes('jewelry') || type.includes('personal')) {
      return <Gem size={32} />;
    }
    return <Coins size={32} />;
  };

  const calculateAppreciation = (asset) => {
    // Mock calculation - in real app, this would use purchase date/price
    const appreciation = (asset.value || 0) * 0.15;
    return appreciation;
  };

  if (loading) {
    return <div className="loading">Loading assets...</div>;
  }

  const summary = calculateSummary();
  const categoryTotals = getCategoryTotals();

  return (
    <div className="assets">
      {/* Summary Cards */}
      <div className="assets-summary">
        <div className="summary-card">
          <div className="summary-card-title">Total Asset Value</div>
          <div className="summary-card-content">
            <div className="summary-card-value-large">{formatCurrency(summary.totalValue)}</div>
            <div className="summary-card-subtitle">Across {assets.length} assets</div>
          </div>
        </div>
        <div className="summary-card summary-card-success">
          <div className="summary-card-title summary-card-title-success">Total Appreciation</div>
          <div className="summary-card-content">
            <div className="summary-card-value-large summary-card-value-success">{formatCurrency(summary.totalAppreciation)}</div>
            <div className="summary-card-subtitle summary-card-subtitle-success">{summary.appreciationPercent}% change</div>
          </div>
        </div>
      </div>

      {/* Assets by Category */}
      <div className="assets-category-card">
        <div className="category-card-title">Assets by Category</div>
        <div className="category-grid">
          {Object.entries(categoryTotals).map(([category, total]) => (
            <div key={category} className="category-item">
              <span className="category-name">{category}</span>
              <span className="category-value">{formatCurrency(total)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Add Asset Button */}
      <div className="assets-header-actions">
        <button className="btn btn-primary btn-add" onClick={() => setShowForm(!showForm)}>
          <Plus size={16} />
          <span>Add Asset</span>
        </button>
      </div>

      {error && <div className="error">{error}</div>}

      {showForm && (
        <form className="asset-form" onSubmit={handleSubmit}>
          <h2>{editingAsset ? 'Edit Asset' : 'New Asset'}</h2>
          <div className="form-group">
            <label>Asset Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              placeholder="e.g., House, Car, Savings Account"
            />
          </div>
          <div className="form-group">
            <label>Asset Type *</label>
            <input
              type="text"
              name="assetType"
              value={formData.assetType}
              onChange={handleInputChange}
              required
              placeholder="e.g., Real Estate, Vehicle, Cash"
            />
          </div>
          <div className="form-group">
            <label>Value *</label>
            <input
              type="number"
              name="value"
              value={formData.value}
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
              {editingAsset ? 'Update' : 'Create'}
            </button>
            <button type="button" className="btn btn-secondary" onClick={resetForm}>
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Assets Grid */}
      <div className="assets-grid-container">
        {assets.length === 0 ? (
          <div className="empty-state">No assets found. Add your first asset!</div>
        ) : (
          <div className="assets-grid">
            {assets.map((asset) => {
              const appreciation = calculateAppreciation(asset);
              return (
                <div key={asset.id} className="asset-card">
                  <div className="asset-card-header">
                    <div className="asset-icon-wrapper">
                      {getAssetIcon(asset.assetType)}
                    </div>
                    <span className="asset-badge">{asset.assetType}</span>
                  </div>
                  <div className="asset-card-title">{asset.name}</div>
                  <div className="asset-card-content">
                    <div className="asset-detail">
                      <div className="asset-detail-label">Current Value</div>
                      <div className="asset-detail-value">{formatCurrency(asset.value)}</div>
                    </div>
                    <div className="asset-detail">
                      <div className="asset-detail-label">Purchase Date</div>
                      <div className="asset-detail-value-secondary">January 1, 2020</div>
                    </div>
                    <div className="asset-detail">
                      <div className="asset-detail-label">Appreciation</div>
                      <div className={`asset-detail-value ${appreciation >= 0 ? 'appreciation-positive' : 'appreciation-negative'}`}>
                        {appreciation >= 0 ? '+' : ''}{formatCurrency(appreciation)}
                      </div>
                    </div>
                    <div className="asset-card-actions">
                      <button
                        className="btn btn-outline"
                        onClick={() => handleEdit(asset)}
                      >
                        <Edit size={16} />
                        <span>Edit</span>
                      </button>
                      <button
                        className="btn btn-outline"
                        onClick={() => handleDelete(asset.id)}
                      >
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

export default Assets;

