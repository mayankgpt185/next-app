'use client';

import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { z } from 'zod';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/app/components/ui/button';

// Add this interface at the top with your other interfaces
interface AcademicYear {
    _id: string;
    startDate: string;
    endDate: string;
}

export default function AddResultPage() {
    const [examDate, setExamDate] = useState('');
    const [examType, setExamType] = useState('');
    const [isOtherExamType, setIsOtherExamType] = useState(false);
    const [otherExamType, setOtherExamType] = useState('');
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
    const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
    const [selectedAcademicYearId, setSelectedAcademicYearId] = useState('');
    const [academicYearStart, setAcademicYearStart] = useState<string>('');
    const [academicYearEnd, setAcademicYearEnd] = useState<string>('');

    // Define Zod schema for form validation with conditional validation
    const resultFormSchema = z.object({
        examDate: z.string().nonempty("Exam date is required"),
        examType: z.string().nonempty("Exam type is required"),
        classId: z.string().nonempty("Class is required"),
        sectionId: z.string().nonempty("Section is required"),
        subjectId: z.string().nonempty("Subject is required"),
        selectedStaffId: z.string().nonempty("Teacher is required"),
        totalMarks: z.string().nonempty("Total marks is required").transform(val => parseInt(val)),
        passingMarks: z.string().nonempty("Passing marks is required").transform(val => parseInt(val))
    });

    type FormData = z.infer<typeof resultFormSchema>;

    const { register, handleSubmit, formState: { errors: formErrors, touchedFields }, setValue, trigger, reset } = useForm<FormData>({
        resolver: zodResolver(resultFormSchema),
        mode: "onTouched"
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
            setValue("subjectId", "");
            setSelectedStaffId('');
            setValue("selectedStaffId", "");
            setStaffs([]);
            setStudents([]);
            setResults([]);
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
            setSelectedStaffId('');
            setValue("selectedStaffId", "");
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

    // Add this function to check and clear field errors
    const clearFieldError = (field: string, value: any) => {
        if (formErrors[field as keyof typeof formErrors] && value) {
            // Clear the error for this field
            const updatedErrors = { ...formErrors };
            delete updatedErrors[field as keyof typeof formErrors];
            // This is a workaround since we can't directly modify formErrors
            // We're updating the form state to trigger a re-render
            setValue(field as any, value, {
                shouldValidate: true,
                shouldDirty: true
            });
        }
    };

    const handleMarksChange = (studentId: string, marks: number | null) => {
        // Validate that marks don't exceed total marks
        if (marks !== null && totalMarks !== null && marks > totalMarks) {
            toast.error(`Marks cannot exceed total marks (${totalMarks})`);
            return;
        }

        // Clear error for this student when valid marks are added
        if (marks !== null || errors[studentId]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[studentId];
                return newErrors;
            });
        }

        setResults((prevResults) => {
            const existingResult = prevResults.find(result => result.studentId === studentId);
            if (existingResult) {
                return prevResults.map(result =>
                    result.studentId === studentId ? { ...result, marks } : result
                );
            } else {
                return [...prevResults, { studentId, marks, present: true }];
            }
        });
    };

    const handleAttendanceChange = (studentId: string, present: boolean) => {
        // Clear error for this student when attendance is marked
        if (errors[studentId]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[studentId];
                return newErrors;
            });
        }

        setResults((prevResults) => {
            const existingResult = prevResults.find(result => result.studentId === studentId);
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
        clearFieldError("totalMarks", value);

        // Reset passing marks if it's greater than the new total marks or if total marks is cleared
        if (passingMarks !== null && (newTotalMarks === null || newTotalMarks < passingMarks)) {
            setPassingMarks(null);
            setValue("passingMarks", "" as unknown as number); // Clear the passing marks field
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

    useEffect(() => {
        if (examType === 'other') {
            setIsOtherExamType(true);
            setValue("examType", otherExamType || "");
        } else {
            setIsOtherExamType(false);
        }
    }, [examType, otherExamType, setValue]);

    const onSubmit: SubmitHandler<FormData> = async (data) => {
        // Custom validation for student records
        const newErrors: { [key: string]: string } = {};
        let hasErrors = false;

        // Only validate student records if they are visible
        if (students.length > 0 && !isLoading && classId && sectionId) {
            students.forEach(student => {
                const result = results.find(r => r.studentId === student.id);
                if (!result) {
                    newErrors[student.id] = "Please mark absent attendance or enter marks";
                    hasErrors = true;
                } else if (result.present && result.marks === null) {
                    // Only require marks for present students
                    newErrors[student.id] = "Please enter marks";
                    hasErrors = true;
                } else if (result.present && result.marks !== null && data.totalMarks && result.marks > data.totalMarks) {
                    // Validate marks don't exceed total marks
                    newErrors[student.id] = `Marks cannot exceed total marks (${data.totalMarks})`;
                    hasErrors = true;
                }
            });
        }

        setErrors(newErrors);

        if (hasErrors) {
            toast.error("Please add attendance and marks for all students");
            return;
        }

        // Skip validation for fields that should be disabled based on conditions
        if (!subjectId) {
            // Don't validate teacher selection if no subject is selected
            delete formErrors.selectedStaffId;
        }

        if (!totalMarks) {
            // Don't validate passing marks if no total marks are selected
            delete formErrors.passingMarks;
        }

        // Check if there are any remaining form errors
        if (Object.keys(formErrors).length > 0) {
            toast.error("Please fill in all required fields");
            return;
        }

        try {
            const response = await fetch('/api/manage-result', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    examDate: data.examDate,
                    examType: isOtherExamType ? otherExamType : data.examType,
                    classId: data.classId,
                    sectionId: data.sectionId,
                    subjectId: data.subjectId,
                    staffId: data.selectedStaffId,
                    totalMarks: data.totalMarks,
                    passingMarks: data.passingMarks,
                    results,
                }),
            });

            const responseData = await response.json();

            if (!response.ok) {
                if (response.status === 409) {
                    // Handle the duplicate entry error
                    toast.error(responseData.error || 'A result for this combination already exists');
                } else {
                    throw new Error(responseData.error || 'Failed to add results');
                }
                return;
            }

            toast.success('Results added successfully');
            
            // Reset form after successful submission
            setExamDate('');
            setExamType('');
            setIsOtherExamType(false);
            setOtherExamType('');
            setClassId('');
            setSectionId('');
            setSubjectId('');
            setSubjectOptions([]);
            setStaffs([]);
            setSelectedStaffId('');
            setTotalMarks(null);
            setPassingMarks(null);
            setStudents([]);
            setResults([]);
            
            // Reset form fields using react-hook-form reset
            reset({
                examDate: '',
                examType: '',
                classId: '',
                sectionId: '',
                subjectId: '',
                selectedStaffId: '',
                totalMarks: '' as unknown as number,
                passingMarks: '' as unknown as number
            });
            
        } catch (error) {
            console.error('Error adding results:', error);
            toast.error('Failed to add results');
        }
    };

    useEffect(() => {
        const fetchAcademicYears = async () => {
            try {
                const response = await fetch('/api/session');
                if (!response.ok) {
                    throw new Error('Failed to fetch academic years');
                }
                const data = await response.json();
                
                setAcademicYears(data);
                
                if (data.length > 0) {
                    // Sort by startDate in descending order
                    const sortedYears = [...data].sort((a, b) => 
                        new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
                    );
                    
                    const latestYear = sortedYears[0];
                    setSelectedAcademicYearId(latestYear._id);
                    
                    const startDate = new Date(latestYear.startDate);
                    const endDate = new Date(latestYear.endDate);
                    
                    const formattedStartDate = startDate.toISOString().split('T')[0];
                    const formattedEndDate = endDate.toISOString().split('T')[0];
                    
                    setAcademicYearStart(formattedStartDate);
                    setAcademicYearEnd(formattedEndDate);
                }
            } catch (error) {
                console.error('Error fetching academic years:', error);
                toast.error('Failed to load academic years');
            }
        };

        fetchAcademicYears();
    }, []);

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
                                    min={academicYearStart}
                                    max={academicYearEnd}
                                    className={`input input-bordered w-full bg-base-100 text-base-content ${formErrors.examDate ? 'input-error' : ''}`}
                                    {...register("examDate")}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        setExamDate(value);
                                        setValue("examDate", value);
                                        clearFieldError("examDate", value);
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
                                    <span className="label-text text-base-content">Exam Type</span>
                                </label>
                                {isOtherExamType ? (
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            className={`input input-bordered w-full bg-base-100 text-base-content ${formErrors.examType ? 'input-error' : ''}`}
                                            placeholder="Specify exam type"
                                            value={otherExamType}
                                            onChange={(e) => {
                                                const value = e.target.value;
                                                setOtherExamType(value);
                                                setValue("examType", value);
                                                clearFieldError("examType", value);
                                            }}
                                        />
                                        <Button 
                                            type="button" 
                                            variant="ghost" 
                                            className="px-2"
                                            onClick={() => {
                                                setExamType('');
                                                setIsOtherExamType(false);
                                                setOtherExamType('');
                                                setValue("examType", "");
                                            }}
                                        >
                                            ↩
                                        </Button>
                                    </div>
                                ) : (
                                    <select
                                        className={`select select-bordered w-full bg-base-100 text-base-content ${formErrors.examType ? 'select-error' : ''}`}
                                        {...register("examType")}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            setExamType(value);
                                            setValue("examType", value);
                                            clearFieldError("examType", value);
                                        }}
                                    >
                                        <option value="">Select Exam Type</option>
                                        <option value="unit-test">Unit Test</option>
                                        <option value="half-yearly">Half-Yearly Exam</option>
                                        <option value="final">Final Exam</option>
                                        <option value="other">Other</option>
                                    </select>
                                )}
                                {formErrors.examType && (
                                    <label className="label">
                                        <span className="label-text-alt text-error">{formErrors.examType.message}</span>
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
                                        const value = e.target.value;
                                        // Reset dependent fields when class changes
                                        setSubjectId('');
                                        setValue("subjectId", "");
                                        setSelectedStaffId('');
                                        setValue("selectedStaffId", "");
                                        setClassId(value);
                                        setValue("classId", value);
                                        clearFieldError("classId", value);
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
                                        const value = e.target.value;
                                        // Reset dependent fields when section changes
                                        setSubjectId('');
                                        setValue("subjectId", "");
                                        setSelectedStaffId('');
                                        setValue("selectedStaffId", "");
                                        setSectionId(value);
                                        setValue("sectionId", value);
                                        clearFieldError("sectionId", value);
                                    }}
                                    disabled={isLoading}
                                >
                                    <option value="">Select Section</option>
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
                                <div className="relative">
                                    <select
                                        className={`select select-bordered w-full bg-base-100 text-base-content ${formErrors.subjectId ? 'select-error' : ''}`}
                                        {...register("subjectId")}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            setSubjectId(value);
                                            setValue("subjectId", value);
                                            clearFieldError("subjectId", value);
                                        }}
                                        disabled={!classId || !sectionId}
                                    >
                                        <option value="">Select Subject</option>
                                        {subjectOptions.map((option) => (
                                            <option key={option._id} value={option._id}>
                                                {option.subject}
                                            </option>
                                        ))}
                                    </select>
                                    {isLoading && classId && sectionId && (
                                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                            <span className="loading loading-spinner loading-sm text-primary"></span>
                                        </div>
                                    )}
                                </div>
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
                                        const value = e.target.value;
                                        setSelectedStaffId(value);
                                        setValue("selectedStaffId", value);
                                        clearFieldError("selectedStaffId", value);
                                    }}
                                    disabled={staffs.length === 0}
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
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        handleTotalMarksChange(value);
                                        clearFieldError("totalMarks", value);
                                    }}
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
                                        setValue("passingMarks", value as unknown as number);
                                        clearFieldError("passingMarks", value);
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
                        {classId && sectionId && !isLoading && students.length > 0 ? (
                            <div className="mt-6">
                                <h2 className="text-xl font-bold mb-4 text-base-content">Students</h2>
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
                            </div>
                        ) : classId && sectionId && !isLoading ? (
                            <div className="mt-6">
                                <h3 className="text-xl font-bold mb-4 text-base-content">Students</h3>
                                <div className="flex justify-center items-center py-8">
                                    <p className="text-lg font-medium text-base-content">No students found for the selected class and section.</p>
                                </div>
                            </div>
                        ) : isLoading && classId && sectionId ? (
                            <div className="mt-6">
                                <h3 className="text-xl font-bold mb-4 text-base-content">Students</h3>
                                <div className="flex justify-center items-center py-8">
                                    <span className="loading loading-spinner loading-lg text-primary"></span>
                                    <span className="ml-3 text-base-content">Loading students...</span>
                                </div>
                            </div>
                        ) : null}
                        <div className="flex justify-end gap-4 mt-6">
                            <Button
                                type="button"
                                variant="error"
                                outline
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="primary"
                                type="submit"
                                outline
                            >
                                Add Results
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}