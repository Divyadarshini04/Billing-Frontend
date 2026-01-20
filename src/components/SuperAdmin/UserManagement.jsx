import React, { useState, useEffect, useContext } from "react";
import { Plus, Trash2, Eye, ChevronDown, Download, X, CheckCircle, User, Building, Mail, Phone, Calendar, Shield } from "lucide-react";
import { NotificationContext } from "../../context/NotificationContext";
import authAxios from "../../api/authAxios";

export default function UserManagement() {
  const { addNotification } = useContext(NotificationContext);
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [planFilter, setPlanFilter] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [showDetailDrawer, setShowDetailDrawer] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    phone: "",
    business_name: "",
    first_name: "",
    email: "",
    business_type: "",
    // Company profile fields
    company_code: "",
    tax_id: "",
    registration_number: "",
    street_address: "",
    city: "",
    state: "",
    postal_code: "",
    country: "India",
  });

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await authAxios.get('/api/super-admin/users/');
      const userData = Array.isArray(res.data) ? res.data : res.data?.results || [];

      setUsers(userData);
    } catch (error) {

      addNotification("Error loading users", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async () => {
    if (!formData.phone || !formData.business_name || !formData.first_name || !formData.business_type) {
      addNotification("Please fill all required fields", "error");
      return;
    }

    try {
      setLoading(true);
      const payload = {
        phone: formData.phone,
        last_name: formData.business_name,
        first_name: formData.first_name,
        business_type: formData.business_type,
      };

      if (formData.email) {
        payload.email = formData.email;
      }



      const res = await authAxios.post('/api/super-admin/users/', payload);
      setUsers([...users, res.data]);
      addNotification("Owner and company profile created successfully", "success");
      resetForm();
      setShowModal(false);
    } catch (error) {

      addNotification(error.response?.data?.detail || "Error creating owner", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    try {
      setLoading(true);
      await authAxios.delete(`/api/super-admin/users/${id}/`);
      setUsers(users.filter(u => u.id !== id));
      addNotification("User deleted successfully", "success");
    } catch (error) {

      addNotification("Error deleting user", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (user) => {
    try {
      setLoading(true);
      const res = await authAxios.patch(`/api/super-admin/users/${user.id}/`, {
        is_active: !user.is_active
      });
      setUsers(users.map(u =>
        u.id === user.id ? res.data : u
      ));
      // Update the detail drawer with new data if it's open
      if (selectedUser && selectedUser.id === user.id) {
        setSelectedUser(res.data);
      }
      addNotification(
        user.is_active ? "User deactivated" : "User activated",
        "success"
      );
    } catch (error) {

      addNotification("Error updating user status", "error");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEditingUser(null);
    setFormData({
      phone: "",
      business_name: "",
      first_name: "",
      email: "",
      business_type: "",
      company_code: "",
      tax_id: "",
      registration_number: "",
      street_address: "",
      city: "",
      state: "",
      postal_code: "",
      country: "India",
    });
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setFormData({
      phone: user.phone || "",
      business_name: user.last_name || user.business_name || "",
      first_name: user.first_name || "",
      email: user.email || "",
      business_type: user.business_type || "",
    });
    setShowModal(true);
    setShowDetailDrawer(false);
  };

  const handleUpdateUser = async () => {
    if (!formData.phone || !formData.business_name || !formData.first_name) {
      addNotification("Please fill all required fields", "error");
      return;
    }

    try {
      setLoading(true);
      const payload = {
        phone: formData.phone,
        last_name: formData.business_name,
        first_name: formData.first_name,
        is_active: editingUser.is_active,
      };

      if (formData.business_type) {
        payload.business_type = formData.business_type;
      }

      if (formData.email) {
        payload.email = formData.email;
      }

      const res = await authAxios.patch(`/api/super-admin/users/${editingUser.id}/`, payload);
      setUsers(users.map(u => u.id === editingUser.id ? res.data : u));
      // Update the detail drawer with new data if it's open
      if (selectedUser && selectedUser.id === editingUser.id) {
        setSelectedUser(res.data);
      }
      addNotification("User updated successfully", "success");
      resetForm();
      setShowModal(false);
    } catch (error) {

      addNotification(error.response?.data?.message || "Error updating user", "error");
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user =>
    !searchTerm ||
    user.phone?.includes(searchTerm) ||
    user.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.business_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const applyFilters = (userList) => {
    let filtered = userList;

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(user => {
        if (statusFilter === "active") return user.is_active;
        if (statusFilter === "inactive") return !user.is_active;
        return true;
      });
    }

    // Plan filter
    if (planFilter !== "all") {
      filtered = filtered.filter(user => {
        const userPlan = user.subscription?.plan_type?.toLowerCase() || "none";
        return userPlan === planFilter.toLowerCase();
      });
    }

    return filtered;
  };

  const finalUsers = applyFilters(filteredUsers);

  const handleExport = () => {
    try {
      const csvData = [
        ["Phone", "Business Name", "Owner Name", "Email", "Status", "Plan", "Date Joined"],
        ...finalUsers.map(user => [
          user.phone,
          user.business_name,
          user.first_name,
          user.email,
          user.is_active ? "Active" : "Inactive",
          user.subscription?.plan_type || "None",
          new Date(user.date_joined).toLocaleDateString()
        ])
      ];

      const csv = csvData.map(row =>
        row.map(cell => `"${cell || ""}"`).join(",")
      ).join("\n");

      const blob = new Blob([csv], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `users_export_${new Date().toISOString().split("T")[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);

      addNotification("Users exported successfully", "success");
    } catch (error) {

      addNotification("Error exporting users", "error");
    }
  };

  const handleExtendSubscription = async (userId, days) => {
    try {
      setLoading(true);
      await authAxios.post(`/api/super-admin/users/${userId}/extend-subscription/`, {
        days: days
      });
      fetchUsers();
      addNotification(`Subscription extended by ${days} days`, "success");
    } catch (error) {

      addNotification("Error extending subscription", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleChangePlan = async (userId, planType) => {
    try {
      setLoading(true);
      await authAxios.post(`/api/super-admin/users/${userId}/change-plan/`, {
        plan_type: planType
      });
      fetchUsers();
      addNotification(`Plan changed to ${planType}`, "success");
    } catch (error) {

      addNotification("Error changing plan", "error");
    } finally {
      setLoading(false);
    }
  };

  const getPlanColor = (planType) => {
    const colors = {
      free: "bg-gray-500/20 text-gray-400",
      basic: "bg-blue-500/20 text-blue-400",
      standard: "bg-purple-500/20 text-purple-400",
      premium: "bg-yellow-500/20 text-yellow-400",
    };
    return colors[planType?.toLowerCase()] || colors.free;
  };

  const getStatusColor = (isActive) => {
    return isActive
      ? "bg-green-900/30 text-green-400"
      : "bg-red-900/30 text-red-400";
  };

  const getDaysRemaining = (expiryDate) => {
    if (!expiryDate) return null;
    const now = new Date();
    const expiry = new Date(expiryDate);
    const days = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 0;
  };

  return (
    <div className="p-6 bg-slate-900 min-h-screen text-slate-100">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">User Management</h1>
            <p className="text-slate-400">{finalUsers.length} of {users.length} users</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
            <button
              onClick={() => {
                resetForm();
                setShowModal(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition"
            >
              <Plus className="w-4 h-4" />
              Add New User
            </button>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="mb-6 space-y-4">
          <input
            type="text"
            placeholder="Search by phone, business name, or owner name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />

          <div className="flex gap-4 flex-wrap">
            <div>
              <label className="text-sm text-slate-400 block mb-2">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <div>
              <label className="text-sm text-slate-400 block mb-2">Plan</label>
              <select
                value={planFilter}
                onChange={(e) => setPlanFilter(e.target.value)}
                className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
              >
                <option value="all">All Plans</option>
                <option value="free">Free</option>
                <option value="basic">Basic</option>
                <option value="standard">Standard</option>
                <option value="premium">Premium</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="text-center py-8 text-slate-400">Loading...</div>
        ) : finalUsers.length === 0 ? (
          <div className="text-center py-8 text-slate-400">No users found</div>
        ) : (
          <div className="overflow-x-auto bg-slate-800 rounded-lg border border-slate-700">
            <table className="w-full">
              <thead className="bg-slate-700 border-b border-slate-600">
                <tr>
                  <th className="px-6 py-3 text-left font-semibold text-slate-200">Business Info</th>
                  <th className="px-6 py-3 text-left font-semibold text-slate-200">Email</th>
                  <th className="px-6 py-3 text-left font-semibold text-slate-200">Business Type</th>
                  <th className="px-6 py-3 text-left font-semibold text-slate-200">Plan</th>
                  <th className="px-6 py-3 text-left font-semibold text-slate-200">Expiry</th>
                  <th className="px-6 py-3 text-left font-semibold text-slate-200">Status</th>
                  <th className="px-6 py-3 text-left font-semibold text-slate-200">Actions</th>
                </tr>
              </thead>
              <tbody>
                {finalUsers.map((user) => {
                  const daysRemaining = getDaysRemaining(user.subscription?.expiry_date);
                  return (
                    <tr
                      key={user.id}
                      className="border-b border-slate-700 hover:bg-slate-700/50 transition"
                    >
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Building className="w-4 h-4 text-blue-400 flex-shrink-0" />
                            <div className="font-semibold text-white">{user.last_name || user.business_name || "-"}</div>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-slate-400">
                            <User className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                            {user.first_name}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-slate-500">
                            <Phone className="w-3.5 h-3.5 text-slate-600 flex-shrink-0" />
                            {user.phone}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-slate-300">
                          <Mail className="w-4 h-4 text-slate-500 flex-shrink-0" />
                          <span className="text-sm">{user.email || "-"}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 rounded-full text-sm font-medium bg-slate-700 text-slate-300">
                          {user.business_type ? user.business_type.charAt(0).toUpperCase() + user.business_type.slice(1) : "-"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Shield className="w-4 h-4 text-slate-500 flex-shrink-0" />
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPlanColor(user.subscription?.plan_type)}`}>
                            {user.subscription?.plan_type || "None"}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {user.subscription?.expiry_date ? (
                          <div>
                            <div className="flex items-center gap-2 text-slate-300">
                              <Calendar className="w-4 h-4 text-slate-500 flex-shrink-0" />
                              <span className="text-sm">{new Date(user.subscription.expiry_date).toLocaleDateString()}</span>
                            </div>
                            <div className={`text-sm mt-1 ${daysRemaining <= 7 ? "text-red-400" : "text-slate-400"}`}>
                              {daysRemaining} days left
                            </div>
                          </div>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(user.is_active)}`}>
                          {user.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setSelectedUser(user);
                              setShowDetailDrawer(true);
                            }}
                            className="p-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded transition"
                            title="View details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            disabled={loading}
                            className="p-2 bg-red-600/20 hover:bg-red-600/40 text-red-400 hover:text-red-300 rounded transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Delete user"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Detail Drawer */}
        {showDetailDrawer && selectedUser && (
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setShowDetailDrawer(false)} />
        )}
        {showDetailDrawer && selectedUser && (
          <div className="fixed right-0 top-0 h-full w-full max-w-md bg-slate-800 border-l border-slate-700 shadow-xl z-50 overflow-y-auto">
            <div className="p-6">
              {/* Header */}
              <div className="flex justify-between items-start mb-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Building className="w-6 h-6 text-blue-400" />
                    <h2 className="text-2xl font-bold text-white">{selectedUser.last_name || selectedUser.business_name}</h2>
                  </div>
                  <p className="text-slate-400 text-sm flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    {selectedUser.phone}
                  </p>
                </div>
                <button
                  onClick={() => setShowDetailDrawer(false)}
                  className="p-2 hover:bg-slate-700 rounded transition"
                >
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              {/* Owner Information */}
              <div className="mb-6 pb-6 border-b border-slate-700">
                <h3 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Owner Information
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 flex-shrink-0">Name:</span>
                    <span className="text-white">{selectedUser.first_name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-slate-500 flex-shrink-0" />
                    <span className="text-slate-400 flex-shrink-0">Email:</span>
                    <span className="text-white">{selectedUser.email || "-"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-slate-500 flex-shrink-0" />
                    <span className="text-slate-400 flex-shrink-0">Joined:</span>
                    <span className="text-white">{new Date(selectedUser.date_joined).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              {/* Business Type Information */}
              {selectedUser.business_type && (
                <div className="mb-6 pb-6 border-b border-slate-700">
                  <h3 className="text-sm font-semibold text-slate-300 mb-3">Business Type</h3>
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-slate-700 text-slate-300">
                    {selectedUser.business_type.charAt(0).toUpperCase() + selectedUser.business_type.slice(1)}
                  </span>
                </div>
              )}

              {/* Subscription Information */}
              <div className="mb-6 pb-6 border-b border-slate-700">
                <h3 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Subscription
                </h3>
                {selectedUser.subscription ? (
                  <div className="space-y-3">
                    <div>
                      <span className="text-slate-400 text-sm">Current Plan</span>
                      <div className={`mt-1 px-3 py-1 rounded-full text-sm font-medium w-fit ${getPlanColor(selectedUser.subscription.plan_type)}`}>
                        {selectedUser.subscription.plan_type}
                      </div>
                    </div>
                    <div>
                      <span className="text-slate-400 text-sm">Expiry Date</span>
                      <div className="text-white font-medium">{new Date(selectedUser.subscription.expiry_date).toLocaleDateString()}</div>
                    </div>
                    <div>
                      <span className="text-slate-400 text-sm">Days Remaining</span>
                      <div className={`font-medium ${getDaysRemaining(selectedUser.subscription.expiry_date) <= 7 ? "text-red-400" : "text-green-400"}`}>
                        {getDaysRemaining(selectedUser.subscription.expiry_date)} days
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-slate-400 text-sm">No active subscription</div>
                )}
              </div>

              {/* Account Status */}
              <div className="mb-6 pb-6 border-b border-slate-700">
                <h3 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Account Status
                </h3>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedUser.is_active)}`}>
                  {selectedUser.is_active ? "Active" : "Inactive"}
                </span>
              </div>

              {/* Quick Actions */}
              <div className="space-y-2">
                <button
                  onClick={() => handleEditUser(selectedUser)}
                  className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition text-sm"
                >
                  Edit User
                </button>
                <button
                  onClick={() => handleToggleActive(selectedUser)}
                  className={`w-full px-4 py-2 rounded-lg transition text-sm ${selectedUser.is_active
                    ? "bg-red-600 hover:bg-red-700 text-white"
                    : "bg-green-600 hover:bg-green-700 text-white"
                    }`}
                >
                  {selectedUser.is_active ? "Deactivate" : "Activate"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add/Edit User Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-y-auto">
            <div className="bg-slate-800 rounded-lg p-6 w-full max-w-2xl border border-slate-700 my-8">
              <h2 className="text-2xl font-bold text-white mb-4">
                {editingUser ? "Edit Owner" : "Create New Owner"}
              </h2>

              <div className="space-y-6 max-h-[80vh] overflow-y-auto">
                {/* Owner Info */}
                <div>
                  <h3 className="text-sm font-semibold text-slate-300 mb-3">Owner Information</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Phone *
                      </label>
                      <input
                        type="text"
                        value={formData.phone}
                        onChange={(e) =>
                          setFormData({ ...formData, phone: e.target.value })
                        }
                        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white focus:outline-none focus:border-blue-500"
                        placeholder="Enter phone number"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Business Name *
                      </label>
                      <input
                        type="text"
                        value={formData.business_name}
                        onChange={(e) =>
                          setFormData({ ...formData, business_name: e.target.value })
                        }
                        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white focus:outline-none focus:border-blue-500"
                        placeholder="Enter business name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Owner Name *
                      </label>
                      <input
                        type="text"
                        value={formData.first_name}
                        onChange={(e) =>
                          setFormData({ ...formData, first_name: e.target.value })
                        }
                        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white focus:outline-none focus:border-blue-500"
                        placeholder="Enter owner name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white focus:outline-none focus:border-blue-500"
                        placeholder="Enter email (optional)"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Business Type *
                      </label>
                      <select
                        value={formData.business_type}
                        onChange={(e) =>
                          setFormData({ ...formData, business_type: e.target.value })
                        }
                        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white focus:outline-none focus:border-blue-500"
                      >
                        <option value="">Select Business Type</option>
                        <option value="retail">Retail</option>
                        <option value="wholesale">Wholesale</option>
                        <option value="service">Service</option>
                        <option value="grocery">Grocery</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    resetForm();
                    setShowModal(false);
                  }}
                  className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition"
                >
                  Cancel
                </button>
                <button
                  onClick={editingUser ? handleUpdateUser : handleAddUser}
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white rounded-lg font-medium transition"
                >
                  {loading ? "Saving..." : editingUser ? "Update" : "Create Owner"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
