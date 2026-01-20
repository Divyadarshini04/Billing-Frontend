import React, { useState, useEffect } from "react";
import { supplierAPI } from "../api/apiService";
import { motion } from "framer-motion";
import { Plus, Edit2, Trash2, Search, Truck, Phone, Mail, MapPin } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useContext } from "react";
import { NotificationContext } from "../context/NotificationContext";

export default function SupplierManagementPage() {
    const { userRole } = useAuth();
    const { addNotification } = useContext(NotificationContext);
    const [suppliers, setSuppliers] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [editing, setEditing] = useState(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [loading, setLoading] = useState(false);

    const [newSupplier, setNewSupplier] = useState({
        name: "",
        contact_person: "",
        phone: "",
        email: "",
        tax_id: "", // GSTIN
        address: "",
        status: "active"
    });

    useEffect(() => {
        fetchSuppliers();
    }, []);

    const fetchSuppliers = async () => {
        setLoading(true);
        try {
            const response = await supplierAPI.getAllSuppliers();
            const data = response.data?.results || response.data || [];
            setSuppliers(data);
        } catch (error) {
            addNotification("error", "Error", "Failed to load suppliers");
        } finally {
            setLoading(false);
        }
    };

    const filtered = suppliers.filter(s =>
        (s.name && s.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (s.contact_person && s.contact_person.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (s.phone && s.phone.includes(searchTerm))
    );

    async function handleAddSupplier() {
        if (!newSupplier.name.trim()) {
            alert("Please enter a supplier name");
            return;
        }

        // Generate a code if not present (simple logic)
        const supplierCode = `SUP-${Math.floor(1000 + Math.random() * 9000)}`;
        const dataToSend = { ...newSupplier, code: supplierCode };

        try {
            const response = await supplierAPI.createSupplier(dataToSend);
            if (response.data) {
                setSuppliers([...suppliers, response.data]);
                addNotification("success", "Supplier Added", `${newSupplier.name} added successfully`);
                setNewSupplier({ name: "", contact_person: "", phone: "", email: "", tax_id: "", address: "", status: "active" });
                setShowAddModal(false);
            }
        } catch (error) {
            console.error(error);
            addNotification("error", "Error", "Failed to add supplier. " + (error.response?.data?.detail || ""));
        }
    }

    async function handleUpdateSupplier() {
        try {
            const response = await supplierAPI.updateSupplier(editing.id, editing);
            if (response.data) {
                setSuppliers(suppliers.map(s => s.id === editing.id ? response.data : s));
                addNotification("success", "Supplier Updated", `${editing.name} updated successfully`);
                setEditing(null);
            }
        } catch (error) {
            addNotification("error", "Error", "Failed to update supplier");
        }
    }

    async function handleDeleteSupplier(id) {
        if (!window.confirm("Are you sure you want to delete this supplier?")) return;
        try {
            await supplierAPI.deleteSupplier(id);
            setSuppliers(suppliers.filter(s => s.id !== id));
            addNotification("success", "Supplier Deleted", "Supplier removed successfully");
        } catch (error) {
            addNotification("error", "Error", "Failed to delete supplier");
        }
    }

    // Permission check for Sales Executive (View Only)
    const canEdit = userRole === 'OWNER' || userRole === 'SUPER_ADMIN';

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-dark-bg p-4 md:p-8 transition-colors">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
            >
                <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Supplier Management</h1>
                        <p className="text-gray-600 dark:text-gray-300 mt-2">Manage your vendors and suppliers</p>
                    </div>
                    {canEdit && (
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setShowAddModal(true)}
                            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold transition-colors flex items-center gap-2 shadow-lg shadow-blue-200 dark:shadow-none"
                        >
                            <Plus className="w-5 h-5" />
                            Add Supplier
                        </motion.button>
                    )}
                </div>
            </motion.div>

            {/* Search Bar */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8"
            >
                <div className="flex items-center gap-2 bg-white dark:bg-dark-card rounded-lg px-4 py-3 border border-gray-200 dark:border-dark-border shadow-sm">
                    <Search className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search suppliers by name or phone..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="bg-transparent outline-none text-gray-900 dark:text-white placeholder-gray-500 flex-1"
                    />
                </div>
            </motion.div>

            {/* Suppliers Grid */}
            {loading ? (
                <div className="text-center py-12">
                    <div className="animate-spin w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
                </div>
            ) : (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ staggerChildren: 0.1 }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                    {filtered.map((supplier, idx) => (
                        <motion.div
                            key={supplier.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="p-6 rounded-xl bg-white dark:bg-dark-card border border-gray-100 dark:border-dark-border shadow-sm hover:shadow-lg transition-all group"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
                                        <Truck className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors">{supplier.name}</h3>
                                        <p className="text-xs text-gray-500 font-mono bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded inline-block mt-1">{supplier.code}</p>
                                    </div>
                                </div>

                                {canEdit && (
                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => setEditing(supplier)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><Edit2 className="w-4 h-4" /></button>
                                        <button onClick={() => handleDeleteSupplier(supplier.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-3 pt-2 border-t border-gray-100 dark:border-gray-800">
                                <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                                    <Phone className="w-4 h-4" /> {supplier.phone || "N/A"}
                                </div>
                                <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                                    <Mail className="w-4 h-4" /> {supplier.email || "N/A"}
                                </div>
                                <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                                    <MapPin className="w-4 h-4" /> {supplier.address ? (supplier.address.length > 30 ? supplier.address.substring(0, 30) + '...' : supplier.address) : "No Address"}
                                </div>
                                {supplier.tax_id && (
                                    <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                                        <span className="font-bold text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">GST: {supplier.tax_id}</span>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            )}

            {/* Add/Edit Modal */}
            {(showAddModal || editing) && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => { setShowAddModal(false); setEditing(null); }}>
                    <div className="bg-white dark:bg-dark-card rounded-xl p-8 max-w-lg w-full shadow-2xl" onClick={e => e.stopPropagation()}>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                            {editing ? "Edit Supplier" : "Add New Supplier"}
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            <div className="col-span-2">
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Supplier Name *</label>
                                <input
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-dark-border dark:bg-dark-bg focus:ring-2 focus:ring-blue-500"
                                    value={editing ? editing.name : newSupplier.name}
                                    onChange={e => editing ? setEditing({ ...editing, name: e.target.value }) : setNewSupplier({ ...newSupplier, name: e.target.value })}
                                />
                            </div>
                            <div className="col-span-2">
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Contact Person</label>
                                <input
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-dark-border dark:bg-dark-bg focus:ring-2 focus:ring-blue-500"
                                    value={editing ? editing.contact_person : newSupplier.contact_person}
                                    onChange={e => editing ? setEditing({ ...editing, contact_person: e.target.value }) : setNewSupplier({ ...newSupplier, contact_person: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Phone *</label>
                                <input
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-dark-border dark:bg-dark-bg focus:ring-2 focus:ring-blue-500"
                                    value={editing ? editing.phone : newSupplier.phone}
                                    onChange={e => editing ? setEditing({ ...editing, phone: e.target.value }) : setNewSupplier({ ...newSupplier, phone: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Email</label>
                                <input
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-dark-border dark:bg-dark-bg focus:ring-2 focus:ring-blue-500"
                                    value={editing ? editing.email : newSupplier.email}
                                    onChange={e => editing ? setEditing({ ...editing, email: e.target.value }) : setNewSupplier({ ...newSupplier, email: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">GSTIN</label>
                                <input
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-dark-border dark:bg-dark-bg focus:ring-2 focus:ring-blue-500"
                                    value={editing ? editing.tax_id : newSupplier.tax_id}
                                    onChange={e => editing ? setEditing({ ...editing, tax_id: e.target.value }) : setNewSupplier({ ...newSupplier, tax_id: e.target.value })}
                                />
                            </div>
                            <div className="col-span-2">
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Address</label>
                                <textarea
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-dark-border dark:bg-dark-bg focus:ring-2 focus:ring-blue-500"
                                    rows="3"
                                    value={editing ? editing.address : newSupplier.address}
                                    onChange={e => editing ? setEditing({ ...editing, address: e.target.value }) : setNewSupplier({ ...newSupplier, address: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={editing ? handleUpdateSupplier : handleAddSupplier}
                                className="flex-1 py-3 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-700 transition-colors"
                            >
                                {editing ? "Save Changes" : "Add Supplier"}
                            </button>
                            <button
                                onClick={() => { setShowAddModal(false); setEditing(null); }}
                                className="flex-1 py-3 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
