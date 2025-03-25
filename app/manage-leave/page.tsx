'use client';

import React, { useEffect, useState } from 'react';
import { StudentMemberDTO } from '../api/dto/StudentMember';
import toast from 'react-hot-toast';

export default function ManageLeavePage() {
    const [subjects, setSubjects] = useState<{ _id: string, subject: string, class: string, section: string, courseId: { class: string, section: string } }[]>([]);
    const [students, setStudents] = useState<{ _id: string, name: string, status: string }[]>([]);
    const [selectedClassSection, setSelectedClassSection] = useState('');
    const [selectedSubject, setSelectedSubject] = useState('');
    const [attendanceDate, setAttendanceDate] = useState('');
    const [dateFieldTouched, setDateFieldTouched] = useState(false);
    const [classSections, setClassSections] = useState<{ id: string, label: string, classId: string, sectionId: string }[]>([]);
    const [isLoadingClassSections, setIsLoadingClassSections] = useState(false);
    const [isLoadingSubjects, setIsLoadingSubjects] = useState(false);
    const [isLoadingAttendance, setIsLoadingAttendance] = useState(false);
    const [attendanceRecords, setAttendanceRecords] = useState<any[]>([]);
    const [hasSearched, setHasSearched] = useState(false);
    const [staffInfo, setStaffInfo] = useState<{ firstName?: string, lastName?: string } | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editedStudents, setEditedStudents] = useState<{ _id: string, name: string, status: string }[]>([]);
    const [hasChanges, setHasChanges] = useState(false);

    // Fetch classes and sections and combine them
    useEffect(() => {
        const fetchClassesAndSections = async () => {
            try {
                setIsLoadingClassSections(true);
                
                const [classesResponse, sectionsResponse] = await Promise.all([
                    fetch('/api/classes'),
                    fetch('/api/sections')
                ]);

                if (!classesResponse.ok || !sectionsResponse.ok) {
                    throw new Error('Failed to fetch data');
                }

                const classesData = await classesResponse.json();
                const sectionsData = await sectionsResponse.json();

                // Create combined class-section options
                const combinedOptions: { id: string, label: string, classId: string, sectionId: string }[] = [];
                
                classesData.forEach((cls: any) => {
                    sectionsData.forEach((section: any) => {
                        combinedOptions.push({
                            id: `${cls._id}-${section._id}`,
                            label: `${cls.classNumber} ${section.section}`,
                            classId: cls._id,
                            sectionId: section._id
                        });
                    });
                });
                
                setClassSections(combinedOptions);
            } catch (error) {
                console.error('Error fetching classes and sections:', error);
                setClassSections([]);
            } finally {
                setIsLoadingClassSections(false);
            }
        };

        fetchClassesAndSections();
    }, []);

    // Fetch subjects when class-section is selected
    useEffect(() => {
        if (!selectedClassSection) {
            setSubjects([]);
            return;
        }

        const [classId, sectionId] = selectedClassSection.split('-');

        const fetchSubjects = async () => {
            try {
                setIsLoadingSubjects(true);
                const response = await fetch(`/api/manage-subject?classId=${classId}&sectionId=${sectionId}`);
                
                if (!response.ok) {
                    throw new Error('Failed to fetch subjects');
                }

                const subjectsData = await response.json();
                setSubjects(subjectsData);
            } catch (error) {
                console.error('Error fetching subjects:', error);
                setSubjects([]);
                toast.error('Failed to fetch subjects');
            } finally {
                setIsLoadingSubjects(false);
            }
        };

        fetchSubjects();
    }, [selectedClassSection]);

    // Handle class-section selection change
    const handleClassSectionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newClassSection = e.target.value;
        setSelectedClassSection(newClassSection);
        // Reset dependent fields
        setSelectedSubject('');
        setAttendanceRecords([]);
        setHasSearched(false);
    };

    // Handle subject selection change
    const handleSubjectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newSubject = e.target.value;
        setSelectedSubject(newSubject);
        setAttendanceRecords([]);
        setHasSearched(false);
    };

    // Fetch attendance records
    const fetchAttendance = async () => {
        if (!selectedClassSection || !selectedSubject || !attendanceDate) {
            toast.error('Please select all required fields');
            return;
        }

        try {
            setIsLoadingAttendance(true);
            setHasSearched(true);
            
            const [classId, sectionId] = selectedClassSection.split('-');
            
            const response = await fetch(`/api/attendance?classId=${classId}&sectionId=${sectionId}&subjectId=${selectedSubject}&attendanceDate=${attendanceDate}`);
            
            if (!response.ok) {
                throw new Error('Failed to fetch attendance records');
            }
            
            const data = await response.json();
            
            if (data && data.length > 0) {
                // Process attendance data
                setAttendanceRecords(data);
                
                // Get student details for the attendance records
                const studentIds = data.flatMap((record: any) => 
                    record.studentAttendance.map((student: any) => student.studentId)
                );
                
                if (studentIds.length > 0) {
                    const studentsResponse = await fetch(`/api/manage-staff?role=STUDENT`);
                    if (!studentsResponse.ok) {
                        throw new Error('Failed to fetch student details');
                    }
                    
                    const studentsData = await studentsResponse.json();
                    
                    // Map student IDs to names and attendance status
                    const studentAttendance = data[0].studentAttendance.map((attendance: any) => {
                        const student = studentsData.find((s: any) => s._id === attendance.studentId);
                        return {
                            _id: attendance.studentId,
                            name: student ? `${student.firstName} ${student.lastName}` : '',
                            status: attendance.status
                        };
                    });
                    
                    setStudents(studentAttendance);
                    
                    // Fetch staff information if available
                    if (data[0].staffId) {
                        try {
                            const staffResponse = await fetch(`/api/manage-staff?id=${data[0].staffId}`);
                            if (staffResponse.ok) {
                                const staffData = await staffResponse.json();
                                setStaffInfo(staffData);
                            }
                        } catch (error) {
                            console.error('Error fetching staff details:', error);
                            setStaffInfo(null);
                        }
                    } else {
                        setStaffInfo(null);
                    }
                } else {
                    setStudents([]);
                    setStaffInfo(null);
                }
            } else {
                setAttendanceRecords([]);
                setStudents([]);
                setStaffInfo(null);
                toast.error('No attendance records found!');
            }
        } catch (error) {
            toast.error('Error fetching attendance records');
            setAttendanceRecords([]);
            setStudents([]);
            setStaffInfo(null);
        } finally {
            setIsLoadingAttendance(false);
        }
    };

    // Handle status change when editing
    const handleStatusChange = (studentId: string, newStatus: string) => {
        setEditedStudents(prev => 
            prev.map(student => 
                student._id === studentId ? {...student, status: newStatus} : student
            )
        );
        setHasChanges(true);
    };

    // Save updated attendance
    const saveAttendance = async () => {
        if (!selectedClassSection || !selectedSubject || !attendanceDate) {
            toast.error('Missing required information');
            return;
        }

        try {
            const attendanceRecord = attendanceRecords[0];
            
            // Create a complete updated attendance object
            const updatedAttendance = {
                ...attendanceRecord,
                studentAttendance: editedStudents.map(student => ({
                    studentId: student._id,
                    status: student.status
                }))
            };
            debugger;
            
            const response = await fetch(`/api/attendance?id=${attendanceRecord._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedAttendance),
            });
            
            if (!response.ok) {
                throw new Error('Failed to update attendance');
            }
            
            toast.success('Attendance updated successfully');
            setIsEditing(false);
            setStudents(editedStudents);
        } catch (error) {
            console.error('Error updating attendance:', error);
            toast.error('Failed to update attendance');
        }
    };

    // Toggle edit mode
    const toggleEditMode = () => {
        if (!isEditing) {
            // When entering edit mode, initialize editedStudents with current data
            setEditedStudents([...students]);
            setHasChanges(false);
        }
        setIsEditing(!isEditing);
    };

    return (
        <div className="flex flex-col w-full p-6 bg-base-100 min-h-screen">
            <div className="card bg-base-200 shadow-xl">
                <div className="card-body">
                    <h2 className="card-title text-2xl font-bold text-base-content mb-6">View Attendance Records</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                            />
                            {!attendanceDate && dateFieldTouched && (
                                <label className="label">
                                    <span className="label-text-alt text-warning">Please select a date</span>
                                </label>
                            )}
                        </div>

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
                                    disabled={isLoadingClassSections}
                                >
                                    <option value="">Select Class & Section</option>
                                    {classSections.map((cs) => (
                                        <option key={cs.id} value={cs.id} className="text-base-content bg-base-100">
                                            {cs.label}
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
                                    value={selectedSubject}
                                    onChange={handleSubjectChange}
                                    disabled={!selectedClassSection || isLoadingSubjects}
                                >
                                    <option value="">Select Subject</option>
                                    {subjects.map((subject) => (
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
                    </div>

                    <div className="flex justify-end mt-6">
                        <button
                            className="btn btn-primary"
                            onClick={fetchAttendance}
                            disabled={!selectedClassSection || !selectedSubject || !attendanceDate}
                        >
                            View Attendance
                        </button>
                    </div>

                    {/* Attendance Records Display */}
                    {isLoadingAttendance ? (
                        <div className="flex justify-center items-center mt-6 py-12">
                            <span className="loading loading-spinner loading-lg text-primary"></span>
                            <span className="ml-3 text-base-content">Loading attendance records...</span>
                        </div>
                    ) : (
                        hasSearched && (
                            <div className="mt-6">
                                <h2 className="text-xl font-semibold mb-4 text-base-content">
                                    {students.length > 0 
                                        ? `Attendance Records (${new Date(attendanceDate).toLocaleDateString('en-GB', {day: '2-digit', month: 'long', year: 'numeric'})})` 
                                        : 'No attendance records found!'}
                                </h2>
                                
                                {students.length > 0 && (
                                    <div className="overflow-x-auto flex-1">
                                        <div className="flex justify-between items-center mb-4">
                                            <div>
                                                {staffInfo && (
                                                    <p className="text-base-content">
                                                        <span className="font-semibold">Recorded by:</span> {staffInfo.firstName} {staffInfo.lastName}
                                                    </p>
                                                )}
                                            </div>
                                            {isEditing ? (
                                                <div className="flex gap-2">
                                                    <button 
                                                        className="btn btn-success"
                                                        onClick={saveAttendance}
                                                        disabled={!hasChanges}
                                                    >
                                                        Save Changes
                                                    </button>
                                                    <button 
                                                        className="btn btn-error"
                                                        onClick={() => setIsEditing(false)}
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            ) : (
                                                <button 
                                                    className="btn btn-primary"
                                                    onClick={toggleEditMode}
                                                >
                                                    Edit Attendance
                                                </button>
                                            )}
                                        </div>
                                        <div className="overflow-y-auto h-[calc(100vh-280px)]">
                                            <table className="table table-pin-rows">
                                                <thead className="sticky top-0 bg-base-300">
                                                    <tr>
                                                        <th className="text-base-content">Student Name</th>
                                                        <th className="text-base-content text-center">Status</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {(isEditing ? editedStudents : students).map((student) => (
                                                        <tr key={student._id} className="hover:bg-base-200">
                                                            <td className="text-base-content">{student.name}</td>
                                                            <td className="text-center">
                                                                {isEditing ? (
                                                                    <label className="cursor-pointer flex items-center justify-center">
                                                                        <input
                                                                            type="checkbox"
                                                                            className="checkbox checkbox-primary"
                                                                            checked={student.status === 'P'}
                                                                            onChange={() => handleStatusChange(student._id, student.status === 'P' ? 'A' : 'P')}
                                                                        />
                                                                        <span className="ml-2 text-base-content">
                                                                            {student.status === 'P' ?
                                                                                <span className="text-success">Present</span> :
                                                                                <span className="text-error">Absent</span>
                                                                            }
                                                                        </span>
                                                                    </label>
                                                                ) : (
                                                                    student.status === 'P' ? (
                                                                        <span className="badge badge-success text-white">Present</span>
                                                                    ) : (
                                                                        <span className="badge badge-error text-white">Absent</span>
                                                                    )
                                                                )}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )
                    )}
                </div>
            </div>
        </div>
    );
}