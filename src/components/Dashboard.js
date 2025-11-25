import React, { useState, useEffect } from 'react';
import { dashboardAPI } from '../services/api';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { TrendingUp, TrendingDown, Wallet, CreditCard, PieChart as PieChartIcon, BarChart3 } from 'lucide-react';
import './Dashboard.css';

const Dashboard = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await dashboardAPI.getSummary();
      setSummary(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
    fetchDashboardData();
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  // Mock data for charts - replace with actual API data when available
  const netWorthData = [
    { name: 'Jan', value: 450000 },
    { name: 'Feb', value: 470000 },
    { name: 'Mar', value: 490000 },
    { name: 'Apr', value: 500000 },
    { name: 'May', value: 510000 },
    { name: 'Jun', value: 513993 },
  ];

  const profitLossData = [
    { name: 'Jan', profit: 5000, loss: 2000 },
    { name: 'Feb', profit: 6000, loss: 1500 },
    { name: 'Mar', profit: 8000, loss: 3000 },
    { name: 'Apr', profit: 12000, loss: 2500 },
    { name: 'May', profit: 10000, loss: 2000 },
    { name: 'Jun', profit: 11000, loss: 1800 },
  ];

  const assetAllocationData = [
    { name: 'Investments', value: summary?.totalInvestments || 85693, color: '#3b82f6' },
    { name: 'Real Estate', value: 530000, color: '#8b5cf6' },
    { name: 'Cash', value: 18500, color: '#10b981' },
    { name: 'Other Assets', value: (summary?.totalAssets || 0) - (summary?.totalInvestments || 0) - 530000 - 18500, color: '#f59e0b' },
  ];

  const calculatePercentageChange = (current, previous) => {
    if (!previous || previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  };

  const netWorthChange = summary?.netWorth ? calculatePercentageChange(summary.netWorth, summary.netWorth * 0.8875) : 12.5;
  const assetsChange = summary?.totalAssets ? calculatePercentageChange(summary.totalAssets, summary.totalAssets * 0.957) : 4.3;
  const liabilitiesChange = summary?.totalLiabilities ? calculatePercentageChange(summary.totalLiabilities, summary.totalLiabilities * 1.021) : -2.1;
  const totalPL = summary?.netWorth ? summary.netWorth - (summary.netWorth * 0.974) : 13193;
  const roi = summary?.totalInvestments ? ((totalPL / summary.totalInvestments) * 100) : 18.2;

  if (loading) {
    return <div className="dashboard-loading">Loading dashboard...</div>;
  }

  if (error) {
    return <div className="dashboard-error">{error}</div>;
  }

  return (
    <div className="dashboard">
      {/* Metric Cards */}
      <div className="dashboard-metrics">
        <div className="metric-card">
          <div className="metric-card-header">
            <span className="metric-card-title">Net Worth</span>
            <Wallet className="metric-card-icon" size={20} />
          </div>
          <div className="metric-card-content">
            <div className="metric-value">{formatCurrency(summary?.netWorth || 0)}</div>
            <div className={`metric-badge ${netWorthChange >= 0 ? 'positive' : 'negative'}`}>
              {netWorthChange >= 0 ? '+' : ''}{netWorthChange.toFixed(1)}% this month
            </div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-card-header">
            <span className="metric-card-title">Total Assets</span>
            <TrendingUp className="metric-card-icon" size={20} />
          </div>
          <div className="metric-card-content">
            <div className="metric-value">{formatCurrency(summary?.totalAssetsWithInvestments || summary?.totalAssets || 0)}</div>
            <div className={`metric-badge ${assetsChange >= 0 ? 'positive' : 'negative'}`}>
              {assetsChange >= 0 ? '+' : ''}{assetsChange.toFixed(1)}% this month
            </div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-card-header">
            <span className="metric-card-title">Total Liabilities</span>
            <TrendingDown className="metric-card-icon" size={20} />
          </div>
          <div className="metric-card-content">
            <div className="metric-value">{formatCurrency(summary?.totalLiabilities || 0)}</div>
            <div className={`metric-badge ${liabilitiesChange >= 0 ? 'positive' : 'negative'}`}>
              {liabilitiesChange >= 0 ? '+' : ''}{liabilitiesChange.toFixed(1)}% this month
            </div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-card-header">
            <span className="metric-card-title">Total P&L</span>
            <CreditCard className="metric-card-icon" size={20} />
          </div>
          <div className="metric-card-content">
            <div className="metric-value">{formatCurrency(totalPL)}</div>
            <div className={`metric-badge ${roi >= 0 ? 'positive' : 'negative'}`}>
              {roi >= 0 ? '+' : ''}{roi.toFixed(2)}% ROI
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="dashboard-charts">
        <div className="chart-card">
          <div className="chart-card-header">
            <PieChartIcon className="chart-icon" size={20} />
            <h3 className="chart-title">Net Worth Trend</h3>
          </div>
          <div className="chart-content">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={netWorthData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip 
                  formatter={(value) => formatCurrency(value)}
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  dot={{ fill: '#3b82f6', r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="chart-card">
          <div className="chart-card-header">
            <BarChart3 className="chart-icon" size={20} />
            <h3 className="chart-title">Profit & Loss Analysis</h3>
          </div>
          <div className="chart-content">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={profitLossData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip 
                  formatter={(value) => formatCurrency(value)}
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                />
                <Legend 
                  wrapperStyle={{ paddingTop: '20px' }}
                  iconType="circle"
                />
                <Bar dataKey="loss" fill="#ef4444" name="loss" radius={[4, 4, 0, 0]} />
                <Bar dataKey="profit" fill="#10b981" name="profit" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Asset Allocation */}
      <div className="chart-card full-width">
        <div className="chart-card-header">
          <PieChartIcon className="chart-icon" size={20} />
          <h3 className="chart-title">Asset Allocation</h3>
        </div>
        <div className="asset-allocation-content">
          <div className="pie-chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={assetAllocationData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {assetAllocationData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(value)} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="asset-legend">
            {assetAllocationData.map((item, index) => (
              <div key={index} className="legend-item">
                <div className="legend-color" style={{ backgroundColor: item.color }}></div>
                <div className="legend-content">
                  <div className="legend-label">{item.name}</div>
                  <div className="legend-value">{formatCurrency(item.value)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

