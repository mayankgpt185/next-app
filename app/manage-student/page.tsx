'use client';

import React, { useEffect, useState } from 'react';
import { Search, Plus, Edit, Trash2, Loader2, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { formatDate } from '@/utils/dateUtils';
import ModalPopup from '../components/ui/modalPopup';
import toast from 'react-hot-toast';
import { ISession } from '../api/models/session';
import AcademicYearDropdown from '../components/ui/academicYearDropdown';

interface StudentMember {
    _id: number;
    rollNumber: number;
    studentId: {
        firstName: string;
        lastName: string;
        email: string;
        address: string;
        lastLogin: string;
        dateJoined: string;
    };
    class: {
        classNumber: string;
    };
    section: {
        section: string;
    };
}

export default function ManageStudentPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [studentMembers, setStudent] = useState<StudentMember[]>([]);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);
    const studentRole = "STUDENT";
    const [isLoading, setIsLoading] = useState(true);
    const [userRole, setUserRole] = useState<string | null>(null);
    const [userId, setUserId] = useState<number | null>(null);
    const [academicYears, setAcademicYears] = useState<ISession[]>([]);
    const [selectedAcademicYearId, setSelectedAcademicYearId] = useState<string | null>(null);
    const [isLoadingAcademicYears, setIsLoadingAcademicYears] = useState(true);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('token');
            if (!token) return;
            const payload = token.split('.')[1];
            const decodedPayload = JSON.parse(atob(payload));
            const userRole = decodedPayload.role;
            const userId = decodedPayload.id;
            setUserRole(userRole);
            setUserId(userId);

            const fetchAcademicYears = async () => {
                try {
                    setIsLoadingAcademicYears(true);
                    const response = await fetch('/api/session');
                    if (!response.ok) {
                        throw new Error('Failed to fetch academic years');
                    }
                    const data = await response.json();

                    setAcademicYears(data);

                    if (data.length > 0) {
                        // Sort by startDate in descending order
                        const sortedYears = [...data].sort((a, b) =>
                            new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
                        );
                        setSelectedAcademicYearId(sortedYears[0]._id);
                    }
                } catch (error) {
                    console.error('Error fetching academic years:', error);
                    toast.error('Failed to load academic years');
                } finally {
                    setIsLoadingAcademicYears(false);
                }
            };
            fetchAcademicYears();
        }
    }, []);

    useEffect(() => {
        if (userId && selectedAcademicYearId) {
            const fetchStudent = async () => {
                setIsLoading(true);
                try {
                    const response = await fetch(`/api/manage-staff?role=${studentRole}&id=${userId}&academicYearId=${selectedAcademicYearId}`);
                    const studentClassData = await response.json();
                    setStudent(studentClassData);
                } catch (error) {
                    console.error('Error fetching student:', error);
                } finally {
                    setIsLoading(false);
                }
            };
            fetchStudent();
        }
    }, [userId, selectedAcademicYearId, studentRole]);

    const handleDeleteClick = (studentId: number) => {
        setSelectedStudentId(studentId);
        setIsDeleteModalOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!selectedStudentId) return;

        try {
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

    // Handle year change
    const handleYearChange = (yearId: string) => {
        setSelectedAcademicYearId(yearId);
    };

    return (
        <div className="flex flex-col w-full min-h-screen p-6 bg-base-100">
            <div className="card bg-base-200 shadow-xl flex-1">
                <div className="card-body flex flex-col">
                    <div className="mb-6 flex justify-between items-center">
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
                        <div className="flex items-center gap-2">
                            {/* Academic Year Dropdown Component */}
                            <AcademicYearDropdown
                                academicYears={academicYears}
                                selectedYearId={selectedAcademicYearId}
                                onYearChange={handleYearChange}
                                isLoading={isLoadingAcademicYears}
                            />
                            
                            {userRole !== 'STUDENT' && (
                                <Link href="/manage-student/add">
                                    <Button variant="primary" type="submit" outline>
                                        <Plus className="w-4 h-4 mr-2" />
                                        Add Student
                                    </Button>
                                </Link>
                            )}
                        </div>
                    </div>

                    <div className="overflow-x-auto flex-1">
                        <div className="overflow-y-auto h-[calc(100vh-280px)]">
                            <table className="table table-pin-rows">
                                <thead className="sticky top-0 bg-base-300">
                                    <tr>
                                        <th className="text-base-content">Roll Number</th>
                                        <th className="text-base-content">First Name</th>
                                        <th className="text-base-content">Last Name</th>
                                        <th className="text-base-content">Class</th>
                                        <th className="text-base-content">Email</th>
                                        <th className="text-base-content">Address</th>
                                        <th className="text-base-content">Last Login</th>
                                        <th className="text-base-content">Date Joined</th>
                                        {userRole !== 'STUDENT' && (
                                            <th className="text-base-content">Actions</th>
                                        )}
                                    </tr>
                                </thead>
                                <tbody>
                                    {isLoading ? (
                                        <tr>
                                            <td colSpan={userRole !== 'STUDENT' ? 9 : 8} className="text-center py-8">
                                                <div className="flex flex-col items-center gap-2">
                                                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
                                                    <p className="text-base-content">Loading students...</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : studentMembers.length > 0 ? (
                                        studentMembers.map((student) => (
                                            <tr key={student._id} className="hover:bg-base-200">
                                                <td className="text-base-content">{student.rollNumber}</td>
                                                <td className="text-base-content">{student.studentId.firstName}</td>
                                                <td className="text-base-content">{student.studentId.lastName}</td>
                                                <td className="text-base-content">{student.class.classNumber} {student.section.section}</td>
                                                <td className="text-base-content">{student.studentId.email}</td>
                                                <td className="text-base-content">{student.studentId.address}</td>
                                                <td className="text-base-content">{student.studentId?.lastLogin || 'N/A'}</td>
                                                <td className="text-base-content">{formatDate(student.studentId?.dateJoined || '')}</td>
                                                {userRole !== 'STUDENT' && (
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
                                                )}
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={userRole !== 'STUDENT' ? 9 : 8} className="text-center py-8">
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
        </div>
    );
}