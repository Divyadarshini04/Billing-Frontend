import React, { useState, useEffect, useContext, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    MessageSquare,
    Plus,
    Search,
    ArrowLeft,
    Send,
    AlertCircle,
    Clock,
    Shield,
    Users,
    ChevronRight,
    ArrowUpRight,
    CheckCircle2,
    MoreHorizontal,
    FileText,
    LifeBuoy,
    Trash2
} from "lucide-react";
import { supportAPI } from "../../api/apiService";
import { NotificationContext } from "../../context/NotificationContext";
import { useAuth } from "../../context/AuthContext";

export default function OwnerSupport() {
    const { user } = useAuth();
    const { addNotification } = useContext(NotificationContext);
    const messagesEndRef = useRef(null);

    // UI States
    const [activeTab, setActiveTab] = useState("system"); // "system" (To Admin) or "internal" (From Staff)
    const [viewMode, setViewMode] = useState("grid"); // "grid", "detail", "create"
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [tickets, setTickets] = useState([]);
    const [filterStatus, setFilterStatus] = useState("all");
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(false);
    const [escalating, setEscalating] = useState(false);

    // Form States
    const [replyText, setReplyText] = useState("");
    const [newTicket, setNewTicket] = useState({
        subject: "",
        category: "Technical",
        priority: "medium",
        description: ""
    });

    const fetchTickets = useCallback(async () => {
        try {
            setLoading(true);
            const res = await supportAPI.getAllTickets();
            setTickets(res.data);
        } catch (error) {
            addNotification("error", "Failed to load tickets");
        } finally {
            setLoading(false);
        }
    }, [addNotification]);

    useEffect(() => {
        fetchTickets();

        // Auto-refresh every 10 seconds to sync with Admin activity
        const interval = setInterval(() => {
            supportAPI.getAllTickets().then(res => {
                setTickets(res.data);
            }).catch(err => console.error("Auto-sync failed", err));
        }, 10000);

        setSelectedTicket(null);
        setViewMode('grid');

        return () => clearInterval(interval);
    }, [activeTab, fetchTickets]);

    // Scroll to bottom of chat
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [selectedTicket?.messages]);

    const handleCreateTicket = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            const token = localStorage.getItem('authToken');
            console.log("DEBUG: Creating ticket. Token present:", !!token);
            if (!token) {
                addNotification("error", "Authentication error: No session token found. Please log in again.");
                setLoading(false);
                return;
            }
            await supportAPI.createTicket(newTicket);
            addNotification("success", "Ticket created successfully");
            setNewTicket({ subject: "", category: "Technical", priority: "medium", description: "" });
            await fetchTickets();
            setViewMode("grid");
        } catch (error) {
            addNotification("error", "Failed to create ticket");
        } finally {
            setLoading(false);
        }
    };

    const handleReply = async () => {
        if (!replyText.trim()) return;
        try {
            const res = await supportAPI.replyToTicket(selectedTicket.id, { message: replyText });
            const updatedMessages = [...selectedTicket.messages, res.data];
            const updatedTicket = { ...selectedTicket, messages: updatedMessages };

            setSelectedTicket(updatedTicket);
            setTickets(tickets.map(t => t.id === selectedTicket.id ? updatedTicket : t));
            setReplyText("");
        } catch (error) {
            addNotification("error", "Failed to send reply");
        }
    };

    const handleEscalate = async () => {
        if (!selectedTicket || !window.confirm("Escalate to Super Admin?")) return;
        try {
            setEscalating(true);
            await supportAPI.escalateTicket(selectedTicket.id);
            addNotification("success", "Ticket escalated");
            await fetchTickets();
            setSelectedTicket(null);
            setViewMode("grid");
        } catch (error) {
            addNotification("error", "Failed to escalate ticket");
        } finally {
            setEscalating(false);
        }
    };

    const handleDelete = async () => {
        if (!selectedTicket || !window.confirm("Are you sure you want to delete this ticket? This action cannot be undone.")) return;
        try {
            setLoading(true);
            await supportAPI.deleteTicket(selectedTicket.id);
            addNotification("success", "Ticket deleted successfully");
            await fetchTickets();
            setSelectedTicket(null);
            setViewMode("grid");
        } catch (error) {
            addNotification("error", "Failed to delete ticket");
        } finally {
            setLoading(false);
        }
    };

    const filteredTickets = tickets.filter(ticket => {
        const isSystem = activeTab === 'system' ? ticket.user === user.id : ticket.user !== user.id;
        const matchesStatus = filterStatus === "all" || ticket.status === filterStatus;
        const matchesSearch = ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) || ticket.id.toString().includes(searchTerm);
        return isSystem && matchesStatus && matchesSearch;
    });

    const getStatusColor = (status) => {
        switch (status) {
            case 'open': return 'bg-orange-500 shadow-orange-500/30';
            case 'in_progress': return 'bg-blue-500 shadow-blue-500/30';
            case 'resolved': return 'bg-emerald-500 shadow-emerald-500/30';
            default: return 'bg-slate-500 shadow-slate-500/30';
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans pb-10">
            {/* HERO SECTION */}
            <div className="relative overflow-hidden bg-slate-900 pb-24">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-blue-700 to-slate-900 opacity-90" />
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150"></div>

                <div className="relative max-w-7xl mx-auto px-6 pt-12 pb-12">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                        <div>
                            <motion.h1
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-4xl md:text-5xl font-extrabold text-white tracking-tight"
                            >
                                How can we <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-cyan-200">help you?</span>
                            </motion.h1>
                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="mt-4 text-lg text-blue-100/80 max-w-xl"
                            >
                                Track your support requests or create a new ticket for assistance.
                            </motion.p>
                        </div>

                        {activeTab === 'system' && (
                            <motion.button
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setViewMode("create")}
                                className="px-8 py-4 bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 text-white rounded-2xl font-bold shadow-2xl flex items-center gap-3 transition-all group"
                            >
                                <div className="p-1.5 bg-blue-500 rounded-lg group-hover:rotate-90 transition-transform">
                                    <Plus className="w-5 h-5" />
                                </div>
                                <span>New Ticket</span>
                            </motion.button>
                        )}
                    </div>

                    {/* Tabs & Search Bar Container - Floating Effect */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="mt-12 p-2 bg-white/10 backdrop-blur-xl border border-white/10 rounded-2xl flex flex-col md:flex-row gap-4 items-center shadow-2xl"
                    >
                        {/* Tabs */}
                        <div className="flex p-1 bg-slate-900/50 rounded-xl w-full md:w-auto shrink-0">
                            {['system', 'internal'].map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`relative px-6 py-2.5 rounded-lg text-sm font-bold transition-all duration-300 w-full md:w-auto flex items-center justify-center gap-2 ${activeTab === tab ? 'text-white shadow-lg' : 'text-slate-400 hover:text-white'
                                        }`}
                                >
                                    {activeTab === tab && (
                                        <motion.div
                                            layoutId="activeTabBg"
                                            className="absolute inset-0 bg-blue-600 rounded-lg"
                                        />
                                    )}
                                    <span className="relative flex items-center gap-2 z-10">
                                        {tab === 'system' ? <Shield className="w-4 h-4" /> : <Users className="w-4 h-4" />}
                                        {tab === 'system' ? 'System Support' : 'Staff Tickets'}
                                    </span>
                                </button>
                            ))}
                        </div>

                        {/* Search */}
                        <div className="relative flex-1 w-full group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-200/50 group-focus-within:text-blue-400 transition-colors" />
                            <input
                                type="text"
                                placeholder="Search by subject or ticket ID..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-slate-900/30 border border-white/5 rounded-xl text-white placeholder-blue-200/30 focus:outline-none focus:bg-slate-900/50 focus:ring-1 focus:ring-blue-500/50 transition-all font-medium"
                            />
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* MAIN CONTENT AREA */}
            <div className="max-w-7xl mx-auto px-6 -mt-10 relative z-10">
                <AnimatePresence mode="wait">
                    {viewMode === 'grid' && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                        >
                            {loading ? (
                                [...Array(6)].map((_, i) => (
                                    <div key={i} className="h-48 bg-white dark:bg-slate-900 rounded-2xl animate-pulse shadow-sm" />
                                ))
                            ) : filteredTickets.length === 0 ? (
                                <div className="col-span-full py-20 text-center bg-white/50 dark:bg-slate-900/50 backdrop-blur-md rounded-3xl border border-slate-200 dark:border-slate-800">
                                    <div className="w-20 h-20 mx-auto bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4 text-slate-400">
                                        <Search className="w-8 h-8" />
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-700 dark:text-slate-300">No tickets found</h3>
                                    <p className="text-slate-500 mt-2">Try adjusting your search or filters</p>
                                </div>
                            ) : (
                                filteredTickets.map((ticket, index) => (
                                    <motion.div
                                        key={ticket.id}
                                        layoutId={`ticket-${ticket.id}`}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        onClick={() => { setSelectedTicket(ticket); setViewMode("detail"); }}
                                        className="group bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-slate-200 dark:border-slate-800 cursor-pointer relative overflow-hidden"
                                    >
                                        <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-transparent to-current opacity-5 rounded-bl-[100px] pointer-events-none transition-colors ${ticket.status === 'open' ? 'text-orange-500' : ticket.status === 'in_progress' ? 'text-blue-500' : 'text-emerald-500'
                                            }`} />

                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex items-center gap-2 text-xs font-bold font-mono text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">
                                                #{ticket.id}
                                            </div>
                                            <div className={`h-2.5 w-2.5 rounded-full shadow-lg ${getStatusColor(ticket.status)}`} />
                                        </div>

                                        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2 line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                            {ticket.subject}
                                        </h3>

                                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl line-clamp-2 min-h-[3.5rem]">
                                            {ticket.description}
                                        </p>

                                        <div className="flex items-center justify-between text-xs font-semibold text-slate-400 mt-auto pt-4 border-t border-slate-100 dark:border-slate-800">
                                            <span className="flex items-center gap-1.5">
                                                <Clock className="w-3.5 h-3.5" />
                                                {new Date(ticket.created_at).toLocaleDateString()}
                                            </span>
                                            <div className="flex items-center gap-2">
                                                {ticket.messages.length} msgs
                                                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform text-blue-500" />
                                            </div>
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </motion.div>
                    )}

                    {/* DETAIL VIEW OVERLAY */}
                    {viewMode === 'detail' && selectedTicket && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col md:flex-row min-h-[80vh]"
                        >
                            {/* Left Sidebar: Info */}
                            <div className="w-full md:w-80 bg-slate-50 dark:bg-slate-950 p-6 md:p-8 border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800 shrink-0">
                                <button
                                    onClick={() => setViewMode("grid")}
                                    className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-blue-600 mb-8 transition-colors group"
                                >
                                    <div className="p-1.5 bg-white dark:bg-slate-800 rounded-full shadow-sm group-hover:shadow-md transition-all">
                                        <ArrowLeft className="w-4 h-4" />
                                    </div>
                                    Back to Tickets
                                </button>

                                <div className="space-y-6">
                                    <div>
                                        <h2 className="text-xl font-bold text-slate-800 dark:text-white leading-tight mb-2">
                                            {selectedTicket.subject}
                                        </h2>
                                        <div className="flex flex-wrap gap-2">
                                            <span className="px-2.5 py-1 rounded-md text-[10px] uppercase font-bold tracking-wide bg-blue-100/50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                                                {selectedTicket.category || 'General'}
                                            </span>
                                            <span className={`px-2.5 py-1 rounded-md text-[10px] uppercase font-bold tracking-wide border bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300`}>
                                                {selectedTicket.status.replace('_', ' ')}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                            <FileText className="w-3.5 h-3.5" /> Description
                                        </h4>
                                        <p className="text-sm text-slate-600 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                                            {selectedTicket.description}
                                        </p>
                                    </div>

                                    <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-slate-500">Created</span>
                                            <span className="font-semibold text-slate-700 dark:text-slate-300">{new Date(selectedTicket.created_at).toLocaleDateString()}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-slate-500">Ticket ID</span>
                                            <span className="font-mono bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded text-xs">#{selectedTicket.id}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-slate-500">Priority</span>
                                            <span className={`font-bold capitalize ${selectedTicket.priority === 'high' ? 'text-red-500' : 'text-blue-500'
                                                }`}>{selectedTicket.priority}</span>
                                        </div>
                                    </div>

                                    {activeTab === 'internal' && selectedTicket.level !== 'super_admin' && (
                                        <button
                                            onClick={handleEscalate}
                                            disabled={escalating}
                                            className="w-full mt-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-xl font-bold shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
                                        >
                                            <ArrowUpRight className="w-4 h-4" />
                                            {escalating ? 'Escalating...' : 'Escalate to Admin'}
                                        </button>
                                    )}

                                    <button
                                        onClick={handleDelete}
                                        className="w-full mt-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-red-500 font-bold rounded-xl hover:bg-red-50 dark:hover:bg-red-900/10 flex items-center justify-center gap-2 transition-all"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        Delete Ticket
                                    </button>
                                </div>
                            </div>

                            {/* Right Content: Chat */}
                            <div className="flex-1 flex flex-col bg-white dark:bg-slate-900 relative">
                                <div className="absolute top-0 left-0 right-0 h-6 bg-gradient-to-b from-white dark:from-slate-900 to-transparent z-10" />

                                <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
                                    <div className="flex justify-center">
                                        <span className="text-xs font-bold text-slate-300 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full uppercase tracking-wider">
                                            Conversation Started
                                        </span>
                                    </div>

                                    {selectedTicket.messages.map((msg, idx) => {
                                        const isMe = msg.sender === user.id;
                                        return (
                                            <motion.div
                                                key={msg.id}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className={`flex gap-4 ${isMe ? 'flex-row-reverse' : ''}`}
                                            >
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs shadow-md shrink-0 ${isMe ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                                                    }`}>
                                                    {isMe ? 'ME' : 'SP'}
                                                </div>
                                                <div className="max-w-[75%] space-y-1">
                                                    <div className={`p-4 rounded-2xl shadow-sm text-sm leading-relaxed whitespace-pre-wrap ${isMe
                                                        ? 'bg-indigo-600 text-white rounded-tr-none'
                                                        : 'bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-100 dark:border-slate-700 rounded-tl-none'
                                                        }`}>
                                                        {msg.message}
                                                    </div>
                                                    <div className={`text-[10px] font-medium opacity-60 px-1 ${isMe ? 'text-right' : ''}`}>
                                                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </div>
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                    <div ref={messagesEndRef} />
                                </div>

                                <div className="p-4 md:p-6 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
                                    <div className="relative flex items-center gap-3">
                                        <input
                                            type="text"
                                            value={replyText}
                                            onChange={(e) => setReplyText(e.target.value)}
                                            placeholder="Type your reply here..."
                                            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleReply()}
                                            className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl px-6 py-4 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all shadow-inner"
                                        />
                                        <button
                                            onClick={handleReply}
                                            disabled={!replyText.trim()}
                                            className="p-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl shadow-lg shadow-indigo-500/30 disabled:opacity-50 disabled:shadow-none transition-all hover:scale-105 active:scale-95"
                                        >
                                            <Send className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* CREATE VIEW MODAL */}
                    {viewMode === 'create' && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 max-w-3xl mx-auto overflow-hidden p-8 md:p-12"
                        >
                            <div className="flex justify-between items-center mb-8">
                                <div>
                                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Create Support Ticket</h2>
                                    <p className="text-slate-500 mt-2">Describe your issue and we'll help you ASAP.</p>
                                </div>
                                <button onClick={() => setViewMode("grid")} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                                    <ArrowLeft className="w-6 h-6 text-slate-400" />
                                </button>
                            </div>

                            <form onSubmit={handleCreateTicket} className="space-y-8">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">SUBJECT</label>
                                    <input required type="text" value={newTicket.subject} onChange={e => setNewTicket({ ...newTicket, subject: e.target.value })}
                                        className="w-full px-5 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all font-medium" placeholder="E.g., Unable to generate invoice" />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">CATEGORY</label>
                                        <div className="relative">
                                            <LifeBuoy className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                            <select value={newTicket.category} onChange={e => setNewTicket({ ...newTicket, category: e.target.value })}
                                                className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-blue-500/20 outline-none appearance-none transition-all">
                                                <option>Technical</option><option>Billing</option><option>Feature Request</option><option>General</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">PRIORITY</label>
                                        <div className="flex gap-3">
                                            {['low', 'medium', 'high'].map(p => (
                                                <button
                                                    key={p}
                                                    type="button"
                                                    onClick={() => setNewTicket({ ...newTicket, priority: p })}
                                                    className={`flex-1 py-3 rounded-xl text-sm font-bold capitalize transition-all border ${newTicket.priority === p
                                                        ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-transparent shadow-lg transform scale-105'
                                                        : 'bg-white dark:bg-slate-900 text-slate-500 border-slate-200 dark:border-slate-700 hover:border-slate-400'
                                                        }`}
                                                >
                                                    {p}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">DESCRIPTION</label>
                                    <textarea required rows="6" value={newTicket.description} onChange={e => setNewTicket({ ...newTicket, description: e.target.value })}
                                        className="w-full px-5 py-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-blue-500/20 outline-none resize-none transition-all" placeholder="Please explain the issue in detail..." />
                                </div>
                                <div className="flex justify-end gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                                    <button type="button" onClick={() => setViewMode("grid")} className="px-6 py-3 font-bold text-slate-500 hover:text-slate-800 transition-colors">Cancel</button>
                                    <button type="submit" disabled={loading} className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-lg shadow-blue-500/30 transition-all hover:-translate-y-1">
                                        {loading ? "Creating..." : "Submit Ticket"}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
