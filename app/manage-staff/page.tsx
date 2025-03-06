'use client';

import React, { useEffect, useState } from 'react';
import { Search, Plus, Edit, Trash2, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { formatDate } from '@/utils/dateUtils';
import DeletePopup from '../components/ui/deletePopup';
import toast from 'react-hot-toast';

interface StaffMember {
    _id: number;
    firstName: string;
    lastName: string;
    email: string;
    address: string;
    lastLogin: string;
    dateJoined: string;
}

export default function ManageStaffPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [staffMembers, setStaff] = useState<StaffMember[]>([]);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedStaffId, setSelectedStaffId] = useState<number | null>(null);
    const staffRole = "STAFF";
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchStaff = async () => {
            try {
                const response = await fetch(`/api/manage-staff?role=${staffRole}`);
                if (!response.ok) throw new Error('Failed to fetch staff');
                const data = await response.json();
                setStaff(data);
            } catch (error) {
                console.error('Error fetching staff:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchStaff();
    }, []);


    const filteredStaff = staffMembers.filter(staff =>
        Object.values(staff).some(value =>
            value.toString().toLowerCase().includes(searchTerm.toLowerCase())
        )
    );

    const handleDeleteClick = (staffId: number) => {
        setSelectedStaffId(staffId);
        setIsDeleteModalOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!selectedStaffId) return;

        try {
            console.log('Deleting staff with ID:', selectedStaffId);
            const response = await fetch(`/api/manage-staff?id=${selectedStaffId}`, {
                method: 'DELETE',
            });

            if (!response.ok) throw new Error('Failed to delete staff');

            // Remove deleted staff from state
            setStaff(prevStaff => prevStaff.filter(staff => staff._id !== selectedStaffId));
            toast.success('Staff deleted successfully');
        } catch (error) {
            toast.error('Error deleting staff');
        }

        // Close modal after deleting
        setIsDeleteModalOpen(false);
        setSelectedStaffId(null);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-base-100">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary" />
                    <p className="mt-4 text-base-content">Loading staff...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col w-full min-h-screen p-6 bg-base-100">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-base-content">Manage Staff</h1>
                <Link href="/manage-staff/add">
                    <Button variant="primary" type="submit" outline>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Staff
                    </Button>
                </Link>
            </div>

            <div className="card bg-base-200 shadow-xl flex-1">
                <div className="card-body flex flex-col">
                    <div className="mb-6">
                        <div className="relative w-1/3">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-base-content/60 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search staff..."
                                className="input input-bordered w-full pl-10 bg-base-100 text-base-content"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto flex-1">
                        <div className="overflow-y-auto h-[calc(100vh-280px)]">
                            <table className="table table-pin-rows">
                                <thead className="sticky top-0 bg-base-300">
                                    <tr>
                                        <th className="text-base-content">First Name</th>
                                        <th className="text-base-content">Last Name</th>
                                        <th className="text-base-content">Email</th>
                                        <th className="text-base-content">Address</th>
                                        <th className="text-base-content">Last Login</th>
                                        <th className="text-base-content">Date Joined</th>
                                        <th className="text-base-content">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredStaff.length > 0 ? (
                                        filteredStaff.map((staff) => (
                                            <tr key={staff._id} className="hover:bg-base-200">
                                                <td className="text-base-content">{staff.firstName}</td>
                                                <td className="text-base-content">{staff.lastName}</td>
                                                <td className="text-base-content">{staff.email}</td>
                                                <td className="text-base-content">{staff.address}</td>
                                                <td className="text-base-content">{staff?.lastLogin || 'N/A'}</td>
                                                <td className="text-base-content">{formatDate(staff.dateJoined)}</td>
                                                <td>
                                                    <div className="flex gap-2">
                                                        <Link href={`/manage-staff/add?id=${staff._id}`}>
                                                            <Button className="btn btn-ghost btn-sm">
                                                                <Edit className="w-4 h-4 text-info" />
                                                            </Button>
                                                        </Link>
                                                        <Button className="btn btn-ghost btn-sm"
                                                            onClick={() => {
                                                                setSelectedStaffId(staff._id);
                                                                setIsDeleteModalOpen(true)
                                                            }}>
                                                            <Trash2 className="w-4 h-4 text-error" />
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={9} className="text-center py-8">
                                                <div className="flex flex-col items-center gap-2">
                                                    <p className="text-lg font-medium text-base-content">No staff members found</p>
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
            <DeletePopup
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDeleteConfirm}
            />
        </div >
    );
}