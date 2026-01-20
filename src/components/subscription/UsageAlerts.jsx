import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, AlertCircle, Info, TrendingUp } from 'lucide-react';

export function UsageAlerts() {
  const alerts = [
    {
      id: 1,
      type: 'warning',
      title: 'Product Limit Warning',
      message: 'You\'ve used 49% of your product limit (245/500)',
      severity: 'medium',
      action: 'Upgrade Plan',
    },
    {
      id: 2,
      type: 'info',
      title: 'Subscription Renewal',
      message: 'Your subscription will renew on February 15, 2025',
      severity: 'low',
      action: 'View Details',
    },
    {
      id: 3,
      type: 'critical',
      title: 'Storage Alert',
      message: 'You\'ve used 85% of your storage (85/100 GB)',
      severity: 'high',
      action: 'Upgrade',
    },
  ];

  const getIcon = (type) => {
    switch (type) {
      case 'warning':
        return AlertTriangle;
      case 'critical':
        return AlertTriangle;
      case 'info':
        return Info;
      default:
        return AlertCircle;
    }
  };

  const getColors = (type) => {
    switch (type) {
      case 'warning':
        return {
          bg: 'bg-amber-50',
          border: 'border-amber-200',
          icon: 'text-amber-600',
          button: 'bg-amber-500 hover:bg-amber-600',
        };
      case 'critical':
        return {
          bg: 'bg-red-50',
          border: 'border-red-200',
          icon: 'text-red-600',
          button: 'bg-red-500 hover:bg-red-600',
        };
      default:
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          icon: 'text-blue-600',
          button: 'bg-blue-500 hover:bg-blue-600',
        };
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-gray-900 mb-4">Active Alerts</h3>
      {alerts.map((alert) => {
        const Icon = getIcon(alert.type);
        const colors = getColors(alert.type);

        return (
          <motion.div
            key={alert.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`${colors.bg} rounded-lg shadow-md p-4 border ${colors.border} flex gap-4`}
          >
            <Icon className={`w-6 h-6 ${colors.icon} flex-shrink-0 mt-0.5`} />
            <div className="flex-1">
              <h4 className="font-bold text-gray-900">{alert.title}</h4>
              <p className="text-sm text-gray-700 mt-1">{alert.message}</p>
            </div>
            <button
              className={`px-4 py-2 ${colors.button} text-white font-bold rounded-lg whitespace-nowrap transition-all text-sm`}
            >
              {alert.action}
            </button>
          </motion.div>
        );
      })}
    </div>
  );
}
