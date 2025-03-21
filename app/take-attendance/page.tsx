'use client';

import React, { useEffect, useState } from 'react';
import { StudentMemberDTO } from '../api/dto/StudentMember';

export default function TakeAttendancePage() {
    const [subjects, setSubjects] = useState<{ _id: string, subject: string, class: string, section: string, courseId: { class: string, section: string }, staffIds: StudentMemberDTO[] }[]>([]);
    const [staff, setStaff] = useState<StudentMemberDTO[]>([]);
    const [students, setStudents] = useState<{ _id: string, name: string }[]>([]);
    const [selectedYear, setSelectedYear] = useState('');
    const [selectedSubject, setSelectedSubject] = useState('');
    const [selectedStaff, setSelectedStaff] = useState('');
    const [attendanceDate, setAttendanceDate] = useState('');
    const [attendanceData, setAttendanceData] = useState([]);
    const [academicYears, setAcademicYears] = useState<{ id: string, label: string, startDate: string, endDate: string }[]>([]);
    const [dateFieldTouched, setDateFieldTouched] = useState(false);
    const studentRole = "STUDENT";
    const [isLoadingStaff, setIsLoadingStaff] = useState(false);
    const [isLoadingStudents, setIsLoadingStudents] = useState(false);
    const [isLoadingSubjects, setIsLoadingSubjects] = useState(false);

    // Fetch academic years on component mount
    useEffect(() => {
        const fetchAcademicYears = async () => {
            try {
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
                } else {
                    setAcademicYears([]);
                }
            } catch (error) {
                console.error('Error fetching academic years:', error);
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
                const sectionsData = await sectionsResponse.json();

                const processedSubjects = subjectsData.map((subject: any) => {
                    const courseData = classesData.find((cls: any) => cls._id === subject.courseId.class);
                    const sectionData = sectionsData.find((sec: any) => sec._id === subject.courseId.section);

                    return {
                        ...subject,
                        class: courseData ? courseData.classNumber : '',
                        section: sectionData ? sectionData.section : ''
                    };
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
            return;
        }

        debugger;
        const fetchStaff = async () => {
            try {
                setIsLoadingStaff(true);
                const staffSubjectList = subjects.find(subject => subject._id === selectedSubject);
                debugger;
                setStaff(staffSubjectList?.staffIds || []);
            } catch (error) {
                console.error('Error fetching staff:', error);
            } finally {
                setIsLoadingStaff(false);
            }
        };

        fetchStaff();
    }, [selectedSubject]);

    // Fetch students when subject is selected (not dependent on staff)
    useEffect(() => {
        if (!selectedSubject) {
            setStudents([]);
            return;
        }

        const fetchStudents = async () => {
            try {
                setIsLoadingStudents(true);
                const subjectDetails = subjects.find(subject => subject._id === selectedSubject);

                if (!subjectDetails) {
                    throw new Error('Selected subject details not found');
                }

                const studentClassesResponse = await fetch(`/api/student-class?classId=${subjectDetails.courseId.class}&sectionId=${subjectDetails.courseId.section}`);
                if (!studentClassesResponse.ok) {
                    throw new Error('Failed to fetch student classes');
                }
                const studentClassesData = await studentClassesResponse.json();

                const studentIds = studentClassesData.map((studentClass: any) => studentClass.studentId);

                const studentsResponse = await fetch(`/api/manage-staff?role=${studentRole}`);
                if (!studentsResponse.ok) {
                    throw new Error('Failed to fetch students');
                }
                const studentsData = await studentsResponse.json();

                const filteredStudents = studentsData.filter((student: any) => studentIds.includes(student._id));

                const initialAttendance = filteredStudents.map((student: any) => ({
                    studentId: student._id,
                    name: student.firstName + " " + student.lastName,
                    present: true
                }));

                setStudents(filteredStudents);
                setAttendanceData(initialAttendance);
            } catch (error) {
                console.error('Error fetching students:', error);
                setStudents([]);
            } finally {
                setIsLoadingStudents(false);
            }
        };

        fetchStudents();
    }, [selectedSubject, subjects, studentRole]); // Only depend on subject, not staff

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
            alert('Please select a date for attendance');
            return;
        }

        try {
            // Replace with your actual API endpoint
            const response = await fetch('/api/attendance', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    academicYear: selectedYear,
                    subject: selectedSubject,
                    staff: selectedStaff,
                    date: attendanceDate,
                    attendance: attendanceData
                }),
            });

            if (response.ok) {
                alert('Attendance submitted successfully');
                // Reset form or redirect as needed
            } else {
                alert('Failed to submit attendance');
            }
        } catch (error) {
            console.error('Error submitting attendance:', error);
            alert('Error submitting attendance');
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
        setStaff([]);
    };

    // Handle subject selection change
    const handleSubjectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newSubject = e.target.value;
        setSelectedSubject(newSubject);
        // Reset dependent fields
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
        // Don't reset student data when staff changes
        // setAttendanceData([]);
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
                            <div className="flex gap-2">
                                <select
                                    className="select select-bordered flex-1 bg-base-100 text-base-content"
                                    value={selectedYear}
                                    onChange={handleYearChange}
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
                                    value={selectedSubject}
                                    onChange={handleSubjectChange}
                                    disabled={!selectedYear || isLoadingSubjects}
                                >
                                    <option value="">Select Subject</option>
                                    {subjects.map((subject: any) => (
                                        <option key={subject._id} value={subject._id} className="text-base-content bg-base-100">
                                            {subject.subject} - {subject.class} {subject.section}
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
                                    <button
                                        className="btn btn-primary"
                                        onClick={submitAttendance}
                                    >
                                        Submit Attendance
                                    </button>
                                </div>
                            </div>
                        )
                    )}
                </div>
            </div>
        </div>
    );
}