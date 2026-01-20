import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Toggle, ToggleRight, Calendar, Zap, AlertCircle } from 'lucide-react';

export function AutoRenewalSettings() {
  const [autoRenewal, setAutoRenewal] = useState(true);
  const [showCancellation, setShowCancellation] = useState(false);

  const gracePeriodDays = 30;
  const nextBillingDate = new Date(new Date().getTime() + 28 * 24 * 60 * 60 * 1000);

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-blue-200">
      <h3 className="text-lg font-bold text-gray-900 mb-6">Auto-Renewal Settings</h3>

      <div className="space-y-6">
        {/* Auto-Renewal Toggle */}
        <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center gap-3">
            <ToggleRight className="w-6 h-6 text-blue-600" />
            <div>
              <h4 className="font-bold text-gray-900">Auto-Renewal</h4>
              <p className="text-sm text-gray-600">Your subscription will automatically renew</p>
            </div>
          </div>
          <button
            onClick={() => setAutoRenewal(!autoRenewal)}
            className={`px-4 py-2 rounded-lg font-bold transition-all ${
              autoRenewal
                ? 'bg-blue-500 hover:bg-blue-600 text-white'
                : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
            }`}
          >
            {autoRenewal ? 'Enabled' : 'Disabled'}
          </button>
        </div>

        {/* Next Billing Date */}
        <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-200 flex items-start gap-3">
          <Calendar className="w-6 h-6 text-indigo-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-gray-900">Next Billing Date</h4>
            <p className="text-sm text-gray-600 mt-1">
              {nextBillingDate.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
            <p className="text-xs text-gray-600 mt-2">28 days remaining</p>
          </div>
        </div>

        {/* Grace Period */}
        <div className="p-4 bg-amber-50 rounded-lg border border-amber-200 flex items-start gap-3">
          <Zap className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-gray-900">Grace Period</h4>
            <p className="text-sm text-gray-600 mt-1">
              If payment fails, you'll have {gracePeriodDays} days to update your payment method before cancellation.
            </p>
          </div>
        </div>

        {/* Cancellation Section */}
        <div className="border-t border-blue-200 pt-6">
          <h4 className="font-bold text-gray-900 mb-4">Subscription Cancellation</h4>

          {!showCancellation ? (
            <div className="p-4 bg-red-50 rounded-lg border border-red-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-6 h-6 text-red-600" />
                <p className="text-sm text-gray-700">
                  Cancel your subscription anytime. You'll retain access until the end of your billing period.
                </p>
              </div>
              <button
                onClick={() => setShowCancellation(true)}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-bold rounded-lg transition-all whitespace-nowrap ml-4"
              >
                Cancel Plan
              </button>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-red-50 rounded-lg border border-red-200 space-y-4"
            >
              <div>
                <h5 className="font-bold text-gray-900 mb-3">Cancellation Options</h5>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 p-3 bg-white rounded border border-red-200 cursor-pointer hover:bg-red-50">
                    <input type="radio" name="cancellation" defaultChecked className="w-4 h-4" />
                    <div>
                      <p className="font-medium text-gray-900">Cancel at End of Billing Period</p>
                      <p className="text-xs text-gray-600">Retain access until {nextBillingDate.toLocaleDateString()}</p>
                    </div>
                  </label>
                  <label className="flex items-center gap-3 p-3 bg-white rounded border border-red-200 cursor-pointer hover:bg-red-50">
                    <input type="radio" name="cancellation" className="w-4 h-4" />
                    <div>
                      <p className="font-medium text-gray-900">Cancel Immediately</p>
                      <p className="text-xs text-gray-600">Access will end today. Pro-rated refund: $12.50</p>
                    </div>
                  </label>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setShowCancellation(false)}
                  className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-900 font-bold rounded-lg transition-all"
                >
                  Keep Plan
                </button>
                <button className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-bold rounded-lg transition-all">
                  Confirm Cancellation
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
