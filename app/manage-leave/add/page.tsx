'use client';

import React, { useEffect, useState } from 'react';
import { StudentMemberDTO } from '../../api/dto/StudentMember';
import toast from 'react-hot-toast';

export default function AddLeavePage() {
    const [leaveFromDate, setLeaveFromDate] = useState('');
    const [leaveToDate, setLeaveToDate] = useState('');
    const [selectedStaffId, setSelectedStaffId] = useState('');
    const [leaveReason, setLeaveReason] = useState('');
    const [staffList, setStaffList] = useState<StudentMemberDTO[]>([]);
    const [isLoadingStaffList, setIsLoadingStaffList] = useState(false);
    const [selectedApproverId, setSelectedApproverId] = useState('');

    // Fetch staff list on component mount
    useEffect(() => {
        const fetchStaffList = async () => {
            try {
                setIsLoadingStaffList(true);
                const response = await fetch('/api/manage-staff?role=STAFF');
                if (!response.ok) {
                    throw new Error('Failed to fetch staff list');
                }
                const data = await response.json();
                setStaffList(data);
            } catch (error) {
                console.error('Error fetching staff list:', error);
                toast.error('Failed to load staff list');
            } finally {
                setIsLoadingStaffList(false);
            }
        };

        fetchStaffList();
    }, []);

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

                        {/* Staff Selection */}
                        <div className="form-control w-full">
                            <label className="label">
                                <span className="label-text text-base-content">Staff Member</span>
                            </label>
                            <div className="relative">
                                <select
                                    className="select select-bordered w-full bg-base-100 text-base-content"
                                    value={selectedStaffId}
                                    onChange={(e) => setSelectedStaffId(e.target.value)}
                                    disabled={isLoadingStaffList}
                                >
                                    <option value="">Select Staff Member</option>
                                    {staffList.map((staff) => (
                                        <option key={staff._id} value={staff._id} className="text-base-content bg-base-100">
                                            {staff.firstName} {staff.lastName}
                                        </option>
                                    ))}
                                </select>
                                {isLoadingStaffList && (
                                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                        <span className="loading loading-spinner loading-sm text-primary"></span>
                                    </div>
                                )}
                            </div>
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
                                    disabled={isLoadingStaffList}
                                >
                                    <option value="">Select Approver</option>
                                    {staffList.map((staff) => (
                                        <option key={staff._id} value={staff._id} className="text-base-content bg-base-100">
                                            {staff.firstName} {staff.lastName}
                                        </option>
                                    ))}
                                </select>
                                {isLoadingStaffList && (
                                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                        <span className="loading loading-spinner loading-sm text-primary"></span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Reason for Leave */}
                    <div className="form-control w-full md:w-1/2 mt-4">
                        <label className="label">
                            <span className="label-text text-base-content">Reason for Leave</span>
                        </label>
                        <textarea
                            className="textarea textarea-bordered h-32 bg-base-100 text-base-content"
                            placeholder="Please provide a detailed reason for your leave request..."
                            value={leaveReason}
                            onChange={(e) => setLeaveReason(e.target.value)}
                        ></textarea>
                    </div>

                    <div className="flex justify-end mt-6">
                        <button
                            className="btn btn-primary"
                            onClick={submitLeaveApplication}
                        >
                            Apply
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}