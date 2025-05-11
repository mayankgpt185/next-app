'use client';

import React, { useEffect, useState } from 'react';
import { Search, Plus, Edit, Trash2, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '../components/ui/button';
import { formatDate } from '@/utils/dateUtils';
import ModalPopup from '../components/ui/modalPopup';
import toast from 'react-hot-toast';
import { UserRole } from '@/lib/role';
import AcademicYearDropdown from '../components/ui/academicYearDropdown';
import { ISession } from '../api/models/session';

interface Subject {
    _id: string;
    subject: string;
    classNumber: string;
    courseId: {
        class: {
            classNumber: string;
        };
        _id: string;
    };
    sectionIds: {
        section: string;
        _id: string;
    }[];
    staffIds: {
        firstName: string;
        lastName: string;
        _id: string;
    }[];
    academicYearId: {
        startDate: string;
        endDate: string;
        _id: string;
    };
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export default function ManageSubjectPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [userRole, setUserRole] = useState<string | null>(null);
    const [userId, setUserId] = useState<string | null>(null);
    const [academicYears, setAcademicYears] = useState<ISession[]>([]);
    const [selectedAcademicYearId, setSelectedAcademicYearId] = useState<ISession | null>(null);
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
                        setSelectedAcademicYearId(sortedYears[0]);
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
            const fetchSubjects = async () => {
                try {
                    setIsLoading(true);
                    
                    // Fetch subjects
                    const subjectsResponse = userRole === UserRole.STUDENT && userId 
                        ? await fetch(`/api/manage-subject?studentId=${userId}&role=${userRole}&academicYearId=${selectedAcademicYearId._id}`) 
                        : await fetch(`/api/manage-subject?academicYearId=${selectedAcademicYearId._id}`);

                    if (!subjectsResponse.ok) throw new Error('Failed to fetch subjects');
                    const subjectsData = await subjectsResponse.json();
                    setSubjects(subjectsData);
                } catch (error) {
                    console.error('Error fetching data:', error);
                    toast.error('Failed to fetch data');
                } finally {
                    setIsLoading(false);
                }
            };

            fetchSubjects();
        }
    }, [userRole, userId, selectedAcademicYearId]);

    const filteredSubjects = subjects.filter(subject => {
        // Apply search filter
        const matchesSearch = subject.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (subject.courseId && subject.courseId.class &&
                subject.courseId.class.classNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (subject.sectionIds && subject.sectionIds[0] &&
                subject.sectionIds[0].section.toLowerCase().includes(searchTerm.toLowerCase()));
        return matchesSearch;
    });

    const handleDeleteClick = (subjectId: string) => {
        setSelectedSubjectId(subjectId);
        setIsDeleteModalOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!selectedSubjectId) return;

        try {
            const response = await fetch(`/api/manage-subject?id=${selectedSubjectId}`, {
                method: 'DELETE',
            });

            if (!response.ok) throw new Error('Failed to delete course');

            // Remove deleted course from state
            setSubjects(prevSubjects => prevSubjects.filter(subject => subject._id !== selectedSubjectId));
            toast.success('Subject deleted successfully');
        } catch (error) {
            toast.error('Error deleting subject');
        }

        // Close modal after deleting
        setIsDeleteModalOpen(false);
        setSelectedSubjectId(null);
    };

    // Handle year change
    const handleYearChange = (yearId: ISession) => {
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
                                placeholder="Search subject..."
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
                                <Link href="/manage-subject/add">
                                    <Button variant="primary" type="submit" outline>
                                        <Plus className="w-4 h-4 mr-2" />
                                        Add Subject
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
                                        <th className="text-base-content">Subject Name</th>
                                        <th className="text-base-content">Class & Section</th>
                                        <th className="text-base-content">Staff</th>
                                        <th className="text-base-content">Created Date</th>
                                        <th className="text-base-content">Updated Date</th>
                                        {userRole !== 'STUDENT' && (
                                            <th className="text-base-content">Actions</th>
                                        )}
                                    </tr>
                                </thead>
                                <tbody>
                                    {isLoading ? (
                                        <tr>
                                            <td colSpan={userRole !== 'STUDENT' ? 6 : 5} className="text-center py-8">
                                                <div className="flex flex-col items-center gap-2">
                                                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
                                                    <p className="text-base-content">Loading subjects...</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : filteredSubjects.length > 0 ? (
                                        filteredSubjects.map((subject) => (
                                            <tr key={subject._id} className="hover:bg-base-200">
                                                <td className="text-base-content">{subject.subject}</td>
                                                <td className="text-base-content">
                                                    {subject.courseId.class.classNumber} - {subject.sectionIds.map(section => section.section).join(', ')}
                                                </td>
                                                <td className="text-base-content">
                                                    {Array.isArray(subject.staffIds)
                                                        ? subject.staffIds.map((staff: { firstName: string; lastName: string }) =>
                                                            `${staff.firstName} ${staff.lastName}`).join(', ')
                                                        : 'N/A'
                                                    }
                                                </td>
                                                <td className="text-base-content">{formatDate(subject.createdAt)}</td>
                                                <td className="text-base-content">{formatDate(subject?.updatedAt) || 'N/A'}</td>
                                                {userRole !== 'STUDENT' && (
                                                    <td>
                                                        <div className="flex gap-2">
                                                            <Link href={`/manage-subject/add?id=${subject._id}`}>
                                                                <Button className="btn btn-ghost btn-sm">
                                                                    <Edit className="w-4 h-4 text-info" />
                                                                </Button>
                                                            </Link>
                                                            <Button className="btn btn-ghost btn-sm"
                                                                onClick={() => handleDeleteClick(subject._id)}>
                                                                <Trash2 className="w-4 h-4 text-error" />
                                                            </Button>
                                                        </div>
                                                    </td>
                                                )}
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={userRole !== 'STUDENT' ? 6 : 5} className="text-center py-8">
                                                <div className="flex flex-col items-center gap-2">
                                                    <p className="text-lg font-medium text-base-content">No subjects found</p>
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
                message="This will permanently delete this subject."
            />
        </div>
    );
}