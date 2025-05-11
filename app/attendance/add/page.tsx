'use client';

import React, { useEffect, useState } from 'react';
import { StudentMemberDTO } from '../../api/dto/StudentMember';
import toast from 'react-hot-toast';
import { Button } from '@/app/components/ui/button';
import AcademicYearDropdown from '@/app/components/ui/academicYearDropdown';
import { ISession } from '@/app/api/models/session';

export default function AttendanceAddPage() {
    // State for classes and sections combined
    const [classSections, setClassSections] = useState<{
        classId: string,
        sectionId: string,
        display: string,
    }[]>([]);

    // State for subjects 
    const [subjects, setSubjects] = useState<{
        _id: string,
        subject: string
    }[]>([]);

    const [staff, setStaff] = useState<StudentMemberDTO[]>([]);
    const [students, setStudents] = useState<any[]>([]);

    const [selectedYear, setSelectedYear] = useState<ISession | null>(null);
    const [selectedClassSection, setSelectedClassSection] = useState('');
    const [selectedSubject, setSelectedSubject] = useState('');
    const [selectedStaff, setSelectedStaff] = useState('');
    const [attendanceDate, setAttendanceDate] = useState('');
    const [attendanceData, setAttendanceData] = useState([]);

    const [academicYears, setAcademicYears] = useState<ISession[]>([]);

    const [dateFieldTouched, setDateFieldTouched] = useState(false);

    const [isLoadingStaff, setIsLoadingStaff] = useState(false);
    const [isLoadingStudents, setIsLoadingStudents] = useState(false);
    const [isLoadingSubjects, setIsLoadingSubjects] = useState(false);
    const [isLoadingClassSections, setIsLoadingClassSections] = useState(false);
    const [isLoadingYears, setIsLoadingYears] = useState(false);
    const [selectedClassId, setSelectedClassId] = useState('');
    const [selectedSectionId, setSelectedSectionId] = useState('');
    const [userRole, setUserRole] = useState<string | null>(null);
    const [userId, setUserId] = useState<string | null>(null);

    // Fetch academic years on component mount
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
        }

        const fetchData = async () => {
            try {
                if (userId && userRole != 'STUDENT') {
                    setIsLoadingStaff(true);
                    setIsLoadingClassSections(true);
                    setIsLoadingYears(true);
                    const [classesResponse, sectionsResponse, sessionResponse, staffResponse] = await Promise.all([
                        fetch(`/api/classes`),
                        fetch(`/api/sections`),
                        fetch('/api/session'),
                        fetch(`/api/manage-staff?role=STAFF`)
                    ]);

                    if (!classesResponse.ok || !sectionsResponse.ok || !sessionResponse.ok || !staffResponse.ok) {
                        throw new Error('Failed to fetch data');
                    }

                    const classesData = await classesResponse.json();
                    const sessionData = await sessionResponse.json();
                    const staffData = await staffResponse.json();
                    const sectionsData = await sectionsResponse.json();

                    setAcademicYears(sessionData);
                    setStaff(staffData);
                    setSelectedStaff(userId);                    

                    let allClassSections: { classId: string; sectionId: string; display: string; }[] = [];

                    for (const classItem of classesData) {

                        // Create combined class-section entries
                        const classSectionsForClass = sectionsData.map((section: any) => ({
                            classId: classItem._id,
                            sectionId: section._id,
                            display: `${classItem.classNumber} ${section.section}`
                        }));

                        allClassSections = [...allClassSections, ...classSectionsForClass];
                    }
                    setClassSections(allClassSections);

                    // Set default academic year
                    if (sessionData.length > 0) {
                        // Get current date
                        const currentDate = new Date();

                        // Find academic year containing current date
                        const currentAcademicYear = sessionData.find((year: any) => {
                            const startDate = new Date(year.startDate);
                            const endDate = new Date(year.endDate);
                            return currentDate >= startDate && currentDate <= endDate;
                        });

                        if (currentAcademicYear) {
                            // Set the academic year that contains the current date
                            setSelectedYear(currentAcademicYear);
                        } else {
                            // Fallback: Sort by startDate in descending order and use the most recent
                            const sortedYears = [...sessionData].sort((a, b) =>
                                new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
                            );
                            setSelectedYear(sortedYears[0]);
                        }
                    }

                }
            } catch (error) {
                console.error('Error fetching academic years:', error);
            } finally {
                setIsLoadingYears(false);
                setIsLoadingClassSections(false);
                setIsLoadingStaff(false);
            }
        };

        fetchData();
    }, [userRole, userId]);

    // Fetch students when class and section are selected
    useEffect(() => {
        if (!selectedClassId || !selectedSectionId) {
            setStudents([]);
            setAttendanceData([]);
            return;
        }

        const fetchSubjects = async () => {
            try {
                setIsLoadingSubjects(true);
                const response = await fetch(`/api/manage-subject?classId=${selectedClassId}&sectionId=${selectedSectionId}`);

                if (!response.ok) {
                    throw new Error('Failed to fetch subjects');
                }

                const data = await response.json();
                setSubjects(data);
            } catch (error) {
                console.error('Error fetching subjects:', error);
            } finally {
                setIsLoadingSubjects(false);
            }
        }

        const fetchStudents = async () => {
            try {
                setIsLoadingStudents(true);
                const response = await fetch(`/api/student-class?classId=${selectedClassId}&sectionId=${selectedSectionId}`);

                if (!response.ok) {
                    throw new Error('Failed to fetch students');
                }

                const data = await response.json();
                setStudents(data);

                const initialAttendance = data.map((student: any) => ({
                    studentId: student.studentId._id,
                    name: student.studentId.firstName + " " + student.studentId.lastName,
                    present: true
                }));

                setAttendanceData(initialAttendance);
            } catch (error) {
                console.error('Error fetching students:', error);
                setStudents([]);
                setAttendanceData([]);
            } finally {
                setIsLoadingStudents(false);
            }
        };

        fetchStudents();
        fetchSubjects();
    }, [selectedClassId, selectedSectionId]);

    // Handle attendance toggle
    const handleAttendanceChange = (studentId: string) => {
        setAttendanceData((prev: any) =>
            prev.map((item: any) =>
                item.studentId === studentId
                    ? { ...item, present: !item.present }
                    : item
            )
        );
    };

    // Submit attendance
    const submitAttendance = async () => {
        if (!attendanceDate) {
            toast.error('Please select a date for attendance');
            return;
        }

        if (!selectedStaff || selectedStaff === '') {
            toast.error('Please select a staff member');
            return;
        }

        try {
            // Check if attendance already exists
            const checkResponse = await fetch(`/api/attendance?attendanceDate=${attendanceDate}&subjectId=${selectedSubject}&classId=${selectedClassId}&sectionId=${selectedSectionId}`);
            const checkData = await checkResponse.json();

            if (checkData.length > 0) {
                toast.error('Attendance already recorded. Please select a different date, subject, class or section.');
                return;
            }

            // Format student attendance data
            const formattedStudentAttendance = attendanceData.map((student: any) => ({
                studentId: student.studentId,
                status: student.present ? "P" : "A"
            }));

            // Create the payload
            const payload = {
                academicYearId: selectedYear?._id,
                subjectId: selectedSubject,
                staffId: selectedStaff,
                attendanceDate: attendanceDate,
                studentAttendance: formattedStudentAttendance,
                sectionId: selectedSectionId,
                classId: selectedClassId
            };

            // Submit attendance
            const response = await fetch('/api/attendance', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                toast.success('Attendance submitted successfully');
                // Reset form
                setSelectedSubject('');
                setSelectedStaff('');
                setAttendanceDate('');
                setAttendanceData([]);
                setStudents([]);
            } else {
                const errorData = await response.json().catch(() => ({}));
                toast.error('Failed to submit attendance: ' + (errorData.message || 'Unknown error'));
            }
        } catch (error) {
            console.error('Error submitting attendance:', error);
            toast.error('Error submitting attendance');
        }
    };

    // Handle class-section selection change
    const handleClassSectionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        setSelectedClassSection(value);

        // Parse the selected class-section to get classId and sectionId
        if (value) {
            const [classId, sectionId] = value.split('|');
            setSelectedClassId(classId);
            setSelectedSectionId(sectionId);
        } else {
            setSelectedClassId('');
            setSelectedSectionId('');
        }

        // Reset dependent fields
        setSelectedSubject('');
    };

    // Handle subject selection change
    const handleSubjectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedSubjectId = e.target.value;
        setSelectedSubject(selectedSubjectId);
        // Reset staff selection
    };

    // Handle staff selection change
    const handleStaffChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newStaff = e.target.value;
        setSelectedStaff(newStaff);
        // Only reset the date
    };

    const handleYearChange = (yearId: ISession): void => {
        setSelectedYear(yearId);
    }

    return (
        <div className="flex flex-col w-full p-6 bg-base-100 min-h-screen">
            <div className="card bg-base-200 shadow-xl">
                <div className="card-body">
                    <div className="mb-6 flex justify-between items-center">
                        <h2 className="card-title text-2xl font-bold text-base-content">Take Attendance</h2>

                        {/* Academic Year Dropdown positioned at the right */}
                        <div className="flex items-center">
                            <AcademicYearDropdown
                                academicYears={academicYears}
                                selectedYearId={selectedYear}
                                onYearChange={handleYearChange}
                                isLoading={isLoadingYears}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Class-Section Selection */}
                        <div className="form-control w-full">
                            <label className="label">
                                <span className="label-text text-base-content">Class & Section</span>
                            </label>
                            <div className="relative">
                                <select
                                    className="select select-bordered w-full bg-base-100 text-base-content"
                                    value={selectedClassSection}
                                    onChange={handleClassSectionChange}
                                    disabled={!selectedYear || isLoadingClassSections}
                                >
                                    <option value="">Select Class & Section</option>
                                    {classSections.map((cs) => (
                                        <option
                                            key={`${cs.classId}-${cs.sectionId}`}
                                            value={`${cs.classId}|${cs.sectionId}`}
                                            className="text-base-content bg-base-100"
                                        >
                                            {cs.display}
                                        </option>
                                    ))}
                                </select>
                                {isLoadingClassSections && (
                                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                        <span className="loading loading-spinner loading-sm text-primary"></span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Subject Selection */}
                        <div className="form-control w-full">
                            <label className="label">
                                <span className="label-text text-base-content">Subject</span>
                            </label>
                            <div className="relative">
                                <select
                                    className="select select-bordered w-full bg-base-100 text-base-content"
                                    value={selectedSubject || ''}
                                    onChange={handleSubjectChange}
                                    disabled={!selectedClassId || !selectedSectionId || isLoadingSubjects}
                                >
                                    <option value="">Select Subject</option>
                                    {subjects.map((subject) => (
                                        <option
                                            key={subject._id}
                                            value={subject._id}
                                            className="text-base-content bg-base-100"
                                        >
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

                        {/* Staff Selection */}
                        <div className="form-control w-full">
                            <label className="label">
                                <span className="label-text text-base-content">Staff</span>
                            </label>
                            <div className="relative">
                                <select
                                    className="select select-bordered w-full bg-base-100 text-base-content"
                                    value={selectedStaff}
                                    onChange={handleStaffChange}
                                    disabled={isLoadingStaff}
                                >
                                    <option value="">Select Staff</option>
                                    {staff.map((person: any) => (
                                        <option key={person._id} value={person._id} className="text-base-content bg-base-100">
                                            {person.firstName} {person.lastName}
                                        </option>
                                    ))}
                                </select>
                                {isLoadingStaff && (
                                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                        <span className="loading loading-spinner loading-sm text-primary"></span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Date Selection */}
                        <div className="form-control w-full">
                            <label className="label">
                                <span className="label-text text-base-content">Attendance Date</span>
                            </label>
                            <input
                                type="date"
                                className="input input-bordered w-full bg-base-100 text-base-content"
                                value={attendanceDate}
                                onChange={(e) => {
                                    setAttendanceDate(e.target.value);
                                    setDateFieldTouched(true);
                                }}
                                onFocus={() => setDateFieldTouched(true)}
                                min={academicYears.find(year => year._id === selectedYear?._id)?.startDate.split('T')[0] || ''}
                                max={academicYears.find(year => year._id === selectedYear?._id)?.endDate.split('T')[0] || ''}
                                disabled={!selectedYear || !selectedStaff}
                            />
                            {!attendanceDate && dateFieldTouched && (
                                <label className="label">
                                    <span className="label-text-alt text-warning">Please select a date within the academic year</span>
                                </label>
                            )}
                        </div>
                    </div>

                    {/* Student Attendance List */}
                    {isLoadingStudents ? (
                        <div className="mt-6 py-12">
                            <div className="overflow-x-auto">
                                <table className="table w-full">
                                    <thead>
                                        <tr>
                                            <th className="bg-base-200 text-base-content">Name</th>
                                            <th className="bg-base-200 text-base-content text-center">Attendance</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td colSpan={2} className="text-center py-8">
                                                <div className="flex flex-col items-center gap-2">
                                                    <span className="loading loading-spinner loading-lg text-primary"></span>
                                                    <p className="text-base-content">Loading students...</p>
                                                </div>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ) : (
                        students.length > 0 && (
                            <div className="mt-6">
                                <h2 className="text-xl font-semibold mb-4 text-base-content">Student Attendance</h2>
                                <div className="overflow-x-auto">
                                    <table className="table w-full">
                                        <thead>
                                            <tr>
                                                <th className="bg-base-200 text-base-content">Name</th>
                                                <th className="bg-base-200 text-base-content text-center">Attendance</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {attendanceData.length > 0 ? (
                                                attendanceData.map((student: any) => (
                                                    <tr key={student.studentId} className="hover">
                                                        <td className="text-base-content">{student.name}</td>
                                                        <td className="text-center">
                                                            <label className="cursor-pointer flex items-center justify-center">
                                                                <input
                                                                    type="checkbox"
                                                                    className="checkbox checkbox-primary"
                                                                    checked={student.present}
                                                                    onChange={() => handleAttendanceChange(student.studentId)}
                                                                />
                                                                <span className="ml-2 text-base-content">
                                                                    {student.present ?
                                                                        <span className="text-success">Present</span> :
                                                                        <span className="text-error">Absent</span>
                                                                    }
                                                                </span>
                                                            </label>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan={2} className="text-center py-8">
                                                        <p className="text-base-content">No students found</p>
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>

                                <div className="flex justify-end mt-6">
                                    <Button
                                        variant="primary"
                                        outline
                                        onClick={submitAttendance}
                                        disabled={
                                            !selectedYear || 
                                            !selectedClassId || 
                                            !selectedSectionId || 
                                            !selectedSubject || 
                                            !selectedStaff || 
                                            !attendanceDate || 
                                            students.length === 0
                                        }
                                    >
                                        Submit Attendance
                                    </Button>
                                </div>
                            </div>
                        )
                    )}
                </div>
            </div>
        </div>
    );
}