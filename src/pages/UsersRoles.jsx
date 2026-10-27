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
  FileText,
  Database,
  AlertCircle,
  FileCheck
} from 'lucide-react';
import { useAppData } from '../context/AppDataContext';
import { useAuth } from '../context/AuthContext';
import { PageHeader } from '../components/common/PageHeader';
import { Button } from '../components/common/Button';
import { Badge, StatusBadge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { SearchInput } from '../components/common/SearchInput';
import { ROLES, ROLE_DETAILS } from '../utils/permissions';
import { adminApi, institutionsApi } from '../services/apiService';

export const UsersRoles = () => {
  const { users, dataMode, addAuditLog, refreshInstitutions } = useAppData();
  const { currentUser } = useAuth();

  const [activeTab, setActiveTab] = useState('accounts'); // 'accounts' | 'requests' | 'institutions'
  const [userList, setUserList] = useState(users);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState('ALL');

  // Officer Access Requests state
  const [officerRequests, setOfficerRequests] = useState([]);
  const [isLoadingRequests, setIsLoadingRequests] = useState(false);
  const [actionMessage, setActionMessage] = useState(null);

  // Institution Verification state
  const [institutions, setInstitutions] = useState([]);
  const [isLoadingInstitutions, setIsLoadingInstitutions] = useState(false);
  const [institutionsError, setInstitutionsError] = useState(null);
  const [institutionStatusFilter, setInstitutionStatusFilter] = useState('PENDING_VERIFICATION');
  const [institutionSearchQuery, setInstitutionSearchQuery] = useState('');
  const [selectedInstForReject, setSelectedInstForReject] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);

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

  // Load Institutions for Verification
  const loadInstitutions = async () => {
    setIsLoadingInstitutions(true);
    setInstitutionsError(null);
    try {
      if (dataMode === 'live') {
        let res;
        try {
          res = await adminApi.getInstitutions();
        } catch (adminErr) {
          // If adminApi fails with 403, fallback to institutionsApi
          res = await institutionsApi.getAll();
        }
        if (res && res.data) {
          setInstitutions(res.data);
        }
      } else {
        const stored = JSON.parse(localStorage.getItem('aicte_demo_registered_institutions') || '[]');
        setInstitutions(stored);
      }
    } catch (err) {
      console.warn('Failed to load institutions', err);
      const errMsg = err.response?.data?.message || err.message || 'Failed to load institutions from server';
      if (err.response?.status === 401 || err.response?.status === 403) {
        setInstitutionsError(`Access restricted (${err.response.status}): You must be authenticated as an authorized System Administrator.`);
      } else {
        setInstitutionsError(`Server error while loading institutions: ${errMsg}`);
      }
      setInstitutions([]);
    } finally {
      setIsLoadingInstitutions(false);
    }
  };

  useEffect(() => {
    loadOfficerRequests();
    loadInstitutions();
  }, [dataMode]);

  useEffect(() => {
    if (activeTab === 'institutions') {
      loadInstitutions();
    }
  }, [activeTab]);

  // Handle Verify Institution
  const handleVerifyInstitution = async (institution) => {
    const instCode = institution.code || institution.institutionCode;
    const instName = institution.name || institution.institutionName;
    const repInfo = institution.representativeName
      ? `\nRepresentative: ${institution.representativeName} (${institution.representativeEmail || 'No email'})`
      : '';

    if (!window.confirm(`Verify institution "${instName}" (${instCode})?${repInfo}\n\nThis will verify the institution and activate the representative portal credentials.`)) return;

    try {
      if (dataMode === 'live') {
        await adminApi.verifyInstitution(instCode);
      } else {
        const stored = JSON.parse(localStorage.getItem('aicte_demo_registered_institutions') || '[]');
        const updated = stored.map((i) =>
          (i.code === instCode || i.institutionCode === instCode) ? { ...i, status: 'VERIFIED' } : i
        );
        localStorage.setItem('aicte_demo_registered_institutions', JSON.stringify(updated));
      }

      addAuditLog({
        entityId: instCode,
        action: 'INSTITUTION_VERIFIED',
        previousState: institution.status || 'PENDING_VERIFICATION',
        newState: 'VERIFIED',
        reason: `Institution verified by ${currentUser?.name || 'Administrator'}; representative portal access activated`,
        user: currentUser,
      });

      setActionMessage(`Institution "${instName}" (${instCode}) has been verified and representative account activated.`);
      await loadInstitutions();
      if (refreshInstitutions) refreshInstitutions();
      setTimeout(() => setActionMessage(null), 5000);
    } catch (err) {
      alert('Error verifying institution: ' + (err.response?.data?.message || err.message));
    }
  };

  // Open Reject Modal
  const openRejectModal = (institution) => {
    setSelectedInstForReject(institution);
    setRejectReason('');
    setIsRejectModalOpen(true);
  };

  // Handle Confirm Reject Institution
  const handleConfirmReject = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!selectedInstForReject) return;

    const trimmedReason = rejectReason.trim();
    if (!trimmedReason) {
      alert('Rejection reason is mandatory. Please provide a clear justification.');
      return;
    }

    const inst = selectedInstForReject;
    const instCode = inst.code || inst.institutionCode;
    const instName = inst.name || inst.institutionName;

    try {
      if (dataMode === 'live') {
        await adminApi.rejectInstitution(instCode, { reason: trimmedReason });
      } else {
        const stored = JSON.parse(localStorage.getItem('aicte_demo_registered_institutions') || '[]');
        const updated = stored.map((i) =>
          (i.code === instCode || i.institutionCode === instCode)
            ? { ...i, status: 'REJECTED', rejectionReason: trimmedReason }
            : i
        );
        localStorage.setItem('aicte_demo_registered_institutions', JSON.stringify(updated));
      }

      addAuditLog({
        entityId: instCode,
        action: 'INSTITUTION_REJECTED',
        previousState: inst.status || 'PENDING_VERIFICATION',
        newState: 'REJECTED',
        reason: `Institution registration rejected. Reason: ${trimmedReason}`,
        user: currentUser,
      });

      setIsRejectModalOpen(false);
      setSelectedInstForReject(null);
      setRejectReason('');
      setActionMessage(`Institution "${instName}" registration has been rejected.`);
      await loadInstitutions();
      if (refreshInstitutions) refreshInstitutions();
      setTimeout(() => setActionMessage(null), 5000);
    } catch (err) {
      alert('Error rejecting institution: ' + (err.response?.data?.message || err.message));
    }
  };

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
  const pendingInstitutionsCount = institutions.filter((i) => (i.status || 'PENDING_VERIFICATION') === 'PENDING_VERIFICATION').length;
  const verifiedInstitutionsCount = institutions.filter((i) => i.status === 'VERIFIED').length;
  const rejectedInstitutionsCount = institutions.filter((i) => i.status === 'REJECTED').length;

  const displayedInstitutions = institutions.filter((inst) => {
    const status = inst.status || 'PENDING_VERIFICATION';
    const matchesStatus = institutionStatusFilter === 'ALL' || status === institutionStatusFilter;
    const q = institutionSearchQuery.trim().toLowerCase();
    if (!q) return matchesStatus;

    const name = (inst.name || inst.institutionName || '').toLowerCase();
    const code = (inst.code || inst.institutionCode || '').toLowerCase();
    const type = (inst.institutionType || '').toLowerCase();
    const repName = (inst.representativeName || '').toLowerCase();
    const repEmail = (inst.representativeEmail || inst.contactEmail || '').toLowerCase();
    const state = (inst.state || '').toLowerCase();
    const district = (inst.district || '').toLowerCase();

    const matchesSearch =
      name.includes(q) ||
      code.includes(q) ||
      type.includes(q) ||
      repName.includes(q) ||
      repEmail.includes(q) ||
      state.includes(q) ||
      district.includes(q);

    return matchesStatus && matchesSearch;
  });

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
          ) : activeTab === 'requests' ? (
            <Button
              variant="outline"
              size="sm"
              icon={RefreshCw}
              onClick={loadOfficerRequests}
              isLoading={isLoadingRequests}
            >
              Refresh Requests
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              icon={RefreshCw}
              onClick={loadInstitutions}
              isLoading={isLoadingInstitutions}
            >
              Refresh Registrations
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

        <button
          type="button"
          onClick={() => {
            setActiveTab('institutions');
            loadInstitutions();
          }}
          className={`pb-3 px-3 text-xs sm:text-sm font-bold uppercase tracking-wider border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'institutions'
              ? 'border-gov-800 text-gov-900'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Building className="w-4 h-4" />
          <span>Institution Verification</span>
          {pendingInstitutionsCount > 0 ? (
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 font-bold animate-pulse">
              {pendingInstitutionsCount} Pending
            </span>
          ) : (
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-mono">
              {institutions.length}
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

      {/* TAB 3: INSTITUTION VERIFICATION */}
      {activeTab === 'institutions' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 text-xs text-blue-900 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <Building className="w-5 h-5 text-gov-800 shrink-0 mt-0.5" />
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-gov-950 uppercase tracking-wide">
                    Institution Registration Verification Desk
                  </h4>
                  {dataMode === 'live' ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
                      <Database className="w-3 h-3" /> Live PostgreSQL Mode
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-800 border border-amber-300">
                      Dummy LocalStorage Mode
                    </span>
                  )}
                </div>
                <p className="mt-0.5 leading-relaxed text-blue-800">
                  Review newly registered institutional applications and representative credentials. Verifying an institution activates its representative portal account, enabling AICTE application submissions.
                </p>
              </div>
            </div>
            <div className="shrink-0 flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                icon={RefreshCw}
                onClick={loadInstitutions}
                isLoading={isLoadingInstitutions}
              >
                Refresh
              </Button>
            </div>
          </div>

          {/* Filter & Search Controls */}
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-3">
            {/* Status Pills */}
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => setInstitutionStatusFilter('PENDING_VERIFICATION')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                  institutionStatusFilter === 'PENDING_VERIFICATION'
                    ? 'bg-amber-100 text-amber-900 border border-amber-300 shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-transparent'
                }`}
              >
                <Clock className="w-3.5 h-3.5 text-amber-600" />
                <span>Pending Verification</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-200/80 font-mono font-bold">
                  {pendingInstitutionsCount}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setInstitutionStatusFilter('VERIFIED')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                  institutionStatusFilter === 'VERIFIED'
                    ? 'bg-emerald-100 text-emerald-900 border border-emerald-300 shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-transparent'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Verified</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-200/80 font-mono font-bold">
                  {verifiedInstitutionsCount}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setInstitutionStatusFilter('REJECTED')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                  institutionStatusFilter === 'REJECTED'
                    ? 'bg-rose-100 text-rose-900 border border-rose-300 shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-transparent'
                }`}
              >
                <XCircle className="w-3.5 h-3.5 text-rose-600" />
                <span>Rejected</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-rose-200/80 font-mono font-bold">
                  {rejectedInstitutionsCount}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setInstitutionStatusFilter('ALL')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                  institutionStatusFilter === 'ALL'
                    ? 'bg-gov-100 text-gov-900 border border-gov-300 shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-transparent'
                }`}
              >
                <span>All Registrations</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-200 font-mono">
                  {institutions.length}
                </span>
              </button>
            </div>

            {/* Search Input */}
            <div className="w-full md:w-80">
              <SearchInput
                value={institutionSearchQuery}
                onChange={setInstitutionSearchQuery}
                placeholder="Search by code, college, rep, state..."
              />
            </div>
          </div>

          {/* Institutions Error Alert */}
          {institutionsError && (
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-300 text-xs text-amber-900 flex items-start justify-between gap-3 animate-fadeIn">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-amber-950">Notice</p>
                  <p className="mt-0.5 text-amber-800 leading-relaxed">{institutionsError}</p>
                </div>
              </div>
              <Button
                size="xs"
                variant="outline"
                onClick={loadInstitutions}
                icon={RefreshCw}
                isLoading={isLoadingInstitutions}
              >
                Retry
              </Button>
            </div>
          )}

          {/* Table Container */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-card overflow-hidden">
            {isLoadingInstitutions ? (
              <div className="p-12 text-center text-slate-500 text-xs">
                <RefreshCw className="w-6 h-6 text-gov-700 animate-spin mx-auto mb-2" />
                <p className="font-semibold text-slate-700">Loading registrations from PostgreSQL database...</p>
              </div>
            ) : displayedInstitutions.length === 0 ? (
              <div className="p-12 text-center text-slate-500 text-xs">
                <Building className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="font-semibold text-slate-700">No institutions found</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {institutionSearchQuery
                    ? 'No institution matches your current search criteria.'
                    : institutionStatusFilter !== 'ALL'
                    ? `No institutions currently in ${institutionStatusFilter.replace('_', ' ')} status.`
                    : 'When new institutions register through the portal, they will appear here for administrator verification.'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="p-3">Institution Details</th>
                      <th className="p-3">Type & Location</th>
                      <th className="p-3">Applicant Representative</th>
                      <th className="p-3">Submission / Docs</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Admin Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {displayedInstitutions.map((inst) => {
                      const code = inst.code || inst.institutionCode;
                      const name = inst.name || inst.institutionName;
                      const status = inst.status || 'PENDING_VERIFICATION';
                      return (
                        <tr key={code} className="hover:bg-slate-50/80 transition-colors">
                          <td className="p-3 max-w-xs">
                            <div>
                              <p className="font-bold text-slate-900 leading-snug">{name}</p>
                              <div className="flex items-center gap-1.5 mt-1">
                                <span className="font-mono text-[11px] font-bold text-gov-900 px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200">
                                  {code}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">
                                {inst.address || `${inst.district || ''}, ${inst.state || ''}`}
                              </p>
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="text-slate-800 font-medium">{inst.institutionType || 'Engineering & Technology'}</div>
                            <div className="text-[10px] text-slate-500 mt-0.5">
                              {inst.region ? `${inst.region} Region` : ''} {inst.state ? `• ${inst.state}` : ''}
                            </div>
                          </td>
                          <td className="p-3">
                            {inst.representativeName ? (
                              <div>
                                <p className="font-bold text-slate-900">{inst.representativeName}</p>
                                <p className="text-[10px] text-slate-500">{inst.representativeDesignation || 'Institutional Representative'}</p>
                                <div className="flex items-center gap-1 font-mono text-[10px] text-slate-600 mt-1">
                                  <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                                  <a href={`mailto:${inst.representativeEmail || inst.contactEmail}`} className="hover:underline">
                                    {inst.representativeEmail || inst.contactEmail}
                                  </a>
                                </div>
                                {(inst.representativePhone || inst.contactPhone) && (
                                  <div className="flex items-center gap-1 font-mono text-[10px] text-slate-500 mt-0.5">
                                    <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                                    <span>{inst.representativePhone || inst.contactPhone}</span>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div>
                                <div className="font-mono text-[11px] text-slate-600">{inst.contactEmail || 'N/A'}</div>
                                <div className="text-[10px] text-slate-400">{inst.contactPhone || ''}</div>
                              </div>
                            )}
                          </td>
                          <td className="p-3">
                            <div className="font-mono text-[11px] text-slate-600">
                              {inst.registeredAt || (inst.createdAt ? new Date(inst.createdAt).toLocaleDateString() : 'Recent')}
                            </div>
                            <div className="mt-1">
                              {inst.documentsCount > 0 ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                                  <FileCheck className="w-3 h-3" /> {inst.documentsCount} Documents
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] text-slate-500 bg-slate-100">
                                  <FileText className="w-3 h-3" /> Registration Dossier
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="p-3">
                            {status === 'PENDING_VERIFICATION' && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                                <Clock className="w-3 h-3 text-amber-600" />
                                PENDING VERIFICATION
                              </span>
                            )}
                            {status === 'VERIFIED' && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                VERIFIED
                              </span>
                            )}
                            {status === 'REJECTED' && (
                              <div>
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-100 text-rose-900 border border-rose-300">
                                  <XCircle className="w-3 h-3 text-rose-600" />
                                  REJECTED
                                </span>
                                {inst.rejectionReason && (
                                  <p className="text-[10px] text-rose-700 mt-1 max-w-xs italic line-clamp-2">
                                    Reason: {inst.rejectionReason}
                                  </p>
                                )}
                              </div>
                            )}
                          </td>
                          <td className="p-3 text-right">
                            {status === 'PENDING_VERIFICATION' ? (
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => handleVerifyInstitution(inst)}
                                  className="px-3 py-1.5 text-xs font-bold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-sm flex items-center gap-1"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                  Verify
                                </button>
                                <button
                                  type="button"
                                  onClick={() => openRejectModal(inst)}
                                  className="px-3 py-1.5 text-xs font-bold rounded-lg border border-rose-300 text-rose-700 hover:bg-rose-50 transition-colors flex items-center gap-1"
                                >
                                  <X className="w-3.5 h-3.5" />
                                  Reject
                                </button>
                              </div>
                            ) : (
                              <span className="text-[11px] text-slate-400 italic">
                                {status === 'VERIFIED' ? 'Verified & Active' : 'Application Rejected'}
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
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

      {/* Reject Institution Modal */}
      <Modal
        isOpen={isRejectModalOpen}
        onClose={() => {
          setIsRejectModalOpen(false);
          setSelectedInstForReject(null);
          setRejectReason('');
        }}
        title="Reject Institution Registration"
      >
        {selectedInstForReject && (
          <form onSubmit={handleConfirmReject} className="space-y-4 text-xs">
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-900">
              <p className="font-bold">
                Rejecting Registration for {selectedInstForReject.name || selectedInstForReject.institutionName}
              </p>
              <p className="text-[11px] text-rose-700 mt-0.5">
                Code: <span className="font-mono">{selectedInstForReject.code || selectedInstForReject.institutionCode}</span>
                {selectedInstForReject.representativeName && ` • Representative: ${selectedInstForReject.representativeName}`}
              </p>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Official Rejection Reason <span className="text-rose-600">*</span>
              </label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Specify the regulatory or documentation grounds for rejection (mandatory)..."
                rows={4}
                className="w-full p-2.5 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                required
              />
              <p className="text-[10px] text-slate-400 mt-1">
                This reason will be recorded in the official audit trail and provided to the institution representative upon login attempt.
              </p>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsRejectModalOpen(false);
                  setSelectedInstForReject(null);
                  setRejectReason('');
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="danger"
                size="sm"
                disabled={!rejectReason.trim()}
              >
                Confirm Rejection
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};
