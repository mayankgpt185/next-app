'use client';

import React, { useEffect, useState } from 'react';
import { Search, Plus, Edit, Trash2, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { formatDate } from '@/utils/dateUtils';
import ModalPopup from '../components/ui/modalPopup';
import toast from 'react-hot-toast';

interface StudentMember {
    _id: number;
    firstName: string;
    lastName: string;
    class: string;
    section: string;
    email: string;
    address: string;
    lastLogin: string;
    dateJoined: string;
}

export default function ManageStudentPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [studentMembers, setStudent] = useState<StudentMember[]>([]);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);
    const studentRole = "STUDENT";
    const [isLoading, setIsLoading] = useState(true);
    const [userRole, setUserRole] = useState<string | null>(null);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const storedRole = localStorage.getItem('userRole');
            setUserRole(storedRole);
        }

        const fetchStudent = async () => {
            try {
                const response = await fetch(`/api/manage-staff?role=${studentRole}`);
                const studentClassResponse = await fetch(`/api/student-class`);
                if (!response.ok || !studentClassResponse.ok) throw new Error('Failed to fetch student');
                const data = await response.json();
                const studentClassData = await studentClassResponse.json();
                
                data.forEach((student: StudentMember) => {
                    const matchingClass = studentClassData.find((cls: any) => cls.studentId === student._id);
                    if (matchingClass) {
                        student.class = matchingClass.class.classNumber || '';
                        student.section = matchingClass.section.section || '';
                    }
                });
                setStudent(data);
            } catch (error) {
                console.error('Error fetching student:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchStudent();
    }, []);


    const filteredStudent = studentMembers.filter(student =>
        Object.values(student).some(value =>
            value.toString().toLowerCase().includes(searchTerm.toLowerCase())
        )
    );

    const handleDeleteClick = (studentId: number) => {
        setSelectedStudentId(studentId);
        setIsDeleteModalOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!selectedStudentId) return;

        try {
            console.log('Deleting student with ID:', selectedStudentId);
            const response = await fetch(`/api/manage-staff?id=${selectedStudentId}`, {
                method: 'DELETE',
            });

            if (!response.ok) throw new Error('Failed to delete Student');

            // Remove deleted student from state
            setStudent(prevStudent => prevStudent.filter(student => student._id !== selectedStudentId));
            toast.success('Student deleted successfully');
        } catch (error) {
            toast.error('Error deleting student');
        }

        // Close modal after deleting
        setIsDeleteModalOpen(false);
        setSelectedStudentId(null);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-base-100">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary" />
                    <p className="mt-4 text-base-content">Loading student...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col w-full min-h-screen p-6 bg-base-100">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-base-content">Manage Student</h1>
                {userRole !== 'STUDENT' && (
                    <Link href="/manage-student/add">
                        <Button variant="primary" type="submit" outline>
                            <Plus className="w-4 h-4 mr-2" />
                            Add Student
                        </Button>
                    </Link>
                )}
            </div>

            <div className="card bg-base-200 shadow-xl flex-1">
                <div className="card-body flex flex-col">
                    <div className="mb-6">
                        <div className="relative w-1/3">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-base-content/60 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search student..."
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
                                        <th className="text-base-content">Class</th>
                                        <th className="text-base-content">Email</th>
                                        <th className="text-base-content">Address</th>
                                        <th className="text-base-content">Last Login</th>
                                        <th className="text-base-content">Date Joined</th>
                                        <th className="text-base-content">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredStudent.length > 0 ? (
                                        filteredStudent.map((student) => (
                                            <tr key={student._id} className="hover:bg-base-200">
                                                <td className="text-base-content">{student.firstName}</td>
                                                <td className="text-base-content">{student.lastName}</td>
                                                <td className="text-base-content">{student.class} {student.section}</td>
                                                <td className="text-base-content">{student.email}</td>
                                                <td className="text-base-content">{student.address}</td>
                                                <td className="text-base-content">{student?.lastLogin || 'N/A'}</td>
                                                <td className="text-base-content">{formatDate(student.dateJoined)}</td>
                                                <td>
                                                    <div className="flex gap-2">
                                                        <Link href={`/manage-student/add?id=${student._id}`}>
                                                            <Button className="btn btn-ghost btn-sm">
                                                                <Edit className="w-4 h-4 text-info" />
                                                            </Button>
                                                        </Link>
                                                        <Button className="btn btn-ghost btn-sm"
                                                            onClick={() => {
                                                                setSelectedStudentId(student._id);
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
                                                    <p className="text-lg font-medium text-base-content">No student members found</p>
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
            <ModalPopup
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDeleteConfirm}
                message="This will permanently delete this student."
            />
        </div >
    );
}