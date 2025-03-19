'use client';

import React, { useEffect, useState } from 'react';
import { Search, Plus, Edit, Trash2, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { formatDate } from '@/utils/dateUtils';
import DeletePopup from '../components/ui/deletePopup';
import toast from 'react-hot-toast';

interface Course {
    _id: string;
    name: string;
    class: {
        classNumber: number;
        _id: string;
    };
    section: {
        section: string;
        _id: string;
    };
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export default function ManageCoursePage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [courses, setCourse] = useState<Course[]>([]);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchCourse = async () => {
            try {
                const response = await fetch(`/api/manage-course`);
                if (!response.ok) throw new Error('Failed to fetch course');
                const data = await response.json();
                setCourse(data);
            } catch (error) {
                console.error('Error fetching course:', error);
                toast.error('Failed to fetch courses');
            } finally {
                setIsLoading(false);
            }
        };
        fetchCourse();
    }, []);


    const filteredCourse = courses.filter(course => {
        // Search in course name
        if (course.name.toLowerCase().includes(searchTerm.toLowerCase())) return true;
        
        // Search in class number
        if (course.class && course.class.classNumber.toString().toLowerCase().includes(searchTerm.toLowerCase())) return true;
        
        // Search in section
        if (course.section && course.section.section.toLowerCase().includes(searchTerm.toLowerCase())) return true;
        
        return false;
    });

    const handleDeleteClick = (courseId: string) => {
        setSelectedCourseId(courseId);
        setIsDeleteModalOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!selectedCourseId) return;

        try {
            console.log('Deleting course with ID:', selectedCourseId);
            const response = await fetch(`/api/manage-course?id=${selectedCourseId}`, {
                method: 'DELETE',
            });

            if (!response.ok) throw new Error('Failed to delete course');

            // Remove deleted course from state
            setCourse(prevCourse => prevCourse.filter(course => course._id !== selectedCourseId));
            toast.success('Course deleted successfully');
        } catch (error) {
            toast.error('Error deleting course');
        }

        // Close modal after deleting
        setIsDeleteModalOpen(false);
        setSelectedCourseId(null);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-base-100">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary" />
                    <p className="mt-4 text-base-content">Loading courses...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col w-full min-h-screen p-6 bg-base-100">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-base-content">Manage Course</h1>
                <Link href="/manage-course/add">
                    <Button variant="primary" type="submit" outline>
                        <Plus className="w-4 h-4 mr-2" />
                        Add Course
                    </Button>
                </Link>
            </div>

            <div className="card bg-base-200 shadow-xl flex-1">
                <div className="card-body flex flex-col">
                    <div className="mb-6">
                        <div className="relative w-1/3">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-base-content/60 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search course..."
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
                                        <th className="text-base-content">Course Name</th>
                                        <th className="text-base-content">Class</th>
                                        <th className="text-base-content">Section</th>
                                        {/* <th className="text-base-content">Created Date</th>
                                        <th className="text-base-content">Updated Date</th> */}
                                        <th className="text-base-content">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredCourse.length > 0 ? (
                                        filteredCourse.map((course) => (
                                            <tr key={course._id} className="hover:bg-base-200">
                                                <td className="text-base-content">{course.name}</td>
                                                <td className="text-base-content">{course.class.classNumber}</td>
                                                <td className="text-base-content">{course.section.section}</td>
                                                {/* <td className="text-base-content">{formatDate(course.createdAt)}</td>
                                                <td className="text-base-content">{formatDate(course?.updatedAt) || 'N/A'}</td> */}
                                                <td>
                                                    <div className="flex gap-2">
                                                        <Link href={`/manage-course/add?id=${course._id}`}>
                                                            <Button className="btn btn-ghost btn-sm">
                                                                <Edit className="w-4 h-4 text-info" />
                                                            </Button>
                                                        </Link>
                                                        <Button className="btn btn-ghost btn-sm"
                                                            onClick={() => {
                                                                setSelectedCourseId(course._id);
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
                                                    <p className="text-lg font-medium text-base-content">No courses found</p>
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
            <DeletePopup
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDeleteConfirm}
                message="This will permanently delete this course."
            />
        </div >
    );
}