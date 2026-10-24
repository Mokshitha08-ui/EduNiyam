import React, { useState } from 'react';
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
  AlertTriangle
} from 'lucide-react';
import { useAppData } from '../context/AppDataContext';
import { useAuth } from '../context/AuthContext';
import { PageHeader } from '../components/common/PageHeader';
import { Button } from '../components/common/Button';
import { Badge, StatusBadge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { SearchInput } from '../components/common/SearchInput';
import { ROLES, ROLE_DETAILS } from '../utils/permissions';

export const UsersRoles = () => {
  const { users } = useAppData();
  const { currentUser } = useAuth();

  const [userList, setUserList] = useState(users);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState('ALL');

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

  const filteredUsers = userList.filter(u => {
    const matchSearch =
      !searchQuery ||
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchRole = selectedRole === 'ALL' || u.role === selectedRole;
    return matchSearch && matchRole;
  });

  const toggleUserStatus = (userId) => {
    setUserList(prev => prev.map(u => {
      if (u.id === userId) {
        const nextStatus = u.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
        return { ...u, status: nextStatus };
      }
      return u;
    }));
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
      lastLogin: 'Never'
    };

    setUserList([created, ...userList]);
    setIsAddUserOpen(false);
    setNewUser({
      name: '',
      email: '',
      role: 'REGIONAL_OFFICER',
      department: 'Regional Approval & Scrutiny',
      region: 'South-Western (Bangalore)',
      status: 'ACTIVE'
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="User Accounts & Role-Based Access Control"
        subtitle="Manage government officials, committee members, compliance reviewers, and institutional accounts"
        badge={<Badge variant="navy">Security & IAM</Badge>}
        actions={
          <Button
            variant="primary"
            size="sm"
            icon={UserPlus}
            onClick={() => setIsAddUserOpen(true)}
          >
            Add New User
          </Button>
        }
      />

      {/* Security Disclaimer */}
      <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-900 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-blue-700 shrink-0 mt-0.5" />
        <div>
          <h4 className="font-bold text-blue-950 uppercase tracking-wide">
            Enterprise RBAC Architecture Notice
          </h4>
          <p className="mt-0.5">
            Role routes and UI permissions in this prototype are guarded on the frontend. In production, every REST API endpoint is strictly authenticated and validated by Spring Security &amp; JWT authorities.
          </p>
        </div>
      </div>

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
            {Object.keys(ROLES).map(k => (
              <option key={k} value={k}>{ROLE_DETAILS[k]?.name}</option>
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
            {filteredUsers.map(u => (
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
                <td className="p-3 font-mono text-slate-500">{u.lastLogin}</td>
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

      {/* Role Permission Matrix Reference */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-card">
        <h3 className="text-sm font-bold text-slate-900 mb-2">Role Permissions Matrix (Prototype & Production)</h3>
        <p className="text-xs text-slate-500 mb-4">Functional accessibility across portal features</p>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse border border-slate-200">
            <thead className="bg-slate-50 text-slate-700 font-semibold">
              <tr>
                <th className="p-2 border">Module / Feature</th>
                <th className="p-2 border text-center">System Admin</th>
                <th className="p-2 border text-center">Regional Officer</th>
                <th className="p-2 border text-center">Bureau Officer</th>
                <th className="p-2 border text-center">EVC Member</th>
                <th className="p-2 border text-center">Compliance Cell</th>
                <th className="p-2 border text-center">College Rep</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-center">
              {[
                { module: 'Executive Dashboard', admin: 'Full', ro: 'Full', bo: 'Full', evc: 'Restricted', cmp: 'Full', col: 'Scoped' },
                { module: 'Application Management', admin: 'Full', ro: 'Full', bo: 'Full', evc: 'View/Report', cmp: 'Verify', col: 'Own Only' },
                { module: 'Deficiency Return Authority', admin: 'Yes', ro: 'Yes', bo: 'Yes', evc: 'No', cmp: 'Yes', col: 'Respond Only' },
                { module: 'EVC Committee Scheduling', admin: 'Full', ro: 'Full', bo: 'Full', evc: 'Execute/Sign', cmp: 'View', col: 'View Date' },
                { module: 'Statutory Lease Verification', admin: 'Yes', ro: 'Yes', bo: 'Yes', evc: 'No', cmp: 'Yes', col: 'Upload Only' },
                { module: 'Workflow SLA Configuration', admin: 'Yes', ro: 'No', bo: 'No', evc: 'No', cmp: 'No', col: 'No' },
                { module: 'Regulatory Audit Trail', admin: 'Full', ro: 'View', bo: 'View', evc: 'No', cmp: 'No', col: 'No' },
              ].map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50">
                  <td className="p-2 border text-left font-semibold text-slate-800">{row.module}</td>
                  <td className="p-2 border text-emerald-700 font-bold">{row.admin}</td>
                  <td className="p-2 border text-slate-700">{row.ro}</td>
                  <td className="p-2 border text-slate-700">{row.bo}</td>
                  <td className="p-2 border text-slate-700">{row.evc}</td>
                  <td className="p-2 border text-slate-700">{row.cmp}</td>
                  <td className="p-2 border text-slate-700">{row.col}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal */}
      <Modal
        isOpen={isAddUserOpen}
        onClose={() => setIsAddUserOpen(false)}
        title="Provision New User Account"
        subtitle="Create an authorized administrative or institutional user"
        maxWidth="max-w-md"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setIsAddUserOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleAddUserSubmit}>
              Create Account
            </Button>
          </>
        }
      >
        <form onSubmit={handleAddUserSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase">Full Name *</label>
            <input
              type="text"
              required
              value={newUser.name}
              onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
              placeholder="e.g. Dr. Harish Chandra"
              className="mt-1 w-full text-xs p-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-gov-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase">Email Address *</label>
            <input
              type="email"
              required
              value={newUser.email}
              onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
              placeholder="hchandra@demo.gov.in"
              className="mt-1 w-full text-xs p-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-gov-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase">Role Authority</label>
            <select
              value={newUser.role}
              onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
              className="mt-1 w-full text-xs p-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-gov-600"
            >
              {Object.keys(ROLES).map(k => (
                <option key={k} value={k}>{ROLE_DETAILS[k]?.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase">Department</label>
            <input
              type="text"
              value={newUser.department}
              onChange={(e) => setNewUser({ ...newUser, department: e.target.value })}
              className="mt-1 w-full text-xs p-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-gov-600"
            />
          </div>
        </form>
      </Modal>
    </div>
  );
};
