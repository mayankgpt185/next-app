'use client';

import React, { useState, useEffect } from 'react';
import { Loader2, Search, Plus, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import Link from 'next/link';
import toast from 'react-hot-toast';
// import ModalPopup from '@/app/components/ModalPopup';

interface Admin {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  dateJoined: string;
  clientOrganizationId?: {
    clientId: {
      clientName: string;
      _id: string;
    };
    organizationId: {
      organizationName: string;
      _id: string;
    };
    _id: string;
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const formatDate = (dateString: string) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export default function ManageAdminPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedAdminId, setSelectedAdminId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);

  const adminRole = "ADMIN";
  
  useEffect(() => {
    // Get user role from token
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (!token) return;
      const payload = token.split('.')[1];
      const decodedPayload = JSON.parse(atob(payload));
      setUserRole(decodedPayload.role);
    }

    const fetchAdmins = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/manage-staff?role=${adminRole}`);
        if (!response.ok) throw new Error('Failed to fetch admins');
        const data = await response.json();
        setAdmins(data);
      } catch (error) {
        console.error('Error fetching admins:', error);
        toast.error('Failed to fetch admins');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAdmins();
  }, []);

  const handleDeleteClick = (adminId: string) => {
    setSelectedAdminId(adminId);
    setIsDeleteModalOpen(true);
  };

  const filteredAdmins = admins.filter(admin => {
    const fullName = `${admin.firstName} ${admin.lastName}`.toLowerCase();
    const email = admin.email.toLowerCase();
    const clientName = admin.clientOrganizationId?.clientId?.clientName?.toLowerCase() || '';
    const orgName = admin.clientOrganizationId?.organizationId?.organizationName?.toLowerCase() || '';
    
    return fullName.includes(searchTerm.toLowerCase()) || 
           email.includes(searchTerm.toLowerCase()) ||
           clientName.includes(searchTerm.toLowerCase()) ||
           orgName.includes(searchTerm.toLowerCase());
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-base-100">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary" />
          <p className="mt-4 text-base-content">Loading admins...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full min-h-screen p-6 bg-base-100">
      <div className="card bg-base-200 shadow-xl flex-1">
        <div className="card-body flex flex-col">
          <div className="mb-6 flex justify-between items-center">
            <div className="relative w-1/3">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-base-content/60 w-5 h-5" />
              <input
                type="text"
                placeholder="Search admins..."
                className="input input-bordered w-full pl-10 bg-base-100 text-base-content"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Link href="/manage-admin/add">
              <Button variant="primary" type="submit" outline>
                <Plus className="w-4 h-4 mr-2" />
                Add Admin
              </Button>
            </Link>
          </div>

          <div className="overflow-x-auto flex-1">
            <div className="overflow-y-auto h-[calc(100vh-280px)]">
              <table className="table table-pin-rows">
                <thead className="sticky top-0 bg-base-300">
                  <tr>
                    <th className="text-base-content">Name</th>
                    <th className="text-base-content">Email</th>
                    <th className="text-base-content">Client</th>
                    <th className="text-base-content">Organization</th>
                    <th className="text-base-content">Date Joined</th>
                    <th className="text-base-content">Status</th>
                    <th className="text-base-content">Created Date</th>
                    <th className="text-base-content">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAdmins.length > 0 ? (
                    filteredAdmins.map((admin) => (
                      <tr key={admin._id} className="hover:bg-base-200">
                        <td className="text-base-content font-medium">
                          {admin.firstName} {admin.lastName}
                        </td>
                        <td className="text-base-content">{admin.email}</td>
                        <td className="text-base-content">
                          {admin.clientOrganizationId?.clientId?.clientName || 'N/A'}
                        </td>
                        <td className="text-base-content">
                          {admin.clientOrganizationId?.organizationId?.organizationName || 'N/A'}
                        </td>
                        <td className="text-base-content">{formatDate(admin.dateJoined)}</td>
                        <td className="text-base-content">
                          <span className={`badge ${admin.isActive ? 'badge-success' : 'badge-error'}`}>
                            {admin.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="text-base-content">{formatDate(admin.createdAt)}</td>
                        <td>
                          <div className="flex gap-2">
                            <Link href={`/manage-admin/add?id=${admin._id}`}>
                              <Button className="btn btn-ghost btn-sm">
                                <Edit className="w-4 h-4 text-info" />
                              </Button>
                            </Link>
                            <Button 
                              className="btn btn-ghost btn-sm"
                              onClick={() => handleDeleteClick(admin._id)}
                            >
                              <Trash2 className="w-4 h-4 text-error" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className="text-center py-8">
                        <div className="flex flex-col items-center gap-2">
                          <p className="text-lg font-medium text-base-content">No admins found</p>
                          {searchTerm && (
                            <p className="text-sm text-base-content/70">
                              Try adjusting your search or filters
                            </p>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      
      {/* <ModalPopup
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        message="This will permanently delete this admin account."
      /> */}
    </div>
  );
}
