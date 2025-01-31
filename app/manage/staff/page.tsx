'use client';

import React, { useState } from 'react';
import { Card } from '../../components/ui/card';
import { Search, Plus, Edit, Trash2 } from 'lucide-react';
import Link from 'next/link';
import Layout from '@/app/layout'; // Adjust the import path as necessary
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import RootLayout from '@/app/layout';

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

    // Mock data - replace with actual API call
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
        }
    ];

    const filteredStaff = staffMembers.filter(staff =>
        Object.values(staff).some(value =>
            value.toString().toLowerCase().includes(searchTerm.toLowerCase())
        )
    );

    return (
        
        <RootLayout>
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold">Manage Staff</h1>
                    <Link href="staff/add">
                        <Button className="bg-blue-500 hover:bg-blue-600">
                            <Plus className="w-4 h-4 mr-2" />
                            Add Staff
                        </Button>
                    </Link>
                </div>

                <Card className="p-6">
                    <div className="mb-6">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <Input
                                type="text"
                                placeholder="Search staff..."
                                className="pl-10"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 dark:bg-gray-800">
                                <tr>
                                    <th className="px-4 py-3 text-left text-sm font-semibold">ID</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold">First Name</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold">Last Name</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold">Username</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold">Email</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold">Address</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold">Last Login</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold">Date Joined</th>
                                    <th className="px-4 py-3 text-left text-sm font-semibold">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {filteredStaff.map((staff) => (
                                    <tr key={staff.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                                        <td className="px-4 py-3 text-sm">{staff.id}</td>
                                        <td className="px-4 py-3 text-sm">{staff.firstName}</td>
                                        <td className="px-4 py-3 text-sm">{staff.lastName}</td>
                                        <td className="px-4 py-3 text-sm">{staff.username}</td>
                                        <td className="px-4 py-3 text-sm">{staff.email}</td>
                                        <td className="px-4 py-3 text-sm">{staff.address}</td>
                                        <td className="px-4 py-3 text-sm">{staff.lastLogin}</td>
                                        <td className="px-4 py-3 text-sm">{staff.dateJoined}</td>
                                        <td className="px-4 py-3 text-sm">
                                            <div className="flex space-x-2">
                                                <Button>
                                                    <Edit className="w-4 h-4" />
                                                </Button>
                                                <Button className="text-red-500 hover:text-red-600">
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>
        </RootLayout>
    );
}