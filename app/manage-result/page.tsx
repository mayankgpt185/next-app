'use client';

import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Button } from '@/app/components/ui/button';
import { Loader2 } from 'lucide-react';
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
    subjectId: string;
    totalMarks: number;
    passingMarks: number;
    studentMarks: number | null;
    percentage: number | null;
    grade: string | null;
    present: boolean;
    staffId: string;
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

    // Add this function to decode JWT token and get user ID
    const getUserIdFromToken = () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return null;
            const payload = token.split('.')[1];
            const decodedPayload = JSON.parse(atob(payload));
            // const userRole = decodedPayload.role;
            // const userId = decodedPayload.id;
            setUserRole(decodedPayload.role);
            setUserId(decodedPayload.id);
            // return decodedPayload.id;
        } catch (error) {
            console.error('Error extracting user ID from token:', error);
            return null;
        }
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

    // Update the useEffect for user role detection to ensure the function is called
    useEffect(() => {
        try {            
            // Get user ID from token
            // const userId = getUserIdFromToken();
            
            // Set user type based on role
            if (userRole) {
                if (userRole === 'ADMIN' || userRole === 'STAFF') {
                    setUserType('teacher');
                    
                    // For staff, we might need their ID for certain operations
                    if (userId) {
                        // Store staff ID if needed for future use
                        // You can add state for this if required
                    }
                } else if (userRole === 'STUDENT') {
                    setUserType('student');
                    
                    if (userId) {
                        // For students, automatically fetch their class and section
                        fetchStudentDetails(userId);
                    }
                }
            }
        } catch (error) {
            toast.error('Failed to get user role');
            router.push('/login');
        }
    }, []);
    
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
                        <div className="overflow-x-auto">
                            <table className="table w-full">
                                <thead>
                                    <tr className="text-base-content">
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
                                    {results.map((result, index) => (
                                        <tr key={index} className="text-base-content">
                                            <td>{new Date(result.examDate).toLocaleDateString()}</td>
                                            <td>{getSubjectName(result.subjectId)}</td>
                                            <td>{getTeacherName(result.staffId)}</td>
                                            <td>{result.totalMarks}</td>
                                            <td>{result.passingMarks}</td>
                                            <td>
                                                {result.present ? (
                                                    <span className="badge badge-success text-white">Present</span>
                                                ) : (
                                                    <span className="badge badge-error text-white">Absent</span>
                                                )}
                                            </td>
                                            <td>{result.present ? result.studentMarks : 'N/A'}</td>
                                            <td>
                                                {result.present ? (
                                                    result.studentMarks !== null && result.studentMarks >= result.passingMarks ? (
                                                        <span className="badge badge-success text-white">Pass</span>
                                                    ) : (
                                                        <span className="badge badge-error text-white">Fail</span>
                                                    )
                                                ) : (
                                                    'N/A'
                                                )}
                                            </td>
                                            <td>{result.present && result.grade ? result.grade : 'N/A'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : userType === 'teacher' && allStudentResults.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="table w-full">
                                <thead>
                                    <tr className="text-base-content">
                                        <th className="text-base-content">Student Name</th>
                                        <th className="text-base-content">Exam Date</th>
                                        <th className="text-base-content">Subject</th>
                                        <th className="text-base-content">Total Marks</th>
                                        <th className="text-base-content">Status</th>
                                        <th className="text-base-content">Marks Obtained</th>
                                        <th className="text-base-content">Result</th>
                                        <th className="text-base-content">Grade</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {allStudentResults.flatMap((resultSet) => 
                                        resultSet.results.map((studentResult: any, index: number) => (
                                            <tr key={`${resultSet._id}-${studentResult._id}`} className="text-base-content">
                                                <td>{studentResult.studentId.firstName + " " + studentResult.studentId.lastName}</td>
                                                <td>{new Date(resultSet.examDate).toLocaleDateString()}</td>
                                                <td>{getSubjectName(resultSet.subjectId)}</td>
                                                <td>{resultSet.totalMarks}</td>
                                                <td>
                                                    {studentResult.present ? (
                                                        <span className="badge badge-success text-white">Present</span>
                                                    ) : (
                                                        <span className="badge badge-error text-white">Absent</span>
                                                    )}
                                                </td>
                                                <td>{studentResult.present ? studentResult.marks : 'N/A'}</td>
                                                <td>
                                                    {studentResult.present ? (
                                                        studentResult.marks >= resultSet.passingMarks ? (
                                                            <span className="badge badge-success text-white">Pass</span>
                                                        ) : (
                                                            <span className="badge badge-error text-white">Fail</span>
                                                        )
                                                    ) : (
                                                        'N/A'
                                                    )}
                                                </td>
                                                <td>{studentResult.present && studentResult.grade ? studentResult.grade : 'N/A'}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    ) : selectedStudentId && hasFetchedResults || 
                       (userType === 'teacher' && selectedSubjectId && hasFetchedResults) ? (
                        <div className="text-center my-8">
                            <p className="text-lg text-base-content">No results found for the selected criteria.</p>
                        </div>
                    ) : null}
                </div>
            </div>
        </div>
    );
};

export default ViewResults;
