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
        leaveToDate: string 
    }[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [approvers, setApprovers] = useState([]);
    const [selectedApproverId, setSelectedApproverId] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentAction, setCurrentAction] = useState<'approve' | 'cancel' | null>(null);
    const [currentApplicationId, setCurrentApplicationId] = useState<string | null>(null);

    useEffect(() => {
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
        const confirmApprove = window.confirm('Are you sure you want to approve this leave?');
        if (!confirmApprove) return;

        try {
            const response = await fetch(`/api/leave/${id}/approve`, {
                method: 'POST',
            });

            if (!response.ok) {
                throw new Error('Failed to approve leave');
            }

            toast.success('Leave approved successfully');
            setLeaveApplications(prev => prev.filter(application => application._id !== id));
        } catch (error) {
            console.error('Error approving leave:', error);
            toast.error('Failed to approve leave');
        }
    };

    const handleCancel = async (id: string) => {
        const confirmCancel = window.confirm('Are you sure you want to cancel this leave?');
        if (!confirmCancel) return;

        try {
            const response = await fetch(`/api/leave/${id}/cancel`, {
                method: 'POST',
            });

            if (!response.ok) {
                throw new Error('Failed to cancel leave');
            }

            toast.success('Leave cancelled successfully');
            setLeaveApplications(prev => prev.filter(application => application._id !== id));
        } catch (error) {
            console.error('Error cancelling leave:', error);
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
                <label className="label">
                    <span className="label-text text-base-content">Select Approver</span>
                </label>
                <select
                    className="select select-bordered w-64 bg-base-100 text-base-content"
                    value={selectedApproverId}
                    onChange={(e) => setSelectedApproverId(e.target.value)}
                >
                    <option value="">Select Approver</option>
                    {approvers.map((approver: any) => (
                        <option key={approver._id} value={approver._id}>
                            {approver.firstName} {approver.lastName}
                        </option>
                    ))}
                </select>
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
                                                <div className="flex justify-center space-x-2">
                                                    <Check 
                                                        className="w-5 h-5 cursor-pointer text-success hover:text-success-dark" 
                                                        onClick={() => openModal('approve', application._id)} 
                                                    />
                                                    <X 
                                                        className="w-5 h-5 cursor-pointer text-error hover:text-error-dark" 
                                                        onClick={() => openModal('cancel', application._id)} 
                                                    />
                                                </div>
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