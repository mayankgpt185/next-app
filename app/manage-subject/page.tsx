'use client';

import React, { useEffect, useState } from 'react';
import { Search, Plus, Edit, Trash2, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { formatDate } from '@/utils/dateUtils';
import ModalPopup from '../components/ui/modalPopup';
import toast from 'react-hot-toast';

interface Subject {
    _id: string;
    subject: string;
    classNumber: string;
    courseId: {
        class: string;
        name: string;
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
    const [classes, setClasses] = useState<any[]>([]);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [userRole, setUserRole] = useState<string | null>(null);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const storedRole = localStorage.getItem('userRole');
            setUserRole(storedRole);
        }

        const fetchData = async () => {
            try {
                setIsLoading(true);
                // Fetch subjects
                const subjectsResponse = await fetch(`/api/manage-subject`);
                if (!subjectsResponse.ok) throw new Error('Failed to fetch subjects');
                const subjectsData = await subjectsResponse.json();

                // Fetch classes
                const classesResponse = await fetch(`/api/classes`);
                if (!classesResponse.ok) throw new Error('Failed to fetch classes');
                const classesData = await classesResponse.json();

                setSubjects(subjectsData);
                setClasses(classesData);
            } catch (error) {
                console.error('Error fetching data:', error);
                toast.error('Failed to fetch data');
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    // Get class name by ID
    const getClassName = (classId: string) => {
        const foundClass = classes.find(c => c._id === classId);
        return foundClass ? foundClass.classNumber : 'N/A';
    };

    const filteredSubjects = subjects.filter(subject => {
        // Search in subject name
        if (subject.subject.toLowerCase().includes(searchTerm.toLowerCase())) return true;

        // Search in class number - using the class name from courseId
        if (subject.courseId && subject.courseId.class && 
            subject.courseId.class.toLowerCase().includes(searchTerm.toLowerCase())) return true;
        
        // Also search in the class number if available
        if (subject.classNumber && 
            subject.classNumber.toLowerCase().includes(searchTerm.toLowerCase())) return true;

        // Search in section
        if (subject.sectionIds && Array.isArray(subject.sectionIds) &&
            subject.sectionIds.some(section =>
                section.section.toLowerCase().includes(searchTerm.toLowerCase())
            )) return true;

        return false;
    });

    const handleDeleteClick = (subjectId: string) => {
        setSelectedSubjectId(subjectId);
        setIsDeleteModalOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!selectedSubjectId) return;

        try {
            console.log('Deleting subject with ID:', selectedSubjectId);
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

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-base-100">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary" />
                    <p className="mt-4 text-base-content">Loading subjects...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col w-full min-h-screen p-6 bg-base-100">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-base-content">Manage Subject</h1>
                {userRole !== 'STUDENT' && (
                    <Link href="/manage-subject/add">
                        <Button variant="primary" type="submit" outline>
                            <Plus className="w-4 h-4 mr-2" />
                            Add Subject
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
                                placeholder="Search subject..."
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
                                        <th className="text-base-content">Subject Name</th>
                                        <th className="text-base-content">Class & Section</th>
                                        <th className="text-base-content">Staff</th>
                                        <th className="text-base-content">Academic Year</th>
                                        <th className="text-base-content">Created Date</th>
                                        <th className="text-base-content">Updated Date</th>
                                        <th className="text-base-content">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredSubjects.length > 0 ? (
                                        filteredSubjects.map((subject) => (
                                            <tr key={subject._id} className="hover:bg-base-200">
                                                <td className="text-base-content">{subject.subject}</td>
                                                <td className="text-base-content">
                                                    {getClassName(subject.courseId && subject.courseId.class ? subject.courseId.class : subject.classNumber)} - {Array.isArray(subject.sectionIds)
                                                        ? subject.sectionIds.map(section => section.section).join(', ')
                                                        : 'N/A'
                                                    }
                                                </td>
                                                <td className="text-base-content">
                                                    {Array.isArray(subject.staffIds)
                                                        ? subject.staffIds.map((staff: { firstName: string; lastName: string }) =>
                                                            `${staff.firstName} ${staff.lastName}`).join(', ')
                                                        : 'N/A'
                                                    }
                                                </td>
                                                <td className="text-base-content">
                                                    {new Date(subject.academicYearId.startDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })} - {new Date(subject.academicYearId.endDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                                                </td>
                                                <td className="text-base-content">{formatDate(subject.createdAt)}</td>
                                                <td className="text-base-content">{formatDate(subject?.updatedAt) || 'N/A'}</td>
                                                <td>
                                                    <div className="flex gap-2">
                                                        {userRole !== 'STUDENT' && (
                                                            <Link href={`/manage-subject/add?id=${subject._id}`}>
                                                                <Button className="btn btn-ghost btn-sm">
                                                                    <Edit className="w-4 h-4 text-info" />
                                                                </Button>
                                                            </Link>
                                                        )}
                                                        <Button className="btn btn-ghost btn-sm"
                                                            onClick={() => {
                                                                setSelectedSubjectId(subject._id);
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
        </div >
    );
}