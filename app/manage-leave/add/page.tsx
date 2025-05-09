'use client';

import React, { useEffect, useState } from 'react';
import { StudentMemberDTO } from '../../api/dto/StudentMember';
import toast from 'react-hot-toast';
import { Button } from '@/app/components/ui/button';

export default function AddLeavePage() {
    const [leaveFromDate, setLeaveFromDate] = useState('');
    const [leaveToDate, setLeaveToDate] = useState('');
    const [selectedStaffId, setSelectedStaffId] = useState('');
    const [leaveReason, setLeaveReason] = useState('');
    const [adminList, setAdminList] = useState<StudentMemberDTO[]>([]);
    const [isLoadingAdminList, setIsLoadingAdminList] = useState(false);
    const [selectedApproverId, setSelectedApproverId] = useState('');

    // Add this function to get user ID from token
    const getUserIdFromToken = () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return null;
            const payload = token.split('.')[1];
            const decodedPayload = JSON.parse(atob(payload));
            return decodedPayload.id;
        } catch (error) {
            console.error('Error extracting user ID from token:', error);
            return null;
        }
    };

    // Update the useEffect to fetch admin users instead of staff
    useEffect(() => {
        const fetchAdminList = async () => {
            try {
                setIsLoadingAdminList(true);
                const response = await fetch('/api/manage-staff?role=ADMIN');
                if (!response.ok) {
                    throw new Error('Failed to fetch admin list');
                }
                const data = await response.json();
                setAdminList(data);
                
                // Get user ID from token and set as selected staff if not already set
                const userId = getUserIdFromToken();
                if (userId && !selectedStaffId) {
                    setSelectedStaffId(userId);
                }
            } catch (error) {
                console.error('Error fetching admin list:', error);
                toast.error('Failed to load admin list');
            } finally {
                setIsLoadingAdminList(false);
            }
        };

        fetchAdminList();
    }, [selectedStaffId]);

    // Handle leave application submission
    const submitLeaveApplication = async () => {
        // Validate inputs
        if (!leaveFromDate || !leaveToDate) {
            toast.error('Please select both start and end dates');
            return;
        }

        if (new Date(leaveFromDate) > new Date(leaveToDate)) {
            toast.error('End date cannot be before start date');
            return;
        }

        if (!selectedStaffId) {
            toast.error('Please select a staff member');
            return;
        }

        if (!leaveReason.trim()) {
            toast.error('Please provide a reason for leave');
            return;
        }

        if (!selectedApproverId) {
            toast.error('Please select an approver');
            return;
        }

        try {
            const payload = {
                staffId: selectedStaffId,
                leaveFromDate: leaveFromDate,
                leaveToDate: leaveToDate,
                reason: leaveReason,
                approverId: selectedApproverId
            };

            const response = await fetch('/api/leave', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                toast.success('Leave application submitted successfully');
                // Reset form
                setLeaveFromDate('');
                setLeaveToDate('');
                setSelectedStaffId('');
                setLeaveReason('');
                setSelectedApproverId('');
            } else {
                const errorData = await response.json().catch(() => ({}));
                toast.error('Failed to submit leave application: ' + (errorData.message || 'Unknown error'));
            }
        } catch (error) {
            console.error('Error submitting leave application:', error);
            toast.error('Error submitting leave application');
        }
    };

    return (
        <div className="flex flex-col w-full p-6 bg-base-100 min-h-screen">
            <div className="card bg-base-200 shadow-xl">
                <div className="card-body">
                    <h2 className="card-title text-2xl font-bold text-base-content mb-6">Apply for Leave</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Leave Date Range Selection */}
                        <div className="form-control w-full">
                            <label className="label">
                                <span className="label-text text-base-content">Leave Start Date</span>
                            </label>
                            <input
                                type="date"
                                className="input input-bordered w-full bg-base-100 text-base-content"
                                value={leaveFromDate}
                                onChange={(e) => setLeaveFromDate(e.target.value)}
                                min={new Date().toISOString().split('T')[0]}
                            />
                        </div>

                        <div className="form-control w-full">
                            <label className="label">
                                <span className="label-text text-base-content">Leave End Date</span>
                            </label>
                            <input
                                type="date"
                                className="input input-bordered w-full bg-base-100 text-base-content"
                                value={leaveToDate}
                                onChange={(e) => setLeaveToDate(e.target.value)}
                                min={leaveFromDate || new Date().toISOString().split('T')[0]}
                            />
                        </div>

                        {/* Approver Selection */}
                        <div className="form-control w-full">
                            <label className="label">
                                <span className="label-text text-base-content">Approver</span>
                            </label>
                            <div className="relative">
                                <select
                                    className="select select-bordered w-full bg-base-100 text-base-content"
                                    value={selectedApproverId}
                                    onChange={(e) => setSelectedApproverId(e.target.value)}
                                    disabled={isLoadingAdminList}
                                >
                                    <option value="">Select Approver</option>
                                    {adminList.map((admin) => (
                                        <option key={admin._id} value={admin._id} className="text-base-content bg-base-100">
                                            {admin.firstName} {admin.lastName}
                                        </option>
                                    ))}
                                </select>
                                {isLoadingAdminList && (
                                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                        <span className="loading loading-spinner loading-sm text-primary"></span>
                                    </div>
                                )}
                            </div>
                        </div>
                        
                        {/* Reason for Leave - moved to be next to Approver */}
                        <div className="form-control w-full">
                            <label className="label">
                                <span className="label-text text-base-content">Reason for Leave</span>
                            </label>
                            <textarea
                                className="textarea textarea-bordered h-24 bg-base-100 text-base-content"
                                placeholder="Please provide a reason for your leave request"
                                value={leaveReason}
                                onChange={(e) => setLeaveReason(e.target.value)}
                            ></textarea>
                        </div>
                    </div>

                    <div className="flex justify-end mt-6">
                        <Button
                            type="button"
                            variant="primary"
                            outline
                            onClick={submitLeaveApplication}
                        >
                            Apply
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}