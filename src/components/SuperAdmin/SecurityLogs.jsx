import React, { useState } from "react";
import { motion } from "framer-motion";
import { Lock, Eye, LogIn, AlertTriangle } from "lucide-react";

export default function SecurityLogs() {
  const [logs] = useState([
    { id: 1, type: "login", user: "Admin", timestamp: "2024-12-12 14:30", ip: "192.168.1.1", status: "success" },
    { id: 2, type: "login_failed", user: "Unknown", timestamp: "2024-12-12 14:25", ip: "192.168.1.50", status: "failed" },
    { id: 3, type: "login", user: "Support", timestamp: "2024-12-12 14:20", ip: "192.168.1.100", status: "success" },
  ]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Security & Logs</h2>
        <p className="text-slate-400">Monitor system security and activity</p>
      </div>

      <div className="p-6 bg-slate-800/50 rounded-xl border border-slate-700">
        <h3 className="text-lg font-bold text-white mb-4">Recent Activity</h3>
        <div className="space-y-3">
          {logs.map((log) => (
            <div key={log.id} className="p-4 bg-slate-700/50 rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-3">
                {log.type === 'login' ? <LogIn className="w-5 h-5 text-green-400" /> : <AlertTriangle className="w-5 h-5 text-red-400" />}
                <div>
                  <p className="text-white font-medium">{log.user}</p>
                  <p className="text-slate-400 text-sm">{log.timestamp} • {log.ip}</p>
                </div>
              </div>
              <span className={`text-sm font-medium ${log.status === 'success' ? 'text-green-400' : 'text-red-400'}`}>
                {log.status === 'success' ? 'Success' : 'Failed'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
