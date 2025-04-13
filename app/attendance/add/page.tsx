'use client';

import React, { useEffect, useState } from 'react';
import { StudentMemberDTO } from '../../api/dto/StudentMember';
import toast from 'react-hot-toast';
import { log } from 'console';
import { Button } from '@/app/components/ui/button';

export default function AttendanceAddPage() {
    const [subjects, setSubjects] = useState<{
        _id: string,
        subject: string,
        class: string,
        section: string,
        sectionIds: { section: string, _id: string }[],
        courseId: { class: string, section: string },
        staffIds: StudentMemberDTO[],
        displayName: string,
        uniqueId: string
    }[]>([]);
    const [staff, setStaff] = useState<StudentMemberDTO[]>([]);
    const [students, setStudents] = useState<any[]>([]);
    const [selectedYear, setSelectedYear] = useState('');
    const [selectedSubject, setSelectedSubject] = useState('');
    const [selectedStaff, setSelectedStaff] = useState('');
    const [attendanceDate, setAttendanceDate] = useState('');
    const [attendanceData, setAttendanceData] = useState([]);
    const [academicYears, setAcademicYears] = useState<{ id: string, label: string, startDate: string, endDate: string }[]>([]);
    const [dateFieldTouched, setDateFieldTouched] = useState(false);
    const [isLoadingStaff, setIsLoadingStaff] = useState(false);
    const [isLoadingStudents, setIsLoadingStudents] = useState(false);
    const [isLoadingSubjects, setIsLoadingSubjects] = useState(false);
    const [isLoadingYears, setIsLoadingYears] = useState(false);
    const [selectedClassId, setSelectedClassId] = useState('');
    const [selectedSectionId, setSelectedSectionId] = useState('');

    // Fetch academic years on component mount
    useEffect(() => {
        const fetchAcademicYears = async () => {
            try {
                setIsLoadingYears(true);
                // Replace with your actual API endpoint
                const response = await fetch('/api/session');
                const data = await response.json();
                if (response.ok) {
                    const formattedYears = data.map((year: any) => {
                        const startDate = new Date(year.startDate);
                        const endDate = new Date(year.endDate);
                        return {
                            id: year._id,
                            label: `${startDate.toLocaleString('default', { month: 'short' })} ${startDate.getFullYear()} - ${endDate.toLocaleString('default', { month: 'short' })} ${endDate.getFullYear()}`,
                            startDate: year.startDate,
                            endDate: year.endDate
                        };
                    });
                    setAcademicYears(formattedYears);
                    
                    // Set default academic year
                    if (formattedYears.length > 0) {
                        // Get current date
                        const currentDate = new Date();
                        
                        // Find academic year containing current date
                        const currentAcademicYear = formattedYears.find((year: any) => {
                            const startDate = new Date(year.startDate);
                            const endDate = new Date(year.endDate);
                            return currentDate >= startDate && currentDate <= endDate;
                        });
                        
                        if (currentAcademicYear) {
                            // Set the academic year that contains the current date
                            setSelectedYear(currentAcademicYear.id);
                        } else {
                            // Fallback: Sort by startDate in descending order and use the most recent
                            const sortedYears = [...formattedYears].sort((a, b) =>
                                new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
                            );
                            setSelectedYear(sortedYears[0].id);
                        }
                    }
                } else {
                    setAcademicYears([]);
                }
            } catch (error) {
                console.error('Error fetching academic years:', error);
            } finally {
                setIsLoadingYears(false);
            }
        };

        fetchAcademicYears();
    }, []);

    useEffect(() => {
        if (!selectedYear) {
            setSubjects([]);
            return;
        }

        const fetchData = async () => {
            try {
                setIsLoadingSubjects(true);
                const [subjectsResponse, classesResponse, sectionsResponse] = await Promise.all([
                    fetch(`/api/manage-subject?academicYear=${selectedYear}`),
                    fetch('/api/classes'),
                    fetch('/api/sections')
                ]);

                if (!subjectsResponse.ok || !classesResponse.ok || !sectionsResponse.ok) {
                    throw new Error('Failed to fetch data');
                }

                const subjectsData = await subjectsResponse.json();
                const classesData = await classesResponse.json();

                let processedSubjects = subjectsData.flatMap((subject: any) => {
                    // Find the class details from classesData using courseId.class
                    const classDetails = classesData.find((cls: any) => cls._id === subject.courseId.class);
                    const className = classDetails?.name || classDetails?.classNumber || '';

                    // Create separate entries for each section
                    return subject.sectionIds
                        .filter((section: any) => section.isActive)
                        .map((section: any) => ({
                            _id: subject._id,
                            subject: subject.subject,
                            courseId: subject.courseId,
                            sectionIds: subject.sectionIds,
                            class: className,
                            section: section.section,
                            staffIds: subject.staffIds,
                            displayName: `${subject.subject} ${className} ${section.section}`,
                            uniqueId: `${subject._id}-${section._id}`
                        }));
                });

                setSubjects(processedSubjects);
            } catch (error) {
                console.error('Error fetching data:', error);
                setSubjects([]);
            } finally {
                setIsLoadingSubjects(false);
            }
        };

        fetchData();
    }, [selectedYear]);

    useEffect(() => {
        if (!selectedSubject) {
            setStaff([]);
            setSelectedStaff('');
            return;
        }

        const fetchStaff = async () => {
            try {
                setIsLoadingStaff(true);
                const staffSubjectList = subjects.find(subject => subject.uniqueId === selectedSubject);
                const staffMembers = staffSubjectList?.staffIds || [];
                setStaff(staffMembers);
            } catch (error) {
                console.error('Error fetching staff:', error);
                setStaff([]);
                setSelectedStaff('');
            } finally {
                setIsLoadingStaff(false);
            }
        };

        fetchStaff();
    }, [selectedSubject, subjects]);

    // Fetch students when subject is selected (not dependent on staff)
    useEffect(() => {
        if (!selectedSubject) {
            setStudents([]);
            return;
        }

        const fetchStudents = async () => {
            try {
                setIsLoadingStudents(true);
                const subjectDetails = subjects.find(subject => subject.uniqueId === selectedSubject);

                if (!subjectDetails) {
                    throw new Error('Selected subject details not found');
                }

                // Get the section ID from the subject details
                const sectionId = subjectDetails.sectionIds?.find(s => s.section === subjectDetails.section)?._id || '';

                const studentClassesResponse = await fetch(`/api/student-class?classId=${subjectDetails.courseId.class}&sectionId=${sectionId}`);
                if (!studentClassesResponse.ok) {
                    throw new Error('Failed to fetch student classes');
                }
                const studentClassesData = await studentClassesResponse.json();

                const initialAttendance = studentClassesData.map((student: any) => ({
                    studentId: student.studentId._id,
                    name: student.studentId.firstName + " " + student.studentId.lastName,
                    present: true
                }));

                setStudents(studentClassesData);
                setAttendanceData(initialAttendance);
            } catch (error) {
                console.error('Error fetching students:', error);
                setStudents([]);
            } finally {
                setIsLoadingStudents(false);
            }
        };

        fetchStudents();
    }, [selectedSubject, subjects]);

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
            const subjectDetails = subjects.find(subject => subject.uniqueId === selectedSubject);

            // Check if attendance already exists for this date, subject, class and section
            const checkResponse = await fetch(`/api/attendance?attendanceDate=${attendanceDate}&subjectId=${subjectDetails?._id}&classId=${selectedClassId}&sectionId=${selectedSectionId}`);
            const checkData = await checkResponse.json();

            if (checkData.length > 0) {
                toast.error('Attendance already recorded. Please select a different date, subject, class or section.');
                return;
            }

            // Format student attendance data according to the schema
            const formattedStudentAttendance = attendanceData.map((student: any) => ({
                studentId: student.studentId,
                status: student.present ? "P" : "A"
            }));

            // Create the payload with the correct format
            const payload = {
                academicYearId: selectedYear,
                subjectId: subjectDetails?._id,
                staffId: selectedStaff,
                attendanceDate: attendanceDate,
                studentAttendance: formattedStudentAttendance,
                sectionId: selectedSectionId,
                classId: selectedClassId
            };

            // Replace with your actual API endpoint
            const response = await fetch('/api/attendance', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                toast.success('Attendance submitted successfully');
                // Reset all form fields
                setSelectedYear('');
                setSelectedSubject('');
                setSelectedStaff('');
                setAttendanceDate('');
                setAttendanceData([]);
                setStudents([]);
                setSubjects([]);
                setStaff([]);
                setSelectedClassId('');
                setSelectedSectionId('');
                setDateFieldTouched(false);
            } else {
                const errorData = await response.json().catch(() => ({}));
                console.error('Server error:', errorData);
                toast.error('Failed to submit attendance: ' + (errorData.message || 'Unknown error'));
            }
        } catch (error) {
            console.error('Error submitting attendance:', error);
            toast.error('Error submitting attendance');
        }
    };

    // Handle year selection change
    const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newYear = e.target.value;
        setSelectedYear(newYear);
        // Reset dependent fields
        setSelectedSubject('');
        setSelectedStaff('');
        setAttendanceDate('');
        setAttendanceData([]);
        setStudents([]);
    };

    // Handle subject selection change
    const handleSubjectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedUniqueId = e.target.value;
        const subject = subjects.find(s => s.uniqueId === selectedUniqueId);

        // Get the section ID that matches the selected section
        const sectionId = subject?.sectionIds.find(s => s.section === subject.section)?._id || '';
        const classId = subject?.courseId.class || '';
        setSelectedSubject(selectedUniqueId); // Store uniqueId instead of _id
        setSelectedSectionId(sectionId);
        setSelectedClassId(classId);
        setSelectedStaff('');
        setAttendanceDate('');
        setAttendanceData([]);
        setStudents([]);
    };

    // Handle staff selection change
    const handleStaffChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newStaff = e.target.value;
        setSelectedStaff(newStaff);
        // Only reset the date, but keep the student data
        setAttendanceDate('');
    };

    return (
        <div className="flex flex-col w-full p-6 bg-base-100 min-h-screen">
            <div className="card bg-base-200 shadow-xl">
                <div className="card-body">
                    <h2 className="card-title text-2xl font-bold text-base-content mb-6">Take Attendance</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Academic Year Selection */}
                        <div className="form-control w-full">
                            <label className="label">
                                <span className="label-text text-base-content">Academic Year</span>
                            </label>
                            <div className="flex gap-2 relative">
                                <select
                                    className="select select-bordered flex-1 bg-base-100 text-base-content"
                                    value={selectedYear}
                                    onChange={handleYearChange}
                                    disabled={isLoadingYears}
                                >
                                    <option value="">Select academic year</option>
                                    {academicYears.map((year) => (
                                        <option
                                            key={year.id}
                                            value={year.id}
                                            className="text-base-content bg-base-100"
                                        >
                                            {year.label}
                                        </option>
                                    ))}
                                </select>
                                {isLoadingYears && (
                                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                        <span className="loading loading-spinner loading-sm text-primary"></span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Subject Selection */}
                        <div className="form-control w-full">
                            <label className="label">
                                <span className="label-text text-base-content">Subject (Class & Section)</span>
                            </label>
                            <div className="relative">
                                <select
                                    className="select select-bordered w-full bg-base-100 text-base-content"
                                    value={selectedSubject || ''}
                                    onChange={handleSubjectChange}
                                    disabled={!selectedYear || isLoadingSubjects}
                                >
                                    <option value="">Select Subject</option>
                                    {subjects.map((subject) => (
                                        <option
                                            key={subject.uniqueId}
                                            value={subject.uniqueId}
                                            className="text-base-content bg-base-100"
                                        >
                                            {subject.displayName}
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
                                    disabled={!selectedSubject || isLoadingStaff}
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
                                min={selectedYear ? academicYears.find(year => year.id === selectedYear)?.startDate.split('T')[0] : ''}
                                max={selectedYear ? academicYears.find(year => year.id === selectedYear)?.endDate.split('T')[0] : ''}
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
                        <div className="flex justify-center items-center mt-6 py-12">
                            <span className="loading loading-spinner loading-lg text-primary"></span>
                            <span className="ml-3 text-base-content">Loading students...</span>
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
                                            {attendanceData.map((student: any) => (
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
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                <div className="flex justify-end mt-6">
                                    <Button
                                        variant="primary"
                                        outline
                                        onClick={submitAttendance}
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