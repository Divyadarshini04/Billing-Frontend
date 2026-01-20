import React, { useState, useEffect, useContext, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare,
  CheckCircle,
  Search,
  Filter,
  MoreVertical,
  Clock,
  AlertCircle,
  Send,
  User,
  ChevronRight,
  ArrowLeft,
  Building2
} from "lucide-react";
import { supportAPI } from "../../api/apiService";
import { NotificationContext } from "../../context/NotificationContext";
import { useAuth } from "../../context/AuthContext";

export default function SupportTickets() {
  const { user } = useAuth();
  const { addNotification } = useContext(NotificationContext);
  const messagesEndRef = useRef(null);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [replyText, setReplyText] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchTickets();

    // Auto-refresh every 10 seconds to sync with Owner activity
    const interval = setInterval(() => {
      // Silent fetch to update data without loading spinner
      supportAPI.getAllTickets().then(res => {
        setTickets(res.data);
      }).catch(err => console.error("Auto-sync failed", err));
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (selectedTicket?.messages) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [selectedTicket?.messages]);

  // Sync selectedTicket with tickets updates (e.g. from auto-sync)
  useEffect(() => {
    if (selectedTicket) {
      const updatedDiff = tickets.find(t => t.id === selectedTicket.id);
      if (updatedDiff) {
        // Only update if there are changes to avoid loop/render thrashing
        // Simple check on message count or status
        if (updatedDiff.messages.length !== selectedTicket.messages.length ||
          updatedDiff.status !== selectedTicket.status) {
          setSelectedTicket(updatedDiff);
        }
      }
    }
  }, [tickets]);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const res = await supportAPI.getAllTickets();
      setTickets(res.data);
    } catch (error) {
      addNotification("error", "Failed to load tickets");
    } finally {
      setLoading(false);
    }
  };

  const handleReply = async () => {
    if (!replyText.trim()) return;
    try {
      const res = await supportAPI.replyToTicket(selectedTicket.id, { message: replyText });

      // Update local state
      const updatedMessages = [...selectedTicket.messages, res.data];
      // Backend auto-updates status to in_progress on admin reply, reflect that
      const updatedTicket = {
        ...selectedTicket,
        messages: updatedMessages,
        status: selectedTicket.status === 'open' ? 'in_progress' : selectedTicket.status
      };

      setSelectedTicket(updatedTicket);
      setTickets(tickets.map(t => t.id === selectedTicket.id ? updatedTicket : t));
      setReplyText("");
    } catch (error) {
      console.error("Reply failed:", error);
      addNotification("error", "Failed to send reply");
    }
  };

  const handleStatusUpdate = async (newStatus) => {
    try {
      await supportAPI.updateStatus(selectedTicket.id, { status: newStatus });
      const updatedTicket = { ...selectedTicket, status: newStatus };
      setSelectedTicket(updatedTicket);
      setTickets(tickets.map(t => t.id === selectedTicket.id ? updatedTicket : t));
      addNotification("success", `Ticket marked as ${newStatus.replace('_', ' ')}`);
    } catch (error) {

      addNotification("error", "Failed to update status");
    }
  };

  const filteredTickets = tickets.filter(ticket => {
    const matchesStatus = filterStatus === "all" || ticket.status === filterStatus;
    const matchesSearch = ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (ticket.user_details?.first_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (ticket.user_details?.email || "").toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  /* Premium Dark Theme Helpers */
  const getStatusStyle = (status) => {
    switch (status) {
      case 'open': return 'bg-orange-500/10 text-orange-400 border-orange-500/20 shadow-[0_0_10px_rgba(249,115,22,0.1)]';
      case 'in_progress': return 'bg-blue-500/10 text-blue-400 border-blue-500/20 shadow-[0_0_10px_rgba(59,130,246,0.1)]';
      case 'resolved': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]';
      default: return 'bg-slate-700/30 text-slate-400 border-slate-600/30';
    }
  };

  const getPriorityStyle = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-400 bg-red-900/20 border-red-900/30';
      case 'medium': return 'text-amber-400 bg-amber-900/20 border-amber-900/30';
      case 'low': return 'text-blue-400 bg-blue-900/20 border-blue-900/30';
      default: return 'text-slate-400';
    }
  };

  return (
    <div className="flex h-[calc(100vh-140px)] gap-6 font-sans">
      {/* List View */}
      <div className={`flex-1 flex flex-col bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-800 shadow-2xl shadow-black/20 overflow-hidden ${selectedTicket ? 'hidden lg:flex' : 'flex'}`}>
        {/* Header & Filters */}
        <div className="p-5 border-b border-slate-800 space-y-5 bg-gradient-to-b from-slate-800/50 to-transparent">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">Support Dashboard</h2>
              <p className="text-xs text-slate-400 mt-1">Manage user inquiries and issues</p>
            </div>
            <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 px-3 py-1 rounded-full text-xs font-bold shadow-[0_0_15px_rgba(59,130,246,0.15)] animate-pulse">
              {filteredTickets.length} Active
            </span>
          </div>

          <div className="flex gap-3">
            <div className="relative flex-1 group">
              <Search className="w-4 h-4 text-slate-500 group-focus-within:text-blue-400 absolute left-3 top-1/2 -translate-y-1/2 transition-colors" />
              <input
                type="text"
                placeholder="Search tickets by user, subject..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-black/20 border border-slate-700/50 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500/50 focus:bg-slate-900/50 transition-all placeholder:text-slate-600"
              />
            </div>
            <div className="flex bg-black/20 rounded-xl p-1 border border-slate-700/50">
              {['all', 'open', 'resolved'].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${filterStatus === status
                    ? 'bg-slate-700 text-white shadow-sm ring-1 ring-slate-600'
                    : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50'
                    }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Ticket List */}
        <div className="flex-1 overflow-y-auto bg-slate-900/50">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-48 text-slate-500">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="mb-3"
              >
                <div className="w-6 h-6 border-2 border-slate-700 border-t-blue-500 rounded-full" />
              </motion.div>
              <p className="text-sm font-medium">Syncing tickets...</p>
            </div>
          ) : filteredTickets.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-slate-600">
              <MessageSquare className="w-10 h-10 mb-3 opacity-20" />
              <p className="text-sm font-medium">No tickets found</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-800/50">
              {filteredTickets.map((ticket, index) => (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.03 }}
                  key={ticket.id}
                  onClick={() => setSelectedTicket(ticket)}
                  className={`group p-4 cursor-pointer transition-all duration-200 border-l-[3px] ${selectedTicket?.id === ticket.id
                    ? 'bg-blue-500/10 border-l-blue-500 shadow-inner'
                    : 'bg-transparent border-l-transparent hover:bg-slate-800/30 hover:border-l-slate-600'
                    }`}
                >
                  <div className="flex justify-between items-start mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-slate-500 group-hover:text-slate-400 transition-colors">#{ticket.id.toString().padStart(4, '0')}</span>
                      <span className={`w-1.5 h-1.5 rounded-full shadow-[0_0_8px_currentColor] ${ticket.status === 'open' ? 'text-orange-500 bg-orange-500' : ticket.status === 'in_progress' ? 'text-blue-500 bg-blue-500' : 'text-emerald-500 bg-emerald-500'}`} />
                    </div>
                    <span className="text-[10px] text-slate-600 font-medium">{new Date(ticket.created_at).toLocaleDateString()}</span>
                  </div>

                  <h3 className={`font-bold text-sm mb-1 truncate transition-colors ${selectedTicket?.id === ticket.id ? 'text-blue-400' : 'text-slate-300 group-hover:text-white'}`}>{ticket.subject}</h3>

                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-400 border border-slate-700">
                        {(ticket.user_details?.first_name || 'U').charAt(0)}
                      </div>
                      <span className="text-xs text-slate-500 font-medium">{ticket.user_details?.first_name || 'User'}</span>
                      {ticket.company_name && (
                        <span className="text-[10px] text-slate-500 px-1.5 py-0.5 bg-slate-800 rounded border border-slate-700 truncate max-w-[80px]">
                          {ticket.company_name}
                        </span>
                      )}
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider border ${getStatusStyle(ticket.status)}`}>
                      {ticket.status.replace('_', ' ')}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Detail View */}
      <AnimatePresence mode="wait">
        {selectedTicket ? (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            key={selectedTicket.id}
            className="flex-[2] bg-slate-900/90 backdrop-blur-xl rounded-2xl border border-slate-800 overflow-hidden flex flex-col absolute inset-0 z-20 lg:static shadow-2xl shadow-black/40"
          >
            {/* Detail Header */}
            <div className="p-6 border-b border-slate-800 bg-slate-900/50 flex justify-between items-start">
              <div className="flex gap-4">
                <button
                  onClick={() => setSelectedTicket(null)}
                  className="lg:hidden p-2 -ml-2 text-slate-400 hover:text-white"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl font-black text-white tracking-widest opacity-90">#{selectedTicket.id.toString().padStart(4, '0')}</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border ${getStatusStyle(selectedTicket.status)}`}>
                      {selectedTicket.status.replace('_', ' ')}
                    </span>
                    <span className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full border ${getPriorityStyle(selectedTicket.priority)}`}>
                      {selectedTicket.priority}
                    </span>
                  </div>
                  <h1 className="text-xl font-bold text-white mb-1.5">{selectedTicket.subject}</h1>
                  <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                    <User className="w-3.5 h-3.5" />
                    <span className="text-slate-300">{selectedTicket.user_details?.first_name || 'User'} {selectedTicket.user_details?.last_name || ''}</span>
                    <span className="opacity-50">•</span>
                    <span className="opacity-50">•</span>
                    <span>{selectedTicket.user_details?.email}</span>
                    {selectedTicket.company_name && (
                      <>
                        <span className="opacity-50">•</span>
                        <Building2 className="w-3.5 h-3.5 text-slate-500" />
                        <span className="text-slate-300 font-bold">{selectedTicket.company_name}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                {/* Status Actions */}
                {selectedTicket.status === 'resolved' ? (
                  <button
                    onClick={() => handleStatusUpdate('in_progress')}
                    className="p-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded-lg border border-blue-500/20 transition-colors"
                    title="Re-open Ticket"
                  >
                    <Clock className="w-5 h-5" />
                  </button>
                ) : (
                  <button
                    onClick={() => handleStatusUpdate('resolved')}
                    className="p-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-lg border border-emerald-500/20 transition-colors"
                    title="Resolve Ticket"
                  >
                    <CheckCircle className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-950/50">
              {/* Original Issue Description */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm max-w-3xl mx-auto">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <AlertCircle className="w-3 h-3" /> Original Issue
                </h3>
                <p className="text-slate-300 leading-relaxed text-sm whitespace-pre-wrap font-medium">
                  {selectedTicket.description}
                </p>
              </div>

              <div className="relative flex items-center gap-4 py-2">
                <div className="h-px bg-slate-800 flex-1"></div>
                <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">History</span>
                <div className="h-px bg-slate-800 flex-1"></div>
              </div>

              {/* Conversation */}
              <div className="space-y-6 max-w-3xl mx-auto pb-4">
                {selectedTicket.messages.map((msg) => {
                  const isMe = msg.sender === user.id;
                  return (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      key={msg.id}
                      className={`flex gap-4 ${isMe ? 'flex-row-reverse' : ''}`}
                    >
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 border-2 border-slate-800 shadow-lg ${isMe ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white' : 'bg-slate-800 text-slate-400'
                        }`}>
                        {msg.sender_name ? msg.sender_name.charAt(0) : 'U'}
                      </div>
                      <div className="flex flex-col gap-1 max-w-[80%]">
                        <div className={`flex items-center gap-2 ${isMe ? 'justify-end' : ''}`}>
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">{isMe ? 'You' : msg.sender_name || 'User'}</span>
                          <span className="text-[10px] text-slate-600 font-mono">{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <div className={`rounded-2xl p-4 shadow-md text-sm leading-relaxed ${isMe
                          ? 'bg-blue-600/20 text-blue-50 border border-blue-500/20 rounded-tr-none'
                          : 'bg-slate-800 text-slate-300 rounded-tl-none border border-slate-700'
                          }`}>
                          <p className="whitespace-pre-wrap">{msg.message}</p>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Reply Area */}
            <div className="p-4 bg-slate-900 border-t border-slate-800 shrink-0">
              <div className="max-w-3xl mx-auto relative flex items-center gap-3">
                <input
                  type="text"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Type your reply..."
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleReply()}
                  className="flex-1 bg-black/20 border border-slate-800 focus:bg-slate-900 focus:border-blue-500 rounded-full px-6 py-3.5 text-sm text-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all shadow-inner placeholder:text-slate-600"
                />
                <button
                  onClick={handleReply}
                  disabled={!replyText.trim()}
                  className="p-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-full shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:shadow-none transition-all hover:scale-105 active:scale-95"
                >
                  <Send className="w-5 h-5 ml-0.5" />
                </button>
              </div>
            </div>
          </motion.div>
        ) : (
          /* Empty State for Detail View (Desktop) */
          <div className="flex-[2] hidden lg:flex flex-col items-center justify-center bg-slate-900/30 rounded-2xl border border-slate-800/50 border-dashed m-1">
            <div className="w-20 h-20 bg-slate-800/50 rounded-full flex items-center justify-center mb-6 shadow-xl shadow-black/20 ring-1 ring-slate-800">
              <MessageSquare className="w-10 h-10 text-slate-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-300">No Ticket Selected</h3>
            <p className="text-slate-500 text-sm mt-2 max-w-xs text-center leading-relaxed">
              Select a ticket from the list to view details, conversation history, and manage outcomes.
            </p>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
