'use client';

import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

export default function AddResultPage() {
    const [examDate, setExamDate] = useState('');
    const [className, setClassName] = useState('');
    const [section, setSection] = useState('');
    const [subject, setSubject] = useState('');
    const [totalMarks, setTotalMarks] = useState<number | null>(null);
    const [passingMarks, setPassingMarks] = useState<number | null>(null);
    const [students, setStudents] = useState<{ id: string, name: string }[]>([]);
    const [results, setResults] = useState<{ studentId: string, marks: number | null, present: boolean }[]>([]);

    useEffect(() => {
        if (className && section && subject) {
            fetchStudents();
        }
    }, [className, section, subject]);

    const fetchStudents = async () => {
        try {
            const response = await fetch(`/api/students?class=${className}&section=${section}&subject=${subject}`);
            if (!response.ok) {
                throw new Error('Failed to fetch students');
            }
            const data = await response.json();
            setStudents(data);
        } catch (error) {
            console.error('Error fetching students:', error);
            toast.error('Failed to fetch students');
        }
    };

    const handleAddResult = async () => {
        try {
            const response = await fetch('/api/results', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    examDate,
                    className,
                    section,
                    subject,
                    totalMarks,
                    passingMarks,
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

    const handleMarksChange = (studentId: string, marks: number | null, present: boolean) => {
        setResults((prevResults) => {
            const existingResult = prevResults.find(result => result.studentId === studentId);
            if (existingResult) {
                return prevResults.map(result =>
                    result.studentId === studentId ? { ...result, marks, present } : result
                );
            } else {
                return [...prevResults, { studentId, marks, present }];
            }
        });
    };

    return (
        <div className="flex flex-col w-full p-6 bg-base-100 min-h-screen">
            <h2 className="text-2xl font-bold mb-4">Add Results</h2>
            <div className="mb-4">
                <label className="label">
                    <span className="label-text">Exam Date</span>
                </label>
                <input
                    type="date"
                    className="input input-bordered w-full"
                    value={examDate}
                    onChange={(e) => setExamDate(e.target.value)}
                />
            </div>
            <div className="mb-4">
                <label className="label">
                    <span className="label-text">Class</span>
                </label>
                <input
                    type="text"
                    className="input input-bordered w-full"
                    value={className}
                    onChange={(e) => setClassName(e.target.value)}
                />
            </div>
            <div className="mb-4">
                <label className="label">
                    <span className="label-text">Section</span>
                </label>
                <input
                    type="text"
                    className="input input-bordered w-full"
                    value={section}
                    onChange={(e) => setSection(e.target.value)}
                />
            </div>
            <div className="mb-4">
                <label className="label">
                    <span className="label-text">Subject</span>
                </label>
                <input
                    type="text"
                    className="input input-bordered w-full"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                />
            </div>
            <div className="mb-4">
                <label className="label">
                    <span className="label-text">Total Marks</span>
                </label>
                <input
                    type="number"
                    className="input input-bordered w-full"
                    value={totalMarks ?? ''}
                    onChange={(e) => setTotalMarks(parseInt(e.target.value))}
                />
            </div>
            <div className="mb-4">
                <label className="label">
                    <span className="label-text">Passing Marks</span>
                </label>
                <input
                    type="number"
                    className="input input-bordered w-full"
                    value={passingMarks ?? ''}
                    onChange={(e) => setPassingMarks(parseInt(e.target.value))}
                />
            </div>
            <div className="mb-4">
                <h3 className="text-xl font-bold mb-2">Students</h3>
                {students.map(student => (
                    <div key={student.id} className="flex items-center mb-2">
                        <span className="mr-4">{student.name}</span>
                        <input
                            type="checkbox"
                            className="mr-2"
                            onChange={(e) => handleMarksChange(student.id, null, e.target.checked)}
                        />
                        <span className="mr-2">Present</span>
                        <input
                            type="number"
                            className="input input-bordered w-24"
                            placeholder="Marks"
                            disabled={!results.find(result => result.studentId === student.id)?.present}
                            onChange={(e) => handleMarksChange(student.id, parseInt(e.target.value), true)}
                        />
                    </div>
                ))}
            </div>
            <button className="btn btn-primary mt-4" onClick={handleAddResult}>
                Submit Results
            </button>
        </div>
    );
}