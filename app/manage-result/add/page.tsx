'use client';

import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { z } from 'zod';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

export default function AddResultPage() {
    const [examDate, setExamDate] = useState('');
    const [classId, setClassId] = useState('');
    const [sectionId, setSectionId] = useState('');
    const [subjectId, setSubjectId] = useState('');
    const [subjectOptions, setSubjectOptions] = useState<{ _id: string, subject: string }[]>([]);
    const [staffs, setStaffs] = useState<{ _id: string, firstName: string, lastName: string }[]>([]);
    const [selectedStaffId, setSelectedStaffId] = useState('');
    const [totalMarks, setTotalMarks] = useState<number | null>(null);
    const [passingMarks, setPassingMarks] = useState<number | null>(null);
    const [students, setStudents] = useState<{ id: string, name: string }[]>([]);
    const [results, setResults] = useState<{ studentId: string, marks: number | null, present: boolean }[]>([]);
    const [classOptions, setClassOptions] = useState<{ _id: string, classNumber: number }[]>([]);
    const [sectionOptions, setSectionOptions] = useState<{ _id: string, section: string }[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    // Define Zod schema for form validation
    const resultFormSchema = z.object({
        examDate: z.string().nonempty("Exam date is required"),
        classId: z.string().nonempty("Class is required"),
        sectionId: z.string().nonempty("Section is required"),
        subjectId: z.string().nonempty("Subject is required"),
        selectedStaffId: z.string().nonempty("Teacher is required"),
        totalMarks: z.string().nonempty("Total marks is required").transform(val => parseInt(val)),
        passingMarks: z.string().nonempty("Passing marks is required").transform(val => parseInt(val))
    });

    type FormData = z.infer<typeof resultFormSchema>;

    const { register, handleSubmit, formState: { errors: formErrors }, setValue } = useForm<FormData>({
        resolver: zodResolver(resultFormSchema),
    });

    useEffect(() => {
        const fetchClassData = async () => {
            try {
                setIsLoading(true);
                const response = await fetch('/api/classes');
                if (!response.ok) {
                    throw new Error('Failed to fetch class data');
                }
                const classesData = await response.json();
                setClassOptions(classesData);
            } catch (error) {
                console.error('Error fetching class data:', error);
                toast.error('Failed to load class data');
            } finally {
                setIsLoading(false);
            }
        };

        fetchClassData();
    }, []);

    useEffect(() => {
        const fetchSectionData = async () => {
            try {
                setIsLoading(true);
                const response = await fetch('/api/sections');
                if (!response.ok) {
                    throw new Error('Failed to fetch section data');
                }
                const sectionsData = await response.json();
                setSectionOptions(sectionsData);
            } catch (error) {
                console.error('Error fetching section data:', error);
                toast.error('Failed to load section data');
            } finally {
                setIsLoading(false);
            }
        };

        fetchSectionData();
    }, []);

    useEffect(() => {
        if (classId && sectionId) {
            fetchSubjects();
            fetchStudents();
            setValue("classId", classId);
            setValue("sectionId", sectionId);
        } else {
            setSubjectOptions([]);
            setSubjectId('');
            setStudents([]);
        }
    }, [classId, sectionId, setValue]);

    const fetchSubjects = async () => {
        try {
            setIsLoading(true);
            const response = await fetch(`/api/manage-subject?classId=${classId}&sectionId=${sectionId}`);
            if (!response.ok) {
                throw new Error('Failed to fetch subjects');
            }
            const data = await response.json();
            console.log(data);
            setSubjectOptions(data);
        } catch (error) {
            console.error('Error fetching subjects:', error);
            toast.error('Failed to load subjects');
        } finally {
            setIsLoading(false);
        }
    };

    const fetchStudents = async () => {
        try {
            setIsLoading(true);
            const response = await fetch(`/api/student-class?classId=${classId}&sectionId=${sectionId}`);
            if (!response.ok) {
                throw new Error('Failed to fetch students');
            }
            const data = await response.json();

            // Transform the data to match the expected format
            const formattedStudents = data.map((item: { studentId: { _id: string; firstName: string; lastName: string } }) => ({
                id: item.studentId._id,
                name: `${item.studentId.firstName} ${item.studentId.lastName}`
            }));
            setStudents(formattedStudents);
        } catch (error) {
            console.error('Error fetching students:', error);
            toast.error('Failed to fetch students');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (subjectId) {
            fetchStaffs();
            setValue("subjectId", subjectId);
        } else {
            setStaffs([]);
        }
    }, [subjectId, setValue]);

    const fetchStaffs = async () => {
        try {
            setIsLoading(true);
            const response = await fetch(`/api/manage-subject?id=${subjectId}`);
            if (!response.ok) {
                throw new Error('Failed to fetch teachers');
            }
            const data = await response.json();
            console.log(data);

            // Extract staff information from the staffIds array
            if (data && data.staffIds && Array.isArray(data.staffIds)) {
                setStaffs(data.staffIds);
            } else {
                setStaffs([]);
            }
        } catch (error) {
            console.error('Error fetching teachers:', error);
            toast.error('Failed to load teacher information');
            setStaffs([]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleMarksChange = (studentId: string, marks: number | null) => {
        setResults((prevResults) => {
            const existingResult = prevResults.find(result => result.studentId === studentId);
            if (existingResult) {
                // Clear error when marks are added
                if (marks !== null) {
                    setErrors(prev => {
                        const newErrors = { ...prev };
                        delete newErrors[studentId];
                        return newErrors;
                    });
                }
                return prevResults.map(result =>
                    result.studentId === studentId ? { ...result, marks } : result
                );
            } else {
                return [...prevResults, { studentId, marks, present: true }];
            }
        });
    };

    const handleAttendanceChange = (studentId: string, present: boolean) => {
        setResults((prevResults) => {
            const existingResult = prevResults.find(result => result.studentId === studentId);

            // Clear error when attendance is marked
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[studentId];
                return newErrors;
            });

            if (existingResult) {
                // If marking as absent, clear the marks
                const marks = present ? existingResult.marks : null;

                return prevResults.map(result =>
                    result.studentId === studentId ? { ...result, present, marks } : result
                );
            } else {
                return [...prevResults, { studentId, marks: null, present }];
            }
        });
    };

    const handleTotalMarksChange = (value: string) => {
        const newTotalMarks = value ? parseInt(value) : null;
        setTotalMarks(newTotalMarks);
        setValue("totalMarks", value as unknown as number); // Type assertion to fix type error
        
        // Reset passing marks if it's greater than the new total marks or if total marks is cleared
        if (passingMarks !== null && (newTotalMarks === null || newTotalMarks < passingMarks)) {
            setPassingMarks(null);
            setValue("passingMarks", value as unknown as number); // Type assertion to fix type error

        }
    };

    const getPassingMarksOptions = () => {
        const options = [
            { value: 10, label: "10" },
            { value: 20, label: "20" },
            { value: 40, label: "40" }
        ];

        if (totalMarks === null) {
            return [];
        }

        return options.filter(option => option.value <= totalMarks);
    };

    const onSubmit: SubmitHandler<FormData> = async (data) => {
        // Validate student records
        const newErrors: { [key: string]: string } = {};
        let hasErrors = false;
        
        students.forEach(student => {
            const result = results.find(r => r.studentId === student.id);
            if (!result) {
                newErrors[student.id] = "Please mark attendance or enter marks";
                hasErrors = true;
            } else if (!result.present && result.marks === null) {
                newErrors[student.id] = "Please mark attendance or enter marks";
                hasErrors = true;
            }
        });
        
        setErrors(newErrors);
        
        if (hasErrors) {
            toast.error("Please complete all student records");
            return;
        }

        try {
            const response = await fetch('/api/results', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    examDate: data.examDate,
                    classId: data.classId,
                    sectionId: data.sectionId,
                    subjectId: data.subjectId,
                    staffId: data.selectedStaffId,
                    totalMarks: data.totalMarks,
                    passingMarks: data.passingMarks,
                    results,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to add results');
            }

            toast.success('Results added successfully');
        } catch (error) {
            console.error('Error adding results:', error);
            toast.error('Failed to add results');
        }
    };

    return (
        <div className="flex flex-col w-full p-6 bg-base-100 min-h-screen font-sans">
            <div className="card bg-base-200 shadow-xl">
                <div className="card-body">
                    <h2 className="card-title text-2xl font-bold text-base-content mb-6">Add Results</h2>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="form-control w-full">
                                <label className="label">
                                    <span className="label-text text-base-content">Exam Date</span>
                                </label>
                                <input
                                    type="date"
                                    className={`input input-bordered w-full bg-base-100 text-base-content ${formErrors.examDate ? 'input-error' : ''}`}
                                    {...register("examDate")}
                                    onChange={(e) => {
                                        setExamDate(e.target.value);
                                        setValue("examDate", e.target.value);
                                    }}
                                />
                                {formErrors.examDate && (
                                    <label className="label">
                                        <span className="label-text-alt text-error">{formErrors.examDate.message}</span>
                                    </label>
                                )}
                            </div>
                            <div className="form-control w-full">
                                <label className="label">
                                    <span className="label-text text-base-content">Class</span>
                                </label>
                                <select
                                    className={`select select-bordered w-full bg-base-100 text-base-content ${formErrors.classId ? 'select-error' : ''}`}
                                    {...register("classId")}
                                    onChange={(e) => {
                                        setClassId(e.target.value);
                                        setValue("classId", e.target.value);
                                    }}
                                    disabled={isLoading}
                                >
                                    <option value="">Select Class</option>
                                    {classOptions.map((option) => (
                                        <option key={option._id} value={option._id}>
                                            {option.classNumber}
                                        </option>
                                    ))}
                                </select>
                                {formErrors.classId && (
                                    <label className="label">
                                        <span className="label-text-alt text-error">{formErrors.classId.message}</span>
                                    </label>
                                )}
                            </div>
                            <div className="form-control w-full">
                                <label className="label">
                                    <span className="label-text text-base-content">Section</span>
                                </label>
                                <select
                                    className={`select select-bordered w-full bg-base-100 text-base-content ${formErrors.sectionId ? 'select-error' : ''}`}
                                    {...register("sectionId")}
                                    onChange={(e) => {
                                        setSectionId(e.target.value);
                                        setValue("sectionId", e.target.value);
                                    }}
                                    disabled={isLoading}
                                >
                                    <option value="" >Select Section</option>
                                    {sectionOptions.map((option) => (
                                        <option key={option._id} value={option._id}>
                                            {option.section}
                                        </option>
                                    ))}
                                </select>
                                {formErrors.sectionId && (
                                    <label className="label">
                                        <span className="label-text-alt text-error">{formErrors.sectionId.message}</span>
                                    </label>
                                )}
                            </div>
                            <div className="form-control w-full">
                                <label className="label">
                                    <span className="label-text text-base-content">Subject</span>
                                </label>
                                <select
                                    className={`select select-bordered w-full bg-base-100 text-base-content ${formErrors.subjectId ? 'select-error' : ''}`}
                                    {...register("subjectId")}
                                    onChange={(e) => {
                                        setSubjectId(e.target.value);
                                        setValue("subjectId", e.target.value);
                                    }}
                                    disabled={isLoading || !classId || !sectionId}
                                >
                                    <option value="">Select Subject</option>
                                    {subjectOptions.map((option) => (
                                        <option key={option._id} value={option._id}>
                                            {option.subject}
                                        </option>
                                    ))}
                                </select>
                                {formErrors.subjectId && (
                                    <label className="label">
                                        <span className="label-text-alt text-error">{formErrors.subjectId.message}</span>
                                    </label>
                                )}
                            </div>
                            <div className="form-control w-full">
                                <label className="label">
                                    <span className="label-text text-base-content">Teachers</span>
                                </label>
                                <select
                                    className={`select select-bordered w-full bg-base-100 text-base-content ${formErrors.selectedStaffId ? 'select-error' : ''}`}
                                    {...register("selectedStaffId")}
                                    onChange={(e) => {
                                        setSelectedStaffId(e.target.value);
                                        setValue("selectedStaffId", e.target.value);
                                    }}
                                    disabled={isLoading || staffs.length === 0}
                                >
                                    <option value="">Select Teacher</option>
                                    {staffs.map((staff) => (
                                        <option key={staff._id} value={staff._id}>
                                            {staff.firstName} {staff.lastName}
                                        </option>
                                    ))}
                                </select>
                                {formErrors.selectedStaffId && (
                                    <label className="label">
                                        <span className="label-text-alt text-error">{formErrors.selectedStaffId.message}</span>
                                    </label>
                                )}
                            </div>
                            <div className="form-control w-full">
                                <label className="label">
                                    <span className="label-text text-base-content">Total Marks</span>
                                </label>
                                <select
                                    className={`select select-bordered w-full bg-base-100 text-base-content ${formErrors.totalMarks ? 'select-error' : ''}`}
                                    {...register("totalMarks")}
                                    value={totalMarks?.toString() || ''}
                                    onChange={(e) => handleTotalMarksChange(e.target.value)}
                                >
                                    <option value="">Select Total Marks</option>
                                    <option value="25">25</option>
                                    <option value="50">50</option>
                                    <option value="100">100</option>
                                </select>
                                {formErrors.totalMarks && (
                                    <label className="label">
                                        <span className="label-text-alt text-error">{formErrors.totalMarks.message}</span>
                                    </label>
                                )}
                            </div>
                            <div className="form-control w-full">
                                <label className="label">
                                    <span className="label-text text-base-content">Passing Marks</span>
                                </label>
                                <select
                                    className={`select select-bordered w-full bg-base-100 text-base-content ${formErrors.passingMarks ? 'select-error' : ''}`}
                                    {...register("passingMarks")}
                                    value={passingMarks?.toString() || ''}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        setPassingMarks(value ? parseInt(value) : null);
                                        setValue("passingMarks", value as unknown as number); // Type assertion to fix type error
                                    }}
                                    disabled={totalMarks === null}
                                >
                                    <option value="">Select Passing Marks</option>
                                    {getPassingMarksOptions().map(option => (
                                        <option key={option.value} value={option.value.toString()}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                                {formErrors.passingMarks && (
                                    <label className="label">
                                        <span className="label-text-alt text-error">{formErrors.passingMarks.message}</span>
                                    </label>
                                )}
                            </div>
                        </div>
                        <div className="mt-6">
                            <h3 className="text-xl font-bold mb-4 text-base-content">Students</h3>

                            {students.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="table w-full">
                                        <thead>
                                            <tr className="text-base-content">
                                                <th className="text-base-content">Full Name</th>
                                                <th className="text-base-content">Marks</th>
                                                <th className="text-base-content">Attendance</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {students.map(student => {
                                                const studentResult = results.find(r => r.studentId === student.id);
                                                const isPresent = studentResult?.present;
                                                const marks = studentResult?.marks;

                                                return (
                                                    <tr key={student.id} className="text-base-content">
                                                        <td className="text-base-content">{student.name}</td>
                                                        <td>
                                                            <div className="flex flex-col">
                                                                <input
                                                                    type="number"
                                                                    step="0.01"
                                                                    className="input input-bordered w-24 bg-base-100 text-base-content"
                                                                    placeholder="Marks"
                                                                    value={marks ?? ''}
                                                                    disabled={isPresent === false}
                                                                    onChange={(e) => handleMarksChange(student.id, e.target.value ? parseFloat(e.target.value) : null)}
                                                                />
                                                                {errors[student.id] && (
                                                                    <span className="text-error text-sm mt-1">{errors[student.id]}</span>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <div className="flex items-center gap-4">
                                                                <label className="flex items-center gap-2 cursor-pointer text-base-content">
                                                                    <input
                                                                        type="radio"
                                                                        name={`attendance-${student.id}`}
                                                                        className="radio radio-sm radio-success"
                                                                        checked={isPresent === true}
                                                                        onChange={() => handleAttendanceChange(student.id, true)}
                                                                    />
                                                                    <span className="text-base-content">Present</span>
                                                                </label>
                                                                <label className="flex items-center gap-2 cursor-pointer text-base-content">
                                                                    <input
                                                                        type="radio"
                                                                        name={`attendance-${student.id}`}
                                                                        className="radio radio-sm radio-error"
                                                                        checked={isPresent === false}
                                                                        onChange={() => handleAttendanceChange(student.id, false)}
                                                                    />
                                                                    <span className="text-base-content">Absent</span>
                                                                </label>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="alert alert-info">
                                    <span className="text-info-content">No students found. Please select a class and section.</span>
                                </div>
                            )}
                        </div>
                        <div className="flex justify-end gap-4 mt-6">
                            <button 
                                type="button" 
                                className="btn btn-error btn-outline"
                                onClick={() => window.history.back()}
                            >
                                Cancel
                            </button>
                            <button 
                                className="btn btn-primary btn-outline" 
                                type="submit"
                            >
                                Submit Results
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}