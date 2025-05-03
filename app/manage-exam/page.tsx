'use client';

import React, { useState } from 'react';
import { Calendar, ChevronDown, ChevronUp } from 'lucide-react';
import { formatDate } from '@/utils/dateUtils';

interface Subject {
    id: string;
    class: string;
    name: string;
    date: string;
}

interface Exam {
    id: string;
    name: string;
    startDate: string;
    endDate: string;
    description: string;
    subjects?: Subject[];
    class: string;
}

// Create the ExamCard component with props for expansion control
const ExamCard = ({ 
    exam, 
    isExpanded, 
    onToggle 
}: { 
    exam: Exam; 
    isExpanded: boolean; 
    onToggle: () => void; 
}) => {
    
    const responsiveDate = (dateString: string) => {
        if (typeof window !== 'undefined' && window.innerWidth < 640) {
            const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
            return new Date(dateString).toLocaleDateString(undefined, options);
        }
        return formatDate(dateString);
    };

    // Group subjects by class
    const getSubjectsByClass = (subjects: Subject[]) => {
        const groupedSubjects: { [key: string]: Subject[] } = {};
        
        subjects.forEach(subject => {
            if (!groupedSubjects[subject.class]) {
                groupedSubjects[subject.class] = [];
            }
            groupedSubjects[subject.class].push(subject);
        });
        
        const sortedClasses = Object.keys(groupedSubjects).sort((a, b) => 
            parseInt(a) - parseInt(b)
        );
        
        return { groupedSubjects, sortedClasses };
    };

    return (
        <div 
            className={`
                border border-base-300 rounded-lg p-3 sm:p-4 
                hover:bg-base-300/40 hover:shadow-md transition-all duration-200 
                bg-base-100 cursor-pointer 
                ${exam.subjects && exam.subjects.length > 0 ? 'relative' : ''}
                ${isExpanded ? 'shadow-md bg-base-200/30' : ''}
            `}
            onClick={() => onToggle()}
        >
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                <div className="flex-1">
                    <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-base sm:text-lg text-base-content">{exam.name}</h3>
                        {exam.subjects && exam.subjects.length > 0 && (
                            <div className={`
                                text-xs py-0.5 px-2.5 rounded-full
                                dark:bg-primary/20 dark:text-base-content/90
                                bg-primary/10 text-base-content/90
                                backdrop-blur-sm
                                border border-primary/10
                                shadow-sm
                                transition-all duration-200
                                ${isExpanded ? 'opacity-0 translate-y-1' : 'opacity-90 translate-y-0'}
                            `}>
                                {exam.subjects.length === 1 ? '1 subject' : `${exam.subjects.length} subjects`}
                            </div>
                        )}
                    </div>
                    <p className="text-xs sm:text-sm text-base-content/70 mt-1">{exam.description}</p>
                </div>
                <div className="badge bg-rose-100 text-black border-rose-200 self-start sm:self-auto whitespace-normal text-center">
                    {exam.startDate === exam.endDate
                        ? responsiveDate(exam.startDate)
                        : `${responsiveDate(exam.startDate)} - ${responsiveDate(exam.endDate)}`
                    }
                </div>
            </div>
            
            {/* Expandable indicator at the bottom edge */}
            {exam.subjects && exam.subjects.length > 0 && !isExpanded && (
                <div className="absolute bottom-0 left-0 w-full flex justify-center">
                    <div className="h-1 w-8 bg-primary/30 rounded-t-full"></div>
                </div>
            )}
            
            {/* Expandable section for subjects */}
            {isExpanded && exam.subjects && exam.subjects.length > 0 && (
                <div className="mt-3 pt-3 border-t border-base-300" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-xs font-medium text-base-content/80">Subject Schedule:</p>
                    </div>
                    <div className="space-y-2">
                        {(() => {
                            const { groupedSubjects, sortedClasses } = getSubjectsByClass(exam.subjects);
                            
                            return sortedClasses.map((classNumber, classIndex) => (
                                <div key={classNumber}>
                                    {/* Class header with 50% line prefix and timetable icon */}
                                    <div className="flex items-center mt-2 mb-1">
                                        <div className="w-1/6 border-t-2 border-primary/30"></div>
                                        <div className="flex items-center">
                                            <div className="text-xs font-bold text-primary/80 ml-2 bg-primary/10 px-3 py-1 rounded-full">
                                                Class {classNumber}
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {/* Subjects for this class */}
                                    {groupedSubjects[classNumber].map((subject, subjectIndex) => (
                                        <div 
                                            key={subject.id} 
                                            className={`
                                                flex justify-between text-sm sm:text-base pl-2
                                                ${subjectIndex < groupedSubjects[classNumber].length - 1 ? 'mb-2 pb-2 border-b border-gray-300 dark:border-gray-700' : ''}
                                            `}
                                        >
                                            <div>
                                                <span className="font-large text-base-content">{subject.name}</span>
                                            </div>
                                            <div className="flex items-center text-base-content/60">
                                                <Calendar className="h-4 w-4 mr-1 text-primary/70" />
                                                <span>{responsiveDate(subject.date)}</span>
                                            </div>
                                        </div>
                                    ))}
                                    
                                    {/* Border after each class group (except the last one) */}
                                    {classIndex < sortedClasses.length - 1 && (
                                        <div className="border-b border-base-200 mt-2"></div>
                                    )}
                                </div>
                            ));
                        })()}
                    </div>
                </div>
            )}
        </div>
    );
};

interface ManageExamPageProps {
    exams?: Exam[];
}

export default function ManageExamPage({ exams = [] }: ManageExamPageProps) {
    // Track which exam card is currently expanded (if any)
    const [expandedCardId, setExpandedCardId] = useState<string | null>(null);

    // Toggle function to handle card expansion
    const toggleCard = (cardId: string) => {
        // If this card is already expanded, close it; otherwise, open this one and close any others
        setExpandedCardId(prevId => prevId === cardId ? null : cardId);
    };

    return (
        <div className="flex flex-wrap gap-3 sm:gap-4">
            {exams.map((exam, index) => {
                // Create a unique ID for each card
                const cardId = `${exam.id}-${index}`;
                
                return (
                    <div key={cardId} className="w-full md:w-[calc(50%-0.5rem)]">
                        <ExamCard 
                            exam={exam} 
                            isExpanded={expandedCardId === cardId}
                            onToggle={() => toggleCard(cardId)}
                        />
                    </div>
                );
            })}
        </div>
    );
}