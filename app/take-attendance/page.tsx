'use client';

import React, { useEffect, useState } from 'react';

export default function TakeAttendancePage() {
    // State for storing data
    // const [academicYears, setAcademicYears] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [staff, setStaff] = useState([]);
    const [students, setStudents] = useState([]);

    // Selected values
    const [selectedYear, setSelectedYear] = useState('');
    const [selectedSubject, setSelectedSubject] = useState('');
    const [selectedStaff, setSelectedStaff] = useState('');
    const [attendanceDate, setAttendanceDate] = useState('');
    const [attendanceData, setAttendanceData] = useState([]);
    const [academicYears, setAcademicYears] = useState<{ id: string, label: string, startDate: string, endDate: string }[]>([]);


    // Fetch academic years on component mount
    useEffect(() => {
        const fetchAcademicYears = async () => {
            try {
                // Replace with your actual API endpoint
                const response = await fetch('/api/session');
                const data = await response.json();
                // const academicYearsData = await academicYearsResponse.json();
                if (response.ok) {
                    // Format the academic years data to include month and year
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
                    // Dummy data for academic years
                    setAcademicYears([]);
                }
                // setAcademicYears(data);
            } catch (error) {
                console.error('Error fetching academic years:', error);
            }
        };

        fetchAcademicYears();
    }, []);

    // Fetch subjects when academic year is selected
    useEffect(() => {
        if (!selectedYear) {
            setSubjects([]);
            return;
        }

        const fetchSubjects = async () => {
            try {
                // Replace with your actual API endpoint
                const response = await fetch(`/api/manage-subject?academicYear=${selectedYear}`);
                const data = await response.json();
                setSubjects(data);
            } catch (error) {
                console.error('Error fetching subjects:', error);
            }
        };

        fetchSubjects();
    }, [selectedYear]);

    // Fetch staff when subject is selected
    useEffect(() => {
        if (!selectedSubject) {
            setStaff([]);
            return;
        }

        const fetchStaff = async () => {
            try {
                // Replace with your actual API endpoint
                const response = await fetch(`/api/manage-staff?subject=${selectedSubject}`);
                const data = await response.json();
                setStaff(data);
            } catch (error) {
                console.error('Error fetching staff:', error);
            }
        };

        fetchStaff();
    }, [selectedSubject]);

    // Fetch students when all selections are made
    useEffect(() => {
        if (!selectedYear || !selectedSubject || !selectedStaff) {
            setStudents([]);
            return;
        }

        const fetchStudents = async () => {
            try {
                // Replace with your actual API endpoint
                const response = await fetch(
                    `/api/manage-staff?academicYear=${selectedYear}&subject=${selectedSubject}`
                );
                const data = await response.json();

                // Initialize attendance data with default values
                const initialAttendance = data.map((student: any) => ({
                    studentId: student.id,
                    name: student.name,
                    present: true
                }));

                setStudents(data);
                setAttendanceData(initialAttendance);
            } catch (error) {
                console.error('Error fetching students:', error);
            }
        };

        fetchStudents();
    }, [selectedYear, selectedSubject, selectedStaff]);

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
                                    className={`select select-bordered flex-1 bg-base-100 text-base-content`}
                                >
                                    <option value="">Select academic year</option>
                                    {academicYears.map((year: any) => (
                                        <option
                                            key={year._id}
                                            value={year._id}
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
                            <select
                                className="select select-bordered w-full bg-base-100 text-base-content"
                                value={selectedSubject}
                                onChange={(e) => setSelectedSubject(e.target.value)}
                                disabled={!selectedYear}
                            >
                                <option value="">Select Subject</option>
                                {subjects.map((subject: any) => (
                                    <option key={subject.id} value={subject.id} className="text-base-content bg-base-100">
                                        {subject.name} - {subject.classSection}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Staff Selection */}
                        <div className="form-control w-full">
                            <label className="label">
                                <span className="label-text text-base-content">Staff</span>
                            </label>
                            <select
                                className="select select-bordered w-full bg-base-100 text-base-content"
                                value={selectedStaff}
                                onChange={(e) => setSelectedStaff(e.target.value)}
                                disabled={!selectedSubject}
                            >
                                <option value="">Select Staff</option>
                                {staff.map((person: any) => (
                                    <option key={person.id} value={person.id} className="text-base-content bg-base-100">
                                        {person.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Date Selection */}
                        <div className="form-control w-full">
                            <label className="label">
                                <span className="label-text text-base-content">Date</span>
                            </label>
                            <input
                                type="date"
                                className="input input-bordered w-full bg-base-100 text-base-content"
                                value={attendanceDate}
                                onChange={(e) => setAttendanceDate(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Student Attendance List */}
                    {students.length > 0 && (
                        <div className="mt-6">
                            <h2 className="text-xl font-semibold mb-4 text-base-content">Student Attendance</h2>
                            <div className="overflow-x-auto">
                                <table className="table w-full">
                                    <thead>
                                        <tr>
                                            {/* <th className="bg-base-200 text-base-content">Roll No</th> */}
                                            <th className="bg-base-200 text-base-content">Name</th>
                                            <th className="bg-base-200 text-base-content text-center">Attendance</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {attendanceData.map((student: any, index: number) => (
                                            <tr key={student.studentId} className="hover">
                                                {/* <td className="text-base-content">{students[index].rollNo}</td> */}
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
                    )}
                </div>
            </div>
        </div>
    );
}