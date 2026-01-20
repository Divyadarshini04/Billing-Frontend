import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, LineChart, PieChart, TrendingUp } from 'lucide-react';

export function FeatureUsageBreakdown() {
  const [timeRange, setTimeRange] = useState('30days');

  // Mock feature usage data
  const featureUsage = [
    { name: 'Product Management', usage: 285, percentage: 35, color: 'blue', trend: '+12%' },
    { name: 'Advanced Analytics', usage: 156, percentage: 19, color: 'indigo', trend: '+8%' },
    { name: 'Report Generation', usage: 218, percentage: 27, color: 'purple', trend: '+15%' },
    { name: 'Data Export', usage: 89, percentage: 11, color: 'cyan', trend: '+3%' },
    { name: 'API Access', usage: 42, percentage: 5, color: 'teal', trend: '+1%' },
    { name: 'Custom Fields', usage: 28, percentage: 3, color: 'green', trend: '+2%' },
  ];

  const colorMap = {
    blue: { bg: 'bg-blue-100', bar: 'bg-blue-500', border: 'border-blue-200' },
    indigo: { bg: 'bg-indigo-100', bar: 'bg-indigo-500', border: 'border-indigo-200' },
    purple: { bg: 'bg-purple-100', bar: 'bg-purple-500', border: 'border-purple-200' },
    cyan: { bg: 'bg-cyan-100', bar: 'bg-cyan-500', border: 'border-cyan-200' },
    teal: { bg: 'bg-teal-100', bar: 'bg-teal-500', border: 'border-teal-200' },
    green: { bg: 'bg-green-100', bar: 'bg-green-500', border: 'border-green-200' },
  };

  const totalUsage = featureUsage.reduce((sum, item) => sum + item.usage, 0);

  // Trend data for line chart simulation
  const trendData = [
    { date: '7 days ago', value: 580 },
    { date: '6 days ago', value: 620 },
    { date: '5 days ago', value: 640 },
    { date: '4 days ago', value: 680 },
    { date: '3 days ago', value: 710 },
    { date: '2 days ago', value: 750 },
    { date: 'Today', value: 818 },
  ];

  const maxTrendValue = Math.max(...trendData.map(d => d.value));

  return (
    <div className="space-y-6">
      {/* Header with Time Range Selector */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900">Feature Usage Breakdown</h3>
          <p className="text-sm text-gray-600 mt-1">How you're using your subscription features</p>
        </div>
        <div className="flex gap-2">
          {['7days', '30days', '90days'].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                timeRange === range
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
              }`}
            >
              {range === '7days' ? '7 Days' : range === '30days' ? '30 Days' : '90 Days'}
            </button>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Feature Usage Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2 bg-white rounded-lg shadow-md p-6 border border-blue-200"
        >
          <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            Feature Activity (Last {timeRange === '7days' ? '7' : timeRange === '30days' ? '30' : '90'} Days)
          </h4>

          <div className="space-y-4">
            {featureUsage.map((feature, idx) => {
              const color = colorMap[feature.color];
              const maxUsage = Math.max(...featureUsage.map(f => f.usage));

              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${color.bg}`} />
                      <span className="font-medium text-gray-900">{feature.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-900">{feature.usage}</span>
                      <span className={`text-xs font-bold ${feature.trend.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                        {feature.trend}
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`${color.bar} h-3 rounded-full transition-all`}
                      style={{ width: `${(feature.usage / maxUsage) * 100}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>{feature.percentage}% of total usage</span>
                    <span>{Math.round((feature.usage / totalUsage) * 100)}% of quota</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Total Usage Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          {/* Total Interactions */}
          <div className="bg-blue-50 rounded-lg shadow-md p-6 border border-blue-200">
            <BarChart3 className="w-8 h-8 text-blue-600 mb-2" />
            <p className="text-sm text-gray-600 mb-1">Total Interactions</p>
            <p className="text-3xl font-bold text-blue-600">{totalUsage}</p>
            <p className="text-xs text-gray-600 mt-2">Last 30 days</p>
          </div>

          {/* Average Daily Usage */}
          <div className="bg-indigo-50 rounded-lg shadow-md p-6 border border-indigo-200">
            <TrendingUp className="w-8 h-8 text-indigo-600 mb-2" />
            <p className="text-sm text-gray-600 mb-1">Daily Average</p>
            <p className="text-3xl font-bold text-indigo-600">{Math.round(totalUsage / 30)}</p>
            <p className="text-xs text-gray-600 mt-2">Per day</p>
          </div>

          {/* Most Used Feature */}
          <div className="bg-purple-50 rounded-lg shadow-md p-6 border border-purple-200">
            <PieChart className="w-8 h-8 text-purple-600 mb-2" />
            <p className="text-sm text-gray-600 mb-1">Top Feature</p>
            <p className="font-bold text-gray-900 mt-1">{featureUsage[0].name}</p>
            <p className="text-xs text-gray-600 mt-2">{featureUsage[0].percentage}% of total</p>
          </div>
        </motion.div>
      </div>

      {/* Usage Trend Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-lg shadow-md p-6 border border-indigo-200"
      >
        <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
          <LineChart className="w-5 h-5 text-indigo-600" />
          Usage Trend (Last 7 Days)
        </h4>

        <div className="h-32 flex items-end justify-between gap-2 px-2">
          {trendData.map((data, idx) => {
            const height = (data.value / maxTrendValue) * 100;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: `${height}%` }}
                transition={{ delay: idx * 0.1 }}
                className="flex-1 bg-gradient-to-t from-blue-500 to-blue-400 rounded-t hover:from-blue-600 hover:to-blue-500 transition-all group relative"
              >
                <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-2 py-1 rounded text-xs whitespace-nowrap transition-opacity">
                  {data.value}
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="flex justify-between mt-4 px-2 text-xs text-gray-600">
          {trendData.map((data, idx) => (
            <span key={idx} className="text-center flex-1">{data.date}</span>
          ))}
        </div>

        <p className="text-sm text-gray-600 mt-4">
          📈 Your feature usage has increased <span className="font-bold text-green-600">+41%</span> over the last 7 days
        </p>
      </motion.div>

      {/* Recommendations */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-amber-50 rounded-lg shadow-md p-6 border border-amber-200"
      >
        <h4 className="font-bold text-gray-900 mb-3">💡 Usage Insights</h4>
        <ul className="space-y-2 text-sm text-gray-700">
          <li>• <span className="font-medium">Product Management</span> is your most-used feature (35% of activity)</li>
          <li>• <span className="font-medium">Advanced Analytics</span> usage has grown 8% this period - consider exploring more features</li>
          <li>• <span className="font-medium">API Access</span> is underutilized (5%) - potential to automate workflows</li>
          <li>• Your usage trend is positive - growth of 41% suggests scaling needs soon</li>
        </ul>
      </motion.div>
    </div>
  );
}
