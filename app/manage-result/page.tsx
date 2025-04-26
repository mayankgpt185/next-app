'use client';

import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Button } from '@/app/components/ui/button';
import { Loader2, Edit } from 'lucide-react';
import { useRouter } from 'next/navigation';
interface Class {
    _id: string;
    classNumber: string;
}

interface Section {
    _id: string;
    section: string;
}

interface Student {
    _id: string;
    firstName: string;
    lastName: string;
}

interface Teacher {
    _id: string;
    firstName: string;
    lastName: string;
}

interface Subject {
    _id: string;
    subject: string;
}

interface Result {
    _id: string;
    examDate: string;
    examType?: string;
    subjectId: string;
    totalMarks: number;
    passingMarks: number;
    studentMarks: number | null;
    percentage: number | null;
    grade: string | null;
    present: boolean;
    staffId: string;
    parentId: string;
}

interface AcademicYear {
    _id: string;
    startDate: string;
    endDate: string;
}

const ViewResults = () => {
    const router = useRouter();
    const [userType, setUserType] = useState<'student' | 'teacher' | ''>('');
    const [classes, setClasses] = useState<Class[]>([]);
    const [sections, setSections] = useState<Section[]>([]);
    const [students, setStudents] = useState<Student[]>([]);
    const [selectedClassId, setSelectedClassId] = useState('');
    const [selectedSectionId, setSelectedSectionId] = useState('');
    const [selectedStudentId, setSelectedStudentId] = useState('');
    const [results, setResults] = useState<Result[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
    const [selectedAcademicYearId, setSelectedAcademicYearId] = useState('');
    const [hasFetchedResults, setHasFetchedResults] = useState(false);
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [selectedSubjectId, setSelectedSubjectId] = useState('');
    const [allStudentResults, setAllStudentResults] = useState<any[]>([]);
    const [isLoadingAcademicYears, setIsLoadingAcademicYears] = useState(true);
    const [isLoadingSubjects, setIsLoadingSubjects] = useState(false);
    const [userRole, setUserRole] = useState<string | null>(null);
    const [userId, setUserId] = useState<string | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingResult, setEditingResult] = useState<Result | null>(null);
    const [updatedAttendance, setUpdatedAttendance] = useState(false);
    const [updatedMarks, setUpdatedMarks] = useState<number | null>(null);
    const [isUpdating, setIsUpdating] = useState(false);
    // Fetch classes on component mount
    useEffect(() => {
        const fetchClasses = async () => {
            try {
                const response = await fetch('/api/classes');
                if (!response.ok) {
                    throw new Error('Failed to fetch classes');
                }
                const data = await response.json();
                setClasses(data);
            } catch (error) {
                console.error('Error fetching classes:', error);
                toast.error('Failed to load classes');
            }
        };

        fetchClasses();
    }, []);

    // Fetch sections on component mount
    useEffect(() => {
        const fetchSections = async () => {
            try {
                const response = await fetch('/api/sections');
                if (!response.ok) {
                    throw new Error('Failed to fetch sections');
                }
                const data = await response.json();
                setSections(data);
            } catch (error) {
                console.error('Error fetching sections:', error);
                toast.error('Failed to load sections');
            }
        };

        fetchSections();
    }, []);

    // Fetch students or teachers based on selection
    useEffect(() => {
        if (!selectedClassId || !selectedSectionId || !userType) return;

        const fetchUsers = async () => {
            setIsLoading(true);
            try {
                if (userType) {
                    // Fetch students with their class and section information
                    const response = await fetch(`/api/manage-staff?role=STUDENT`);
                    const studentClassResponse = await fetch(`/api/student-class`);

                    if (!response.ok || !studentClassResponse.ok) {
                        throw new Error('Failed to fetch students');
                    }

                    const data = await response.json();
                    const studentClassData = await studentClassResponse.json();

                    // Filter students by the selected class and section
                    const filteredStudents = data.filter((student: any) => {
                        const matchingClass = studentClassData.find((cls: any) =>
                            cls.studentId === student._id &&
                            cls.class._id === selectedClassId &&
                            cls.section._id === selectedSectionId
                        );
                        return !!matchingClass;
                    });

                    setStudents(filteredStudents);
                }
            } catch (error) {
                console.error(`Error fetching ${userType}s:`, error);
                toast.error(`Failed to load ${userType}s`);
            } finally {
                setIsLoading(false);
            }
        };

        fetchUsers();
    }, [selectedClassId, selectedSectionId, userType]);

    // Remove the automatic fetch from useEffect
    useEffect(() => {
        if (!selectedStudentId) {
            setResults([]);
        }
    }, [selectedStudentId, userType, selectedClassId, selectedSectionId]);

    // Modify this function to just return the data, not set state
    const getUserInfoFromToken = () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return null;
            const payload = token.split('.')[1];
            const decodedPayload = JSON.parse(atob(payload));
            return {
                role: decodedPayload.role,
                id: decodedPayload.id
            };
        } catch (error) {
            console.error('Error extracting user info from token:', error);
            return null;
        }
    };

    // Update the useEffect for user role detection
    useEffect(() => {
        try {            
            // Get user info from token and set states
            const userInfo = getUserInfoFromToken();
            if (userInfo) {
                setUserRole(userInfo.role);
                setUserId(userInfo.id);
            } else {
                toast.error('Not authenticated');
                router.push('/login');
            }
        } catch (error) {
            toast.error('Failed to get user information');
            router.push('/login');
        }
    }, [router]);

    // Add a separate useEffect that responds to userRole changes
    useEffect(() => {
        if (userRole) {            
            if (userRole === 'ADMIN' || userRole === 'STAFF') {
                setUserType('teacher');
            } else if (userRole === 'STUDENT') {
                setUserType('student');
                
                if (userId) {
                    // For students, automatically fetch their class and section
                    fetchStudentDetails(userId);
                }
            }
        }
    }, [userRole, userId]);
    
    // Modify the academic year useEffect
    useEffect(() => {
        const fetchAcademicYears = async () => {
            setIsLoadingAcademicYears(true);
            try {
                const response = await fetch('/api/session');
                if (!response.ok) {
                    throw new Error('Failed to fetch academic years');
                }
                const data = await response.json();

                setAcademicYears(data);

                if (data.length > 0) {
                    // Get current date
                    const currentDate = new Date();
                    
                    // Find academic year containing current date
                    const currentAcademicYear = data.find((year: any) => {
                        const startDate = new Date(year.startDate);
                        const endDate = new Date(year.endDate);
                        return currentDate >= startDate && currentDate <= endDate;
                    });
                    
                    if (currentAcademicYear) {
                        // Set the academic year that contains the current date
                        setSelectedAcademicYearId(currentAcademicYear._id);
                    } else {
                        // Fallback: Sort by startDate in descending order and use the most recent
                        const sortedYears = [...data].sort((a, b) =>
                            new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
                        );
                        setSelectedAcademicYearId(sortedYears[0]._id);
                    }
                }
            } catch (error) {
                console.error('Error fetching academic years:', error);
                toast.error('Failed to load academic years');
            } finally {
                setIsLoadingAcademicYears(false);
            }
        };

        fetchAcademicYears();
    }, []);

    // Modify the function to fetch subjects based on selected class and section
    const fetchSubjects = async () => {
        try {
            // Only fetch subjects if both class and section are selected
            if (!selectedClassId || !selectedSectionId) {
                return;
            }
            
            setIsLoadingSubjects(true);
            const params = new URLSearchParams({
                classId: selectedClassId,
                sectionId: selectedSectionId
            });
            
            const response = await fetch(`/api/manage-subject/?${params}`);
            if (!response.ok) {
                throw new Error('Failed to fetch subjects');
            }
            const data = await response.json();
            setSubjects(data);
            
            // Reset selected subject when subjects change
            setSelectedSubjectId('');
        } catch (error) {
            console.error('Error fetching subjects:', error);
            toast.error('Failed to load subjects');
        } finally {
            setIsLoadingSubjects(false);
        }
    };

    // Add a useEffect to fetch subjects when class or section changes
    useEffect(() => {
        if (selectedClassId && selectedSectionId) {
            fetchSubjects();
        } else {
            // Clear subjects when class or section is not selected
            setSubjects([]);
            setSelectedSubjectId('');
        }
    }, [selectedClassId, selectedSectionId]);

    // Add function to fetch teachers
    const fetchTeachers = async () => {
        try {
            const response = await fetch('/api/manage-staff?role=STAFF');
            if (!response.ok) {
                throw new Error('Failed to fetch teachers');
            }
            const data = await response.json();
            setTeachers(data);
        } catch (error) {
            console.error('Error fetching teachers:', error);
        }
    };

    // Fetch subjects and teachers on component mount
    useEffect(() => {
        fetchSubjects();
        fetchTeachers();
    }, []);

    const handleUserTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value as 'student' | 'teacher' | '';
        setUserType(value);
        setSelectedStudentId('');
        setResults([]);
    };

    const handleClassChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedClassId(e.target.value);
        setSelectedSectionId('');
        setSelectedStudentId('');
        setSelectedSubjectId('');
        setResults([]);
    };

    const handleSectionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedSectionId(e.target.value);
        setSelectedStudentId('');
        setSelectedSubjectId('');
        setResults([]);
    };

    const handleUserChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedStudentId(e.target.value);
        setResults([]);
        setHasFetchedResults(false);
    };

    // Modify the fetchResults function to handle both student and teacher cases
    const fetchResults = async () => {
        if (userType === 'student') {
            if (!selectedStudentId || !selectedClassId || !selectedSectionId) {
                toast.error('Please select class, section, and student first');
                return;
            }
        } else if (userType === 'teacher') {
            if (!selectedClassId || !selectedSectionId || !selectedSubjectId) {
                toast.error('Please select class, section, and subject first');
                return;
            }
        } else {
            toast.error('Please select user type first');
            return;
        }

        setIsLoading(true);
        setHasFetchedResults(true);
        
        try {
            if (userType === 'student') {
                // Fetch results for a specific student
                const params = new URLSearchParams({
                    studentId: selectedStudentId,
                    classId: selectedClassId,
                    sectionId: selectedSectionId
                });

                const response = await fetch(`/api/manage-result/?${params}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch results');
                }

                const data = await response.json();
                setResults(data);
            } else {
                // Fetch results for all students for a specific subject
                const params = new URLSearchParams({
                    classId: selectedClassId,
                    sectionId: selectedSectionId,
                    subjectId: selectedSubjectId
                });

                const response = await fetch(`/api/manage-result/?${params}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch results');
                }

                const data = await response.json();
                setAllStudentResults(data);
                // Clear single student results
                setResults([]);
            }
            
            // Ensure we have the latest subjects and teachers
            if (subjects.length === 0) {
                await fetchSubjects();
            }
            if (teachers.length === 0) {
                await fetchTeachers();
            }
        } catch (error) {
            console.error('Error fetching results:', error);
            toast.error('Failed to load results');
        } finally {
            setIsLoading(false);
        }
    };
    
    // Add helper functions to get names from IDs
    const getSubjectName = (subjectId: string) => {
        const subject = subjects.find(s => s._id === subjectId);
        return subject ? subject.subject : subjectId;
    };
    
    const getTeacherName = (teacherId: string) => {
        const teacher = teachers.find(t => t._id === teacherId);
        return teacher ? teacher.firstName + " " + teacher.lastName : teacherId;
    };

    // Add this function to fetch student details
    const fetchStudentDetails = async (studentId: string) => {
        try {
            // First get the student's class and section from student-class API
            const studentClassResponse = await fetch(`/api/student-class?studentId=${studentId}`);
            
            if (!studentClassResponse.ok) {
                throw new Error('Failed to fetch student class information');
            }
            
            const studentClassData = await studentClassResponse.json();
            if (studentClassData) {
                // Set class and section from the student's data
                setSelectedClassId(studentClassData.class._id);
                setSelectedSectionId(studentClassData.section._id);
                setSelectedStudentId(studentId);
            } else {
                toast.error('No class/section found for this student');
            }
        } catch (error) {
            console.error('Error fetching student details:', error);
            toast.error('Failed to load student details');
        }
    };

    // Add this grade conversion function after the fetchStudentDetails function
    const calculateGrade = (marks: number, totalMarks: number): string => {
        const percentage = (marks / totalMarks) * 100;
        
        if (percentage >= 90) return 'A+';
        if (percentage >= 80) return 'A';
        if (percentage >= 70) return 'B+';
        if (percentage >= 60) return 'B';
        if (percentage >= 50) return 'C+';
        if (percentage >= 40) return 'C';
        if (percentage >= 33) return 'D';
        return 'F';
    };

    // Update the groupResultsByExamType function to sort results
    const groupResultsByExamType = (results: Result[]) => {
        const grouped: { [key: string]: Result[] } = {};
        
        results.forEach(result => {
            const examType = result.examType || 'Other';
            if (!grouped[examType]) {
                grouped[examType] = [];
            }
            grouped[examType].push(result);
        });
        
        // Sort each group's results by exam date (newest first)
        Object.keys(grouped).forEach(key => {
            grouped[key].sort((a, b) => new Date(b.examDate).getTime() - new Date(a.examDate).getTime());
        });
        
        return grouped;
    };

    // Update the groupResultsByStudent function to sort results
    const groupResultsByStudent = (results: any[]) => {
        const grouped: { [key: string]: { studentName: string, results: any[] } } = {};
        
        results.flatMap(resultSet => 
            resultSet.results.forEach((studentResult: any) => {
                const studentId = studentResult.studentId._id;
                const studentName = `${studentResult.studentId.firstName} ${studentResult.studentId.lastName}`;
                
                if (!grouped[studentId]) {
                    grouped[studentId] = {
                        studentName,
                        results: []
                    };
                }
                
                grouped[studentId].results.push({
                    ...studentResult,
                    examDate: resultSet.examDate,
                    subjectId: resultSet.subjectId,
                    totalMarks: resultSet.totalMarks,
                    passingMarks: resultSet.passingMarks,
                    examType: resultSet.examType,
                    staffId: resultSet.staffId,
                    parentId: resultSet._id  // Include the parent document ID
                });
            })
        );
        
        // Sort each student's results by exam date (newest first)
        Object.keys(grouped).forEach(key => {
            grouped[key].results.sort((a, b) => new Date(b.examDate).getTime() - new Date(a.examDate).getTime());
        });
        
        return grouped;
    };

    // Add this helper function near the top of your file
    const formatDate = (dateString: string): string => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        }); // Formats as dd/mm/yyyy
    };

    const handleUpdateResult = async () => {
        if (!editingResult) {
            toast.error('No result selected');
            return;
        }
        
        // Only validate marks if student is present
        if (updatedAttendance && updatedMarks === null) {
            toast.error('Please enter marks for present student');
            return;
        }
        
        // Set marks to null if student is absent
        const marksToSubmit = updatedAttendance ? updatedMarks : null;
        
        setIsUpdating(true);
        try {
            const response = await fetch(`/api/manage-result?updateOne=true`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    parentId: editingResult.parentId,  // Parent document ID
                    resultId: editingResult._id,           // Specific result ID
                    present: updatedAttendance,
                    marks: marksToSubmit
                })
            });

            if (!response.ok) {
                throw new Error('Failed to update result');
            }

            // Close modal first to prevent UI flicker
            setIsEditModalOpen(false);
            
            // Refresh data to see the changes
            if (userType === 'student') {
                // For student view
                await fetchResults();
            } else {
                // For teacher view
                // Clear previous results and re-fetch to get updated data
                setAllStudentResults([]);
                await fetchResults();
            }
            
            toast.success('Result updated successfully');
        } catch (error) {
            console.error('Error updating result:', error);
            toast.error('Failed to update result');
        } finally {
            setIsUpdating(false);
        }
    };

    // Add this function to handle editing
    const handleEditClick = (result: any) => {
        setEditingResult(result);
        // Correctly set initial marks based on the result structure
        // For student view results, marks is in 'studentMarks'
        // For teacher view, it's in 'marks'
        setUpdatedMarks(result.studentMarks !== undefined ? result.studentMarks : result.marks);
        setUpdatedAttendance(result.present);
        setIsEditModalOpen(true);
    };

    return (
        <div className="flex flex-col w-full p-6 bg-base-100 min-h-screen">
            <div className="card bg-base-200 shadow-xl">
                <div className="card-body">
                    <h2 className="card-title text-2xl font-bold text-base-content mb-6">View Results</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        {/* Academic Year Selection (First Field) */}
                        <div className="form-control w-full">
                            <label className="label">
                                <span className="label-text text-base-content">Academic Year</span>
                            </label>
                            <div className="relative">
                                <select
                                    className="select select-bordered w-full bg-base-100 text-base-content"
                                    value={selectedAcademicYearId}
                                    onChange={(e) => setSelectedAcademicYearId(e.target.value)}
                                >
                                    <option value="">Select Academic Year</option>
                                    {academicYears.map(year => {
                                        const startDate = new Date(year.startDate);
                                        const endDate = new Date(year.endDate);
                                        const label = `${startDate.toLocaleString('default', { month: 'short' })} ${startDate.getFullYear()} - ${endDate.toLocaleString('default', { month: 'short' })} ${endDate.getFullYear()}`;

                                        return (
                                            <option key={year._id} value={year._id} className="text-base-content bg-base-100">
                                                {label}
                                            </option>
                                        );
                                    })}
                                </select>
                                {isLoadingAcademicYears && (
                                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                        <span className="loading loading-spinner loading-sm text-primary"></span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* User Type Selection - Hidden now that it's automatically determined */}
                        {/* 
                        <div className="form-control w-full">
                            <label className="label">
                                <span className="label-text text-base-content">User Type</span>
                            </label>
                            <select
                                className="select select-bordered w-full bg-base-100 text-base-content"
                                value={userType}
                                onChange={handleUserTypeChange}
                                disabled={true}
                            >
                                <option value="">Select User Type</option>
                                <option value="student">Student</option>
                                <option value="teacher">Teacher</option>
                            </select>
                        </div>
                        */}

                        {/* Class Selection - Only shown for teachers */}
                        {userType !== 'student' && (
                            <div className="form-control w-full">
                                <label className="label">
                                    <span className="label-text text-base-content">Select Class</span>
                                </label>
                                <select
                                    className="select select-bordered w-full bg-base-100 text-base-content"
                                    value={selectedClassId}
                                    onChange={handleClassChange}
                                    disabled={!userType}
                                >
                                    <option value="">Select Class</option>
                                    {classes.map(cls => (
                                        <option key={cls._id} value={cls._id} className="text-base-content bg-base-100">
                                            {cls.classNumber}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {/* Section Selection - Only shown for teachers */}
                        {userType !== 'student' && (
                            <div className="form-control w-full">
                                <label className="label">
                                    <span className="label-text text-base-content">Select Section</span>
                                </label>
                                <select
                                    className="select select-bordered w-full bg-base-100 text-base-content"
                                    value={selectedSectionId}
                                    onChange={handleSectionChange}
                                    disabled={!userType}
                                >
                                    <option value="">Select Section</option>
                                    {sections.map(section => (
                                        <option key={section._id} value={section._id} className="text-base-content bg-base-100">
                                            {section.section}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {/* Conditional: Show either Subject or Student dropdown based on userType */}
                        {userType === 'teacher' ? (
                            <div className="form-control w-full">
                                <label className="label">
                                    <span className="label-text text-base-content">Select Subject</span>
                                </label>
                                <div className="relative">
                                    <select
                                        className="select select-bordered w-full bg-base-100 text-base-content"
                                        value={selectedSubjectId}
                                        onChange={(e) => {
                                            setSelectedSubjectId(e.target.value);
                                            setAllStudentResults([]);
                                            setHasFetchedResults(false);
                                        }}
                                        disabled={!selectedSectionId}
                                    >
                                        <option value="">Select Subject</option>
                                        {subjects.map(subject => (
                                            <option key={subject._id} value={subject._id} className="text-base-content bg-base-100">
                                                {subject.subject}
                                            </option>
                                        ))}
                                    </select>
                                    {isLoadingSubjects && (
                                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                            <span className="loading loading-spinner loading-sm text-primary"></span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : userType === 'student' ? (
                            // For students, don't show any additional selection field
                            null
                        ) : (
                            <div className="form-control w-full">
                                <label className="label">
                                    <span className="label-text text-base-content">Select Student</span>
                                </label>
                                <div className="relative">
                                    <select
                                        className="select select-bordered w-full bg-base-100 text-base-content"
                                        value={selectedStudentId}
                                        onChange={handleUserChange}
                                        disabled={!selectedSectionId}
                                    >
                                        <option value="">Select Student</option>
                                        {students.map(student => (
                                            <option key={student._id} value={student._id} className="text-base-content bg-base-100">
                                                {student.firstName} {student.lastName}
                                            </option>
                                        ))}
                                    </select>
                                    {isLoading && !selectedStudentId && (
                                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                            <span className="loading loading-spinner loading-sm text-primary"></span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Move the fetch results button here, right after the selection fields */}
                    <div className="flex justify-end mb-6">
                        <Button
                            type="button"
                            variant="primary"
                            outline
                            onClick={fetchResults}
                            disabled={(userType === 'student' && !selectedStudentId) || 
                                     (userType === 'teacher' && !selectedSubjectId) ||
                                     isLoading}
                        >
                            Fetch Results
                        </Button>
                    </div>

                    {/* Results Table (display one of two different tables based on the user type) */}
                    {isLoading ? (
                        <div className="flex justify-center my-8">
                            <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary" />
                        </div>
                    ) : userType === 'student' && results.length > 0 ? (
                        <div className="space-y-4">
                            {Object.entries(groupResultsByExamType(results)).map(([examType, examResults], index) => (
                                <div key={index} className="collapse collapse-arrow bg-base-200 border-2 border-base-300 rounded-lg mb-2">
                                    <input type="checkbox" /> 
                                    <div className="collapse-title text-xl font-medium text-base-content">
                                        {examType} ({examResults.length} results)
                                    </div>
                                    <div className="collapse-content bg-base-100">
                                        <div className="overflow-x-auto">
                                            <table className="table table-zebra w-full">
                                                <thead>
                                                    <tr className="bg-base-300">
                                                        <th className="text-base-content">Exam Date</th>
                                                        <th className="text-base-content">Subject</th>
                                                        <th className="text-base-content">Teacher</th>
                                                        <th className="text-base-content">Total Marks</th>
                                                        <th className="text-base-content">Passing Marks</th>
                                                        <th className="text-base-content">Status</th>
                                                        <th className="text-base-content">Marks Obtained</th>
                                                        <th className="text-base-content">Result</th>
                                                        <th className="text-base-content">Grade</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {examResults.map((result, resultIndex) => (
                                                        <tr key={resultIndex} className="text-base-content">
                                                            <td>{formatDate(result.examDate)}</td>
                                                            <td>{getSubjectName(result.subjectId)}</td>
                                                            <td>{getTeacherName(result.staffId)}</td>
                                                            <td>{result.totalMarks}</td>
                                                            <td>{result.passingMarks}</td>
                                                            <td>
                                                                {result.present ? (
                                                                    <span className="badge badge-success text-base-100">Present</span>
                                                                ) : (
                                                                    <span className="badge badge-error text-base-100">Absent</span>
                                                                )}
                                                            </td>
                                                            <td>{result.present ? result.studentMarks : 'N/A'}</td>
                                                            <td>
                                                                {result.present ? (
                                                                    result.studentMarks !== null && result.studentMarks >= result.passingMarks ? (
                                                                        <span className="badge badge-success text-base-100">Pass</span>
                                                                    ) : (
                                                                        <span className="badge badge-error text-base-100">Fail</span>
                                                                    )
                                                                ) : (
                                                                    'N/A'
                                                                )}
                                                            </td>
                                                            <td>{result.present ? (result.grade || calculateGrade(result.studentMarks || 0, result.totalMarks)) : 'N/A'}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : userType === 'teacher' && allStudentResults.length > 0 ? (
                        <div className="space-y-4">
                            {Object.entries(groupResultsByStudent(allStudentResults)).map(([studentId, data], index) => (
                                <div key={studentId} className="collapse collapse-arrow bg-base-200 border-2 border-base-300 rounded-lg mb-2">
                                    <input type="checkbox" />
                                    <div className="collapse-title text-xl font-medium text-base-content">
                                        {data.studentName} ({data.results.length} results)
                                    </div>
                                    <div className="collapse-content bg-base-100">
                                        <div className="overflow-x-auto">
                                            <table className="table table-zebra w-full">
                                                <thead>
                                                    <tr className="bg-base-300">
                                                        <th className="text-base-content">Exam Type</th>
                                                        <th className="text-base-content">Exam Date</th>
                                                        <th className="text-base-content">Subject</th>
                                                        <th className="text-base-content">Total Marks</th>
                                                        <th className="text-base-content">Status</th>
                                                        <th className="text-base-content">Marks Obtained</th>
                                                        <th className="text-base-content">Result</th>
                                                        <th className="text-base-content">Grade</th>
                                                        <th className="text-base-content">Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {data.results.map((result: any, resultIndex: number) => (
                                                        <tr key={resultIndex} className="text-base-content">
                                                            <td>{result.examType || 'N/A'}</td>
                                                            <td>{formatDate(result.examDate)}</td>
                                                            <td>{getSubjectName(result.subjectId)}</td>
                                                            <td>{result.totalMarks}</td>
                                                            <td>
                                                                {result.present ? (
                                                                    <span className="badge badge-success text-base-100">Present</span>
                                                                ) : (
                                                                    <span className="badge badge-error text-base-100">Absent</span>
                                                                )}
                                                            </td>
                                                            <td>{result.present ? result.marks : 'N/A'}</td>
                                                            <td>
                                                                {result.present ? (
                                                                    result.marks >= result.passingMarks ? (
                                                                        <span className="badge badge-success text-base-100">Pass</span>
                                                                    ) : (
                                                                        <span className="badge badge-error text-base-100">Fail</span>
                                                                    )
                                                                ) : (
                                                                    'N/A'
                                                                )}
                                                            </td>
                                                            <td>{result.present ? (result.grade || calculateGrade(result.marks || 0, result.totalMarks)) : 'N/A'}</td>
                                                            <td>
                                                                {result.staffId === userId && (
                                                                    <Edit 
                                                                        className="h-5 w-5 cursor-pointer text-primary" 
                                                                        onClick={() => handleEditClick(result)}
                                                                    />
                                                                )}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : selectedStudentId && hasFetchedResults || 
                       (userType === 'teacher' && selectedSubjectId && hasFetchedResults) ? (
                        <div className="text-center my-8">
                            <p className="text-lg text-base-content">No results found for the selected criteria.</p>
                        </div>
                    ) : null}
                </div>
            </div>

            {isEditModalOpen && editingResult && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-base-100 p-6 rounded-lg shadow-lg w-96">
                        <h3 className="text-lg font-bold mb-4 text-base-content">Update Result</h3>
                        
                        <div className="mb-4">
                            <p className="text-sm text-base-content mb-1">Exam: {editingResult.examType || 'N/A'}</p>
                            <p className="text-sm text-base-content mb-1">Date: {formatDate(editingResult.examDate)}</p>
                            <p className="text-sm text-base-content mb-3">Total Marks: {editingResult.totalMarks}</p>
                            
                            {/* Attendance toggle */}
                            <label className="label cursor-pointer justify-start gap-2 mb-4">
                                <span className="label-text text-base-content">Attendance Status:</span>
                                <div className="flex items-center">
                                    <span className={`mr-2 text-base-content ${!updatedAttendance ? 'font-bold' : ''}`}>Absent</span>
                                    <input
                                        type="checkbox"
                                        className="toggle toggle-success"
                                        checked={updatedAttendance}
                                        onChange={(e) => setUpdatedAttendance(e.target.checked)}
                                    />
                                    <span className={`ml-2 text-base-content ${updatedAttendance ? 'font-bold' : ''}`}>Present</span>
                                </div>
                            </label>
                            
                            {/* Only render marks input when attendance is present */}
                            {updatedAttendance && (
                                <div className="mt-2">
                                    <label className="label pt-0">
                                        <span className="label-text text-base-content">Marks</span>
                                    </label>
                                    <input
                                        type="number"
                                        className="input input-bordered w-full bg-base-200 text-base-content"
                                        min="0"
                                        max={editingResult.totalMarks}
                                        value={updatedMarks === null ? '' : updatedMarks}
                                        onChange={(e) => setUpdatedMarks(e.target.value === '' ? null : Number(e.target.value))}
                                        onWheel={(e) => e.currentTarget.blur()}
                                    />
                                </div>
                            )}
                        </div>
                        
                        <div className="flex justify-end gap-2">
                            <Button
                                type="button"
                                variant="error"
                                outline
                                onClick={() => setIsEditModalOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="button"
                                variant="primary"
                                outline
                                onClick={handleUpdateResult}
                                disabled={isUpdating}
                            >
                                {isUpdating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Save'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ViewResults;
