import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, Download, FileText } from 'lucide-react';

export function SubscriptionTimeline() {
  const timeline = [
    {
      id: 1,
      date: '2025-01-15',
      title: 'Subscription Renewed',
      description: 'Basic Plan renewed for 1 month',
      type: 'renewal',
      icon: Clock,
    },
    {
      id: 2,
      date: '2024-12-15',
      title: 'Plan Upgraded',
      description: 'Upgraded from Free to Basic Plan',
      type: 'upgrade',
      icon: Calendar,
    },
    {
      id: 3,
      date: '2024-11-20',
      title: 'Subscription Created',
      description: 'Initial subscription setup',
      type: 'creation',
      icon: FileText,
    },
  ];

  const getTypeStyles = (type) => {
    switch (type) {
      case 'renewal':
        return {
          color: 'blue',
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          badge: 'bg-blue-100 text-blue-700',
        };
      case 'upgrade':
        return {
          color: 'green',
          bg: 'bg-green-50',
          border: 'border-green-200',
          badge: 'bg-green-100 text-green-700',
        };
      case 'creation':
        return {
          color: 'purple',
          bg: 'bg-purple-50',
          border: 'border-purple-200',
          badge: 'bg-purple-100 text-purple-700',
        };
      default:
        return {
          color: 'gray',
          bg: 'bg-gray-50',
          border: 'border-gray-200',
          badge: 'bg-gray-100 text-gray-700',
        };
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-bold text-gray-900">Subscription Timeline</h3>
      <div className="relative space-y-4">
        {timeline.map((event, idx) => {
          const styles = getTypeStyles(event.type);
          const Icon = event.icon;

          return (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="relative flex gap-4"
            >
              {/* Timeline line */}
              {idx < timeline.length - 1 && (
                <div className={`absolute left-6 top-12 w-0.5 h-12 bg-gradient-to-b from-blue-300 to-transparent`} />
              )}

              {/* Timeline dot */}
              <div
                className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center z-10 relative
                  ${styles.bg} border-2 border-${styles.color}-300`}
              >
                <Icon className={`w-6 h-6 text-${styles.color}-600`} />
              </div>

              {/* Content */}
              <div
                className={`flex-1 p-4 rounded-lg ${styles.bg} border ${styles.border}`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-bold text-gray-900">{event.title}</h4>
                    <p className="text-sm text-gray-600 mt-1">{event.description}</p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-bold whitespace-nowrap ${styles.badge}`}>
                    {event.date}
                  </span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
