'use client';

import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Check, X } from 'lucide-react';
import ModalPopup from '../components/ui/modalPopup';

export default function ViewLeavePage() {
    const [leaveApplications, setLeaveApplications] = useState<{ 
        _id: string, 
        staffId: { firstName: string; lastName: string }, 
        reason: string, 
        leaveFromDate: string, 
        leaveToDate: string,
        status: string
    }[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [approvers, setApprovers] = useState<{ _id: string; firstName: string; lastName: string }[]>([]);
    const [selectedApproverId, setSelectedApproverId] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentAction, setCurrentAction] = useState<'approve' | 'cancel' | null>(null);
    const [currentApplicationId, setCurrentApplicationId] = useState<string | null>(null);
    const [currentApproverName, setCurrentApproverName] = useState('');

    useEffect(() => {
        // Get token from cookies or localStorage
        const getTokenFromCookie = () => {
            const cookies = document.cookie.split(';');
            const tokenCookie = cookies.find(cookie => cookie.trim().startsWith('auth-token='));
            return tokenCookie ? tokenCookie.split('=')[1] : '';
        };
        
        const token = getTokenFromCookie() || localStorage.getItem('auth-token');
        
        if (token) {
            try {
                // Decode JWT token (payload is the second part)
                const payload = token.split('.')[1];
                const decodedData = JSON.parse(atob(payload));
                
                // Set the user ID from token as the approver
                if (decodedData.id) {
                    setSelectedApproverId(decodedData.id);
                }
            } catch (error) {
                console.error('Error decoding token:', error);
                toast.error('Failed to authenticate. Please login again.');
            }
        } else {
            toast.error('Not authenticated. Please login first.');
        }
        
        // Fetch approvers for displaying name
        const fetchApprovers = async () => {
            try {
                const response = await fetch('/api/manage-staff?role=STAFF');
                if (!response.ok) {
                    throw new Error('Failed to fetch approvers');
                }
                const data = await response.json();
                setApprovers(data);
            } catch (error) {
                console.error('Error fetching approvers:', error);
                toast.error('Failed to load approvers');
            }
        };

        fetchApprovers();
    }, []);
    
    // Update current approver name when approvers list or selectedApproverId changes
    useEffect(() => {
        if (approvers.length && selectedApproverId) {
            const currentApprover = approvers.find((approver: any) => approver._id === selectedApproverId);
            if (currentApprover) {
                setCurrentApproverName(`${currentApprover.firstName} ${currentApprover.lastName}`);
            }
        }
    }, [approvers, selectedApproverId]);

    useEffect(() => {
        if (!selectedApproverId) return;

        const fetchLeaveApplications = async () => {
            try {
                setIsLoading(true);
                const response = await fetch(`/api/leave?approverId=${selectedApproverId}`);
                
                if (!response.ok) {
                    throw new Error('Failed to fetch leave applications');
                }

                const data = await response.json();
                setLeaveApplications(data);
            } catch (error) {
                console.error('Error fetching leave applications:', error);
                toast.error('Failed to fetch leave applications');
            } finally {
                setIsLoading(false);
            }
        };

        fetchLeaveApplications();
    }, [selectedApproverId]);

    const handleApprove = async (id: string) => {
        try {
            const response = await fetch(`/api/leave?id=${id}&status=Approved`, {
                method: 'PUT',
            });

            if (!response.ok) {
                throw new Error('Failed to approve leave');
            }
            toast.success('Leave approved successfully');
            setLeaveApplications(prev => prev.map(application => 
                application._id === id ? { ...application, status: 'Approved' } : application
            ));
        } catch (error) {
            toast.error('Failed to approve leave');
        }
    };

    const handleCancel = async (id: string) => {
        try {
            const response = await fetch(`/api/leave?id=${id}&status=Cancelled`, {
                method: 'PUT',
            });

            if (!response.ok) {
                throw new Error('Failed to cancel leave');
            }
            toast.success('Leave cancelled successfully');
            setLeaveApplications(prev => prev.map(application => 
                application._id === id ? { ...application, status: 'Cancelled' } : application
            ));
        } catch (error) {
            toast.error('Failed to cancel leave');
        }
    };

    const openModal = (action: 'approve' | 'cancel', id: string) => {
        setCurrentAction(action);
        setCurrentApplicationId(id);
        setIsModalOpen(true);
    };

    const handleConfirm = async () => {
        if (!currentApplicationId || !currentAction) return;

        if (currentAction === 'approve') {
            await handleApprove(currentApplicationId);
        } else if (currentAction === 'cancel') {
            await handleCancel(currentApplicationId);
        }

        setIsModalOpen(false);
    };

    return (
        <div className="flex flex-col w-full p-6 bg-base-100 min-h-screen">
            <div className="mb-4">
                <div className="flex items-center">
                    <h3 className="text-lg font-medium text-base-content">Approver:</h3>
                    <span className="ml-2 font-semibold text-primary">
                        {currentApproverName || 'Loading...'}
                    </span>
                </div>
            </div>

            <div className="card bg-base-200 shadow-xl">
                <div className="card-body">
                    <h2 className="card-title text-2xl font-bold text-base-content mb-6">Leave Applications</h2>

                    {isLoading ? (
                        <div className="flex justify-center items-center mt-6 py-12">
                            <span className="loading loading-spinner loading-lg text-primary"></span>
                            <span className="ml-3 text-base-content">Loading leave applications...</span>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="table table-pin-rows">
                                <thead className="sticky top-0 bg-base-300">
                                    <tr>
                                        <th className="text-base-content">Staff Name</th>
                                        <th className="text-base-content">Comment</th>
                                        <th className="text-base-content">Number of Days</th>
                                        <th className="text-base-content">Start Date</th>
                                        <th className="text-base-content">End Date</th>
                                        <th className="text-base-content text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {leaveApplications.map(application => (
                                        <tr key={application._id} className="hover:bg-base-200">
                                            <td className="text-base-content">
                                                {application.staffId.firstName} {application.staffId.lastName}
                                            </td>
                                            <td className="text-base-content">{application.reason}</td>
                                            <td className="text-base-content">
                                                {Math.ceil((new Date(application.leaveToDate).getTime() - new Date(application.leaveFromDate).getTime()) / (1000 * 60 * 60 * 24))} days
                                            </td>
                                            <td className="text-base-content">
                                                {new Date(application.leaveFromDate).toLocaleDateString('en-GB')}
                                            </td>
                                            <td className="text-base-content">
                                                {new Date(application.leaveToDate).toLocaleDateString('en-GB')}
                                            </td>
                                            <td className="text-center">
                                                {application.status === 'Pending' ? (
                                                    <div className="flex justify-center space-x-2">
                                                        <button 
                                                            className="btn btn-success btn-sm"
                                                            onClick={() => openModal('approve', application._id)}
                                                        >
                                                            <Check className="w-5 h-5" />
                                                        </button>
                                                        <button 
                                                            className="btn btn-error btn-sm"
                                                            onClick={() => openModal('cancel', application._id)}
                                                        >
                                                            <X className="w-5 h-5" />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    application.status === 'Approved' ? (
                                                        <span className="badge badge-success text-white">Approved</span>
                                                    ) : application.status === 'Cancelled' ? (
                                                        <span className="badge badge-error text-white">Cancelled</span>
                                                    ) : (
                                                        <span className="badge badge-warning text-white">{application.status}</span>
                                                    )
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            <ModalPopup
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onConfirm={handleConfirm}
                message={`Are you sure you want to ${currentAction} this leave application?`}
                cancelButtonText="Cancel"
                confirmButtonText={currentAction === 'approve' ? 'Approve Leave' : 'Cancel Leave'}
                confirmButtonColor={currentAction === 'approve' ? 'bg-green-600' : 'bg-red-600'}
            />
        </div>
    );
}