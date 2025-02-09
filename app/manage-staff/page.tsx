// app/manage-staff/page.tsx
'use client';

import React, { useState } from 'react';
import { Search, Plus, Edit, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';

interface StaffMember {
    id: number;
    firstName: string;
    lastName: string;
    username: string;
    email: string;
    address: string;
    lastLogin: string;
    dateJoined: string;
}

export default function ManageStaffPage() {
    const [searchTerm, setSearchTerm] = useState('');

    // Mock data
    const staffMembers: StaffMember[] = [
        {
            id: 2,
            firstName: "Mayank",
            lastName: "Gupta",
            username: "mayank.staff",
            email: "mayank.staff@mit.com",
            address: "Shree Ganesh galaxy, charholi budruk ,pune",
            lastLogin: "Jan. 18, 2025, 6:38 a.m.",
            dateJoined: "Nov. 7, 2023"
        },
        {
            id: 4,
            firstName: "aman",
            lastName: "verma",
            username: "aman.staff@mit.com",
            email: "aman.staff@mit.com",
            address: "dfghjkl;",
            lastLogin: "Jan. 18, 2025, 11:34 a.m.",
            dateJoined: "Jan. 18, 2025"
        },
        {
            id: 5,
            firstName: "aman",
            lastName: "verma",
            username: "aman.staff@mit.com",
            email: "aman.staff@mit.com",
            address: "dfghjkl;",
            lastLogin: "Jan. 18, 2025, 11:34 a.m.",
            dateJoined: "Jan. 18, 2025"
        },
        {
            id: 6,
            firstName: "aman",
            lastName: "verma",
            username: "aman.staff@mit.com",
            email: "aman.staff@mit.com",
            address: "dfghjkl;",
            lastLogin: "Jan. 18, 2025, 11:34 a.m.",
            dateJoined: "Jan. 18, 2025"
        },
        {
            id: 7,
            firstName: "aman",
            lastName: "verma",
            username: "aman.staff@mit.com",
            email: "aman.staff@mit.com",
            address: "dfghjkl;",
            lastLogin: "Jan. 18, 2025, 11:34 a.m.",
            dateJoined: "Jan. 18, 2025"
        },
        {
            id: 8,
            firstName: "aman",
            lastName: "verma",
            username: "aman.staff@mit.com",
            email: "aman.staff@mit.com",
            address: "dfghjkl;",
            lastLogin: "Jan. 18, 2025, 11:34 a.m.",
            dateJoined: "Jan. 18, 2025"
        },
        {
            id: 9,
            firstName: "aman",
            lastName: "verma",
            username: "aman.staff@mit.com",
            email: "aman.staff@mit.com",
            address: "dfghjkl;",
            lastLogin: "Jan. 18, 2025, 11:34 a.m.", 
            dateJoined: "Jan. 18, 2025"
        },
        {
            id: 10,
            firstName: "aman",
            lastName: "verma",
            username: "aman.staff@mit.com",
            email: "aman.staff@mit.com",
            address: "dfghjkl;",
            lastLogin: "Jan. 18, 2025, 11:34 a.m.",
            dateJoined: "Jan. 18, 2025"
        },
        {
            id: 11,
            firstName: "aman",
            lastName: "verma",
            username: "aman.staff@mit.com",
            email: "aman.staff@mit.com",
            address: "dfghjkl;",
            lastLogin: "Jan. 18, 2025, 11:34 a.m.",
            dateJoined: "Jan. 18, 2025"
        },
        {
            id: 12,
            firstName: "aman",
            lastName: "verma",
            username: "aman.staff@mit.com",
            email: "aman.staff@mit.com",
            address: "dfghjkl;",
            lastLogin: "Jan. 18, 2025, 11:34 a.m.",
            dateJoined: "Jan. 18, 2025"
        },
        {
            id: 13,
            firstName: "aman",
            lastName: "verma",
            username: "aman.staff@mit.com",
            email: "aman.staff@mit.com",
            address: "dfghjkl;",
            lastLogin: "Jan. 18, 2025, 11:34 a.m.",
            dateJoined: "Jan. 18, 2025"
        },
        {
            id: 14,
            firstName: "aman",
            lastName: "verma",
            username: "aman.staff@mit.com",
            email: "aman.staff@mit.com",
            address: "dfghjkl;",
            lastLogin: "Jan. 18, 2025, 11:34 a.m.",
            dateJoined: "Jan. 18, 2025"
        }
    ];




    const filteredStaff = staffMembers.filter(staff =>
        Object.values(staff).some(value =>
            value.toString().toLowerCase().includes(searchTerm.toLowerCase())
        )
    );

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
                        <div className="relative">
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
                                        <th className="text-base-content">ID</th>
                                        <th className="text-base-content">First Name</th>
                                        <th className="text-base-content">Last Name</th>
                                        <th className="text-base-content">Username</th>
                                        <th className="text-base-content">Email</th>
                                        <th className="text-base-content">Address</th>
                                        <th className="text-base-content">Last Login</th>
                                        <th className="text-base-content">Date Joined</th>
                                        <th className="text-base-content">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredStaff.map((staff) => (
                                        <tr key={staff.id} className="hover:bg-base-200">
                                            <td className="text-base-content">{staff.id}</td>
                                            <td className="text-base-content">{staff.firstName}</td>
                                            <td className="text-base-content">{staff.lastName}</td>
                                            <td className="text-base-content">{staff.username}</td>
                                            <td className="text-base-content">{staff.email}</td>
                                            <td className="text-base-content">{staff.address}</td>
                                            <td className="text-base-content">{staff.lastLogin}</td>
                                            <td className="text-base-content">{staff.dateJoined}</td>
                                            <td>
                                                <div className="flex gap-2">
                                                    <Button className="btn btn-ghost btn-sm">
                                                        <Edit className="w-4 h-4 text-info" />
                                                    </Button>
                                                    <Button className="btn btn-ghost btn-sm">
                                                        <Trash2 className="w-4 h-4 text-error" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}