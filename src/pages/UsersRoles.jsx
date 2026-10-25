import React, { useState, useEffect } from 'react';
import {
  Users,
  UserPlus,
  Shield,
  Search,
  CheckCircle2,
  XCircle,
  Building,
  Mail,
  KeyRound,
  ShieldCheck,
  AlertTriangle,
  Clock,
  UserCheck,
  Check,
  X,
  Phone,
  RefreshCw,
  FileText
} from 'lucide-react';
import { useAppData } from '../context/AppDataContext';
import { useAuth } from '../context/AuthContext';
import { PageHeader } from '../components/common/PageHeader';
import { Button } from '../components/common/Button';
import { Badge, StatusBadge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { SearchInput } from '../components/common/SearchInput';
import { ROLES, ROLE_DETAILS } from '../utils/permissions';
import { adminApi } from '../services/apiService';

export const UsersRoles = () => {
  const { users, dataMode, addAuditLog } = useAppData();
  const { currentUser } = useAuth();

  const [activeTab, setActiveTab] = useState('accounts'); // 'accounts' | 'requests'
  const [userList, setUserList] = useState(users);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState('ALL');

  // Officer Access Requests state
  const [officerRequests, setOfficerRequests] = useState([]);
  const [isLoadingRequests, setIsLoadingRequests] = useState(false);
  const [actionMessage, setActionMessage] = useState(null);

  // Add User Modal
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: 'REGIONAL_OFFICER',
    department: 'Regional Approval & Scrutiny',
    region: 'South-Western (Bangalore)',
    status: 'ACTIVE'
  });

  // Load Officer Requests
  const loadOfficerRequests = async () => {
    setIsLoadingRequests(true);
    try {
      if (dataMode === 'live') {
        const res = await adminApi.getOfficerRequests();
        if (res.data) {
          setOfficerRequests(res.data);
        }
      } else {
        const stored = JSON.parse(localStorage.getItem('aicte_demo_officer_requests') || '[]');
        setOfficerRequests(stored);
      }
    } catch (err) {
      console.warn('Failed to load officer requests', err);
    } finally {
      setIsLoadingRequests(false);
    }
  };

  useEffect(() => {
    loadOfficerRequests();
  }, [dataMode]);

  useEffect(() => {
    setUserList(users);
  }, [users]);

  // Handle Approve Request
  const handleApproveRequest = async (request) => {
    const assignedRole = prompt(
      `Confirm or assign role for ${request.fullName}:`,
      request.requestedRole || 'REGIONAL_OFFICER'
    );
    if (!assignedRole) return;

    try {
      if (dataMode === 'live') {
        await adminApi.approveOfficerRequest(request.id, { assignedRole });
      } else {
        // Update in localStorage
        const stored = JSON.parse(localStorage.getItem('aicte_demo_officer_requests') || '[]');
        const updated = stored.map((r) =>
          r.id === request.id ? { ...r, status: 'APPROVED', reviewedBy: currentUser?.name || 'Administrator' } : r
        );
        localStorage.setItem('aicte_demo_officer_requests', JSON.stringify(updated));

        // Add to approved mock officers
        const approvedOfficers = JSON.parse(localStorage.getItem('aicte_demo_approved_officers') || '[]');
        approvedOfficers.push({
          id: `USR-${Math.floor(100 + Math.random() * 900)}`,
          name: request.fullName,
          email: request.email,
          role: assignedRole,
          department: request.department,
          region: request.region || 'All Regions',
          status: 'ACTIVE',
          lastLogin: 'Never',
        });
        localStorage.setItem('aicte_demo_approved_officers', JSON.stringify(approvedOfficers));
      }

      // Record Audit Log
      addAuditLog({
        entityId: request.id,
        action: 'OFFICER_REQUEST_APPROVED',
        previousState: 'PENDING_APPROVAL',
        newState: 'ACTIVE',
        reason: `Officer access approved by ${currentUser?.name || 'Admin'} with role ${assignedRole}`,
        user: currentUser,
      });

      setActionMessage(`Officer request ${request.id} for ${request.fullName} has been approved.`);
      loadOfficerRequests();
      setTimeout(() => setActionMessage(null), 5000);
    } catch (err) {
      alert('Error approving officer request: ' + (err.response?.data?.message || err.message));
    }
  };

  // Handle Reject Request
  const handleRejectRequest = async (request) => {
    const reason = prompt(`Enter rejection reason for ${request.fullName}:`, 'Incomplete official credentials');
    if (!reason) return;

    try {
      if (dataMode === 'live') {
        await adminApi.rejectOfficerRequest(request.id, { reason });
      } else {
        const stored = JSON.parse(localStorage.getItem('aicte_demo_officer_requests') || '[]');
        const updated = stored.map((r) =>
          r.id === request.id ? { ...r, status: 'REJECTED', reviewedBy: currentUser?.name || 'Administrator', rejectionReason: reason } : r
        );
        localStorage.setItem('aicte_demo_officer_requests', JSON.stringify(updated));
      }

      addAuditLog({
        entityId: request.id,
        action: 'OFFICER_REQUEST_REJECTED',
        previousState: 'PENDING_APPROVAL',
        newState: 'REJECTED',
        reason: `Officer access request rejected. Reason: ${reason}`,
        user: currentUser,
      });

      setActionMessage(`Officer request ${request.id} has been rejected.`);
      loadOfficerRequests();
      setTimeout(() => setActionMessage(null), 5000);
    } catch (err) {
      alert('Error rejecting officer request: ' + (err.response?.data?.message || err.message));
    }
  };

  const filteredUsers = userList.filter((u) => {
    const matchSearch =
      !searchQuery ||
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchRole = selectedRole === 'ALL' || u.role === selectedRole;
    return matchSearch && matchRole;
  });

  const toggleUserStatus = (userId) => {
    setUserList((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          const nextStatus = u.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
          addAuditLog({
            entityId: u.id,
            action: 'USER_STATUS_UPDATED',
            previousState: u.status,
            newState: nextStatus,
            reason: `Administrator toggled status of ${u.name} to ${nextStatus}`,
            user: currentUser,
          });
          return { ...u, status: nextStatus };
        }
        return u;
      })
    );
  };

  const handleAddUserSubmit = (e) => {
    e.preventDefault();
    if (!newUser.name || !newUser.email) {
      alert('Name and Email are required.');
      return;
    }

    const created = {
      id: `USR-${Math.floor(100 + Math.random() * 900)}`,
      ...newUser,
      lastLogin: 'Never',
    };

    setUserList([created, ...userList]);
    setIsAddUserOpen(false);
    setNewUser({
      name: '',
      email: '',
      role: 'REGIONAL_OFFICER',
      department: 'Regional Approval & Scrutiny',
      region: 'South-Western (Bangalore)',
      status: 'ACTIVE',
    });

    addAuditLog({
      entityId: created.id,
      action: 'USER_PROVISIONED',
      previousState: 'NONE',
      newState: 'ACTIVE',
      reason: `New official user ${created.name} provisioned manually by Administrator`,
      user: currentUser,
    });
  };

  const pendingRequestsCount = officerRequests.filter((r) => r.status === 'PENDING_APPROVAL').length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="User Accounts & Role-Based Access Control"
        subtitle="Manage government officials, committee members, compliance reviewers, and officer access requests"
        badge={<Badge variant="navy">Security & IAM</Badge>}
        actions={
          activeTab === 'accounts' ? (
            <Button
              variant="primary"
              size="sm"
              icon={UserPlus}
              onClick={() => setIsAddUserOpen(true)}
            >
              Add New User
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              icon={RefreshCw}
              onClick={loadOfficerRequests}
              isLoading={isLoadingRequests}
            >
              Refresh Requests
            </Button>
          )
        }
      />

      {/* Action Success Alert */}
      {actionMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* Tab Switcher: Active Accounts vs Officer Access Requests */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          type="button"
          onClick={() => setActiveTab('accounts')}
          className={`pb-3 px-3 text-xs sm:text-sm font-bold uppercase tracking-wider border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'accounts'
              ? 'border-gov-800 text-gov-900'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Active Official Accounts</span>
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-mono">
            {userList.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('requests');
            loadOfficerRequests();
          }}
          className={`pb-3 px-3 text-xs sm:text-sm font-bold uppercase tracking-wider border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'requests'
              ? 'border-gov-800 text-gov-900'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>Officer Access Requests</span>
          {pendingRequestsCount > 0 ? (
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 font-bold animate-pulse">
              {pendingRequestsCount} Pending
            </span>
          ) : (
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-mono">
              {officerRequests.length}
            </span>
          )}
        </button>
      </div>

      {/* TAB 1: ACTIVE ACCOUNTS */}
      {activeTab === 'accounts' && (
        <div className="space-y-4">
          {/* Filter and Search */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-card">
            <div className="w-full sm:w-80">
              <SearchInput
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Search by name, email..."
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500 uppercase">Role:</span>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-300 rounded-lg p-2"
              >
                <option value="ALL">All Roles</option>
                {Object.keys(ROLES).map((k) => (
                  <option key={k} value={k}>
                    {ROLE_DETAILS[k]?.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* User Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-card overflow-hidden">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-3">Official / User</th>
                  <th className="p-3">Role Authority</th>
                  <th className="p-3">Department & Region</th>
                  <th className="p-3">Last Active</th>
                  <th className="p-3">Account Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={u.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&fit=crop&q=80'}
                          alt={u.name}
                          className="w-8 h-8 rounded-full border border-slate-200 object-cover"
                        />
                        <div>
                          <p className="font-bold text-slate-900">{u.name}</p>
                          <p className="font-mono text-[11px] text-slate-400">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3">
                      <Badge variant="navy">{ROLE_DETAILS[u.role]?.name || u.role}</Badge>
                    </td>
                    <td className="p-3">
                      <div className="text-slate-800 font-medium">{u.department}</div>
                      <div className="text-[10px] text-slate-400">{u.region || 'National Pool'}</div>
                    </td>
                    <td className="p-3 font-mono text-slate-500">{u.lastLogin || 'Never'}</td>
                    <td className="p-3">
                      <StatusBadge status={u.status} />
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => toggleUserStatus(u.id)}
                        className={`text-xs font-semibold px-2.5 py-1 rounded-md border transition-colors ${
                          u.status === 'ACTIVE'
                            ? 'text-rose-600 border-rose-200 hover:bg-rose-50'
                            : 'text-emerald-600 border-emerald-200 hover:bg-emerald-50'
                        }`}
                      >
                        {u.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: OFFICER ACCESS REQUESTS */}
      {activeTab === 'requests' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 text-xs text-blue-900 flex items-start gap-3">
            <Shield className="w-5 h-5 text-gov-800 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-gov-950 uppercase tracking-wide">
                Officer Access Approval & Provisioning Desk
              </h4>
              <p className="mt-0.5 leading-relaxed">
                Review submitted officer registration requests. Authorize access only after cross-verifying official AICTE staff identification numbers. Approving a request instantly provisions active role authorities and issues cryptographic audit stamps.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-card overflow-hidden">
            {officerRequests.length === 0 ? (
              <div className="p-12 text-center text-slate-500 text-xs">
                <UserCheck className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="font-semibold text-slate-700">No officer access requests found</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  When new officers submit requests from the login page, they will appear here for administrator verification.
                </p>
              </div>
            ) : (
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="p-3">Applicant Officer</th>
                    <th className="p-3">Staff ID</th>
                    <th className="p-3">Requested Cadre</th>
                    <th className="p-3">Department & Region</th>
                    <th className="p-3">Submission Date</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Admin Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {officerRequests.map((req) => (
                    <tr key={req.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3">
                        <div>
                          <p className="font-bold text-slate-900">{req.fullName}</p>
                          <p className="font-mono text-[11px] text-slate-500">{req.email}</p>
                          <p className="text-[10px] text-slate-400 font-mono">{req.contactNumber}</p>
                        </div>
                      </td>
                      <td className="p-3 font-mono font-bold text-gov-900">
                        {req.employeeId}
                      </td>
                      <td className="p-3">
                        <Badge variant="navy">
                          {ROLE_DETAILS[req.requestedRole]?.name || req.designation || req.requestedRole}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <div className="text-slate-800 font-medium">{req.department}</div>
                        <div className="text-[10px] text-slate-500">{req.region || 'All Regions'}</div>
                      </td>
                      <td className="p-3 font-mono text-slate-500">
                        {req.createdAt || 'Recent'}
                      </td>
                      <td className="p-3">
                        {req.status === 'PENDING_APPROVAL' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                            <Clock className="w-3 h-3 text-amber-600" />
                            PENDING_APPROVAL
                          </span>
                        )}
                        {req.status === 'APPROVED' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            APPROVED
                          </span>
                        )}
                        {req.status === 'REJECTED' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-900 border border-rose-300">
                            <XCircle className="w-3 h-3 text-rose-600" />
                            REJECTED
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-right">
                        {req.status === 'PENDING_APPROVAL' ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleApproveRequest(req)}
                              className="px-2.5 py-1 text-xs font-bold rounded bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-sm"
                            >
                              Approve
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRejectRequest(req)}
                              className="px-2.5 py-1 text-xs font-bold rounded border border-rose-300 text-rose-700 hover:bg-rose-50 transition-colors"
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">
                            Reviewed by {req.reviewedBy || 'Admin'}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* Add User Modal */}
      <Modal
        isOpen={isAddUserOpen}
        onClose={() => setIsAddUserOpen(false)}
        title="Provision Official Staff Account"
      >
        <form onSubmit={handleAddUserSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Official Name</label>
            <input
              type="text"
              value={newUser.name}
              onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
              placeholder="e.g. Dr. Rajesh Kumar"
              className="w-full p-2 border border-slate-300 rounded-lg"
              required
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Gov Official Email</label>
            <input
              type="email"
              value={newUser.email}
              onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
              placeholder="e.g. rajesh.kumar@gov.in"
              className="w-full p-2 border border-slate-300 rounded-lg"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Assigned Role</label>
              <select
                value={newUser.role}
                onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                className="w-full p-2 border border-slate-300 rounded-lg"
              >
                {Object.keys(ROLES).map((k) => (
                  <option key={k} value={k}>
                    {ROLE_DETAILS[k]?.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Regional Office</label>
              <input
                type="text"
                value={newUser.region}
                onChange={(e) => setNewUser({ ...newUser, region: e.target.value })}
                className="w-full p-2 border border-slate-300 rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Department / Bureau</label>
            <input
              type="text"
              value={newUser.department}
              onChange={(e) => setNewUser({ ...newUser, department: e.target.value })}
              className="w-full p-2 border border-slate-300 rounded-lg"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsAddUserOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Provision Official
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
