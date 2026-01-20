import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Video, HelpCircle, FileText, Zap, BarChart3 } from 'lucide-react';

export function SupportHub() {
  const resources = [
    {
      title: 'Getting Started with Basic Plan',
      description: 'Learn the fundamentals of your subscription and get the most out of features.',
      icon: BookOpen,
      type: 'guide',
      color: 'blue',
    },
    {
      title: 'Advanced Analytics Tutorial',
      description: 'Master analytics tools to gain deep insights into your business metrics.',
      icon: BarChart3,
      type: 'tutorial',
      color: 'indigo',
    },
    {
      title: 'Product Management Video Series',
      description: 'Watch step-by-step videos on managing products efficiently.',
      icon: Video,
      type: 'video',
      color: 'purple',
    },
    {
      title: 'API Documentation',
      description: 'Integrate our API with your systems. (Basic plan limited access)',
      icon: FileText,
      type: 'docs',
      color: 'cyan',
    },
    {
      title: 'Feature Comparison Guide',
      description: 'Compare what\'s included in your plan vs other tiers.',
      icon: Zap,
      type: 'guide',
      color: 'amber',
    },
    {
      title: 'FAQs & Troubleshooting',
      description: 'Find answers to common questions and resolve issues quickly.',
      icon: HelpCircle,
      type: 'faq',
      color: 'green',
    },
  ];

  const colors = {
    blue: { bg: 'bg-blue-50', border: 'border-blue-200', icon: 'text-blue-600' },
    indigo: { bg: 'bg-indigo-50', border: 'border-indigo-200', icon: 'text-indigo-600' },
    purple: { bg: 'bg-purple-50', border: 'border-purple-200', icon: 'text-purple-600' },
    cyan: { bg: 'bg-cyan-50', border: 'border-cyan-200', icon: 'text-cyan-600' },
    amber: { bg: 'bg-amber-50', border: 'border-amber-200', icon: 'text-amber-600' },
    green: { bg: 'bg-green-50', border: 'border-green-200', icon: 'text-green-600' },
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-4">Resources & Documentation</h3>
        <p className="text-gray-600 mb-6">Everything you need to succeed with your subscription</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {resources.map((resource, idx) => {
          const Icon = resource.icon;
          const color = colors[resource.color];

          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className={`${color.bg} rounded-lg shadow-md p-4 border ${color.border} cursor-pointer hover:shadow-lg transition-all group`}
            >
              <div className="flex items-start gap-3">
                <Icon className={`w-6 h-6 ${color.icon} flex-shrink-0`} />
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                    {resource.title}
                  </h4>
                  <p className="text-xs text-gray-600 mt-2">{resource.description}</p>
                </div>
              </div>
              <button className="mt-4 w-full px-3 py-2 bg-white hover:bg-gray-50 text-gray-900 text-sm font-bold rounded-lg border border-gray-200 transition-all">
                Learn More
              </button>
            </motion.div>
          );
        })}
      </div>

      {/* Contact Support */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-blue-50 rounded-lg shadow-md p-6 border border-blue-200"
      >
        <h3 className="text-lg font-bold text-gray-900 mb-2">Still Need Help?</h3>
        <p className="text-gray-600 mb-4">
          Our support team is here to help. Get a response within 24 hours.
        </p>
        <button className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-lg transition-all">
          Contact Support
        </button>
      </motion.div>
    </div>
  );
}
