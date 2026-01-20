import { useState } from "react";
import { Search, Filter, Download, Eye, RefreshCw } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Badge } from "../ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

interface AuditLog {
  id: string;
  date: string;
  action: string;
  actor: string;
  portfolioId: string;
  details: string;
  referralCode?: string;
}

export function AdminAuditPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterAction, setFilterAction] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [auditLogs] = useState<AuditLog[]>([
    {
      id: "1",
      date: "2025-10-30 14:32:15",
      action: "Portfolio Created",
      actor: "John Doe",
      portfolioId: "PORT-001",
      details: "Created new portfolio with referral code JD8X4K2M",
      referralCode: "JD8X4K2M"
    },
    {
      id: "2",
      date: "2025-10-30 13:45:22",
      action: "Reference Added",
      actor: "Jane Smith",
      portfolioId: "PORT-002",
      details: "Added reference item: Customer Portal Redesign"
    },
    {
      id: "3",
      date: "2025-10-30 12:18:09",
      action: "Referral Code Used",
      actor: "Mike Johnson",
      portfolioId: "PORT-003",
      details: "Used referral code JD8X4K2M to connect",
      referralCode: "JD8X4K2M"
    },
    {
      id: "4",
      date: "2025-10-30 11:22:45",
      action: "Profile Updated",
      actor: "Sarah Wilson",
      portfolioId: "PORT-004",
      details: "Updated bio and contact information"
    },
    {
      id: "5",
      date: "2025-10-30 10:15:33",
      action: "Visibility Changed",
      actor: "John Doe",
      portfolioId: "PORT-001",
      details: "Changed visibility from 'org-only' to 'public'"
    },
    {
      id: "6",
      date: "2025-10-29 16:42:11",
      action: "Referral Code Regenerated",
      actor: "Emily Brown",
      portfolioId: "PORT-005",
      details: "Generated new referral code EB5Y9N1P",
      referralCode: "EB5Y9N1P"
    },
    {
      id: "7",
      date: "2025-10-29 15:30:44",
      action: "Reference Deleted",
      actor: "Alex Chen",
      portfolioId: "PORT-006",
      details: "Deleted reference: Legacy Project Migration"
    },
    {
      id: "8",
      date: "2025-10-29 14:05:28",
      action: "Avatar Uploaded",
      actor: "Jane Smith",
      portfolioId: "PORT-002",
      details: "Uploaded new profile avatar (profile-pic.jpg)"
    },
    {
      id: "9",
      date: "2025-10-29 13:12:17",
      action: "Portfolio Shared",
      actor: "John Doe",
      portfolioId: "PORT-001",
      details: "Shared portfolio link via email"
    },
    {
      id: "10",
      date: "2025-10-29 11:55:02",
      action: "Reference Reordered",
      actor: "Mike Johnson",
      portfolioId: "PORT-003",
      details: "Reordered 3 reference items"
    }
  ]);

  const getActionBadgeColor = (action: string) => {
    if (action.includes("Created")) return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300";
    if (action.includes("Deleted")) return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300";
    if (action.includes("Updated") || action.includes("Changed")) return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300";
    if (action.includes("Referral")) return "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300";
    return "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300";
  };

  const filteredLogs = auditLogs.filter((log) => {
    const matchesSearch = 
      log.actor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.portfolioId.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = filterAction === "all" || log.action.toLowerCase().includes(filterAction.toLowerCase());
    
    return matchesSearch && matchesFilter;
  });

  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedLogs = filteredLogs.slice(startIndex, startIndex + itemsPerPage);

  const exportLogs = () => {
    const csv = [
      ["Date", "Action", "Actor", "Portfolio ID", "Details"],
      ...filteredLogs.map(log => [
        log.date,
        log.action,
        log.actor,
        log.portfolioId,
        log.details
      ])
    ].map(row => row.join(",")).join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-gray-900 dark:text-white mb-2">Audit Logs</h1>
          <p className="text-gray-600 dark:text-gray-400">Monitor portfolio activities and referral tracking</p>
        </div>

        {/* Filters and Search */}
        <Card className="mb-6 shadow-md">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                <Input
                  placeholder="Search by actor, action, or portfolio ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <Select value={filterAction} onValueChange={setFilterAction}>
                  <SelectTrigger className="w-48">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Actions</SelectItem>
                    <SelectItem value="created">Created</SelectItem>
                    <SelectItem value="updated">Updated</SelectItem>
                    <SelectItem value="deleted">Deleted</SelectItem>
                    <SelectItem value="referral">Referral</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" onClick={exportLogs} className="gap-2">
                  <Download className="h-4 w-4" />
                  Export
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-4 mb-6">
          <Card className="shadow-md">
            <CardHeader className="pb-3">
              <CardDescription>Total Actions</CardDescription>
              <CardTitle className="text-3xl text-blue-600 dark:text-blue-400">{auditLogs.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card className="shadow-md">
            <CardHeader className="pb-3">
              <CardDescription>Referral Codes Used</CardDescription>
              <CardTitle className="text-3xl text-purple-600 dark:text-purple-400">
                {auditLogs.filter(log => log.referralCode).length}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card className="shadow-md">
            <CardHeader className="pb-3">
              <CardDescription>Portfolios Created</CardDescription>
              <CardTitle className="text-3xl text-green-600 dark:text-green-400">
                {auditLogs.filter(log => log.action.includes("Created")).length}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card className="shadow-md">
            <CardHeader className="pb-3">
              <CardDescription>Today's Activity</CardDescription>
              <CardTitle className="text-3xl text-orange-600 dark:text-orange-400">
                {auditLogs.filter(log => log.date.includes("2025-10-30")).length}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Audit Table */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Activity Log</CardTitle>
            <CardDescription>
              Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredLogs.length)} of {filteredLogs.length} entries
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50 dark:bg-dark-card">
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Actor</TableHead>
                    <TableHead>Portfolio ID</TableHead>
                    <TableHead>Details</TableHead>
                    <TableHead className="text-center">View</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedLogs.map((log) => (
                    <TableRow key={log.id} className="hover:bg-gray-50 dark:hover:bg-dark-border">
                      <TableCell className="font-mono text-sm text-gray-600 dark:text-gray-400">
                        {log.date}
                      </TableCell>
                      <TableCell>
                        <Badge className={getActionBadgeColor(log.action)}>
                          {log.action}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium text-gray-900 dark:text-white">
                        {log.actor}
                      </TableCell>
                      <TableCell className="font-mono text-sm dark:text-gray-400">
                        {log.portfolioId}
                      </TableCell>
                      <TableCell className="max-w-xs">
                        <div className="flex flex-col gap-1">
                          <span className="text-sm text-gray-700 dark:text-gray-300">{log.details}</span>
                          {log.referralCode && (
                            <code className="text-xs font-mono bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 px-2 py-1 rounded w-fit">
                              {log.referralCode}
                            </code>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6">
                <p className="text-sm text-gray-600">
                  Page {currentPage} of {totalPages}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
