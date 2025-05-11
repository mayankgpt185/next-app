'use client'
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { GraduationCap, Palmtree, ChevronDown, Plus, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '../components/ui/button';
import AcademicYearDropdown from '../components/ui/academicYearDropdown';
import { ISession } from '../api/models/session';

interface AcademicYear {
  _id: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

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

const CalendarPage = () => {
  const [academicYears, setAcademicYears] = useState<ISession[]>([]);
  const [selectedAcademicYear, setSelectedAcademicYear] = useState<ISession | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoadingAcademicYears, setIsLoadingAcademicYears] = useState(true);
  const [isAddExamModalOpen, setIsAddExamModalOpen] = useState(false);
  const [examTypes, setExamTypes] = useState([]);
  const [isLoadingExamTypes, setIsLoadingExamTypes] = useState(false);
  const [subjects, setSubjects] = useState([]);
  const [isLoadingSubjects, setIsLoadingSubjects] = useState(false);
  const [examFormData, setExamFormData] = useState({
    examType: '',
    subjectId: '',
    examDate: '',
    classId: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [classes, setClasses] = useState([]);
  const [isLoadingClasses, setIsLoadingClasses] = useState(false);
  const [exams, setExams] = useState<any[]>([]);
  const [isLoadingExams, setIsLoadingExams] = useState(false);
  const [examsByType, setExamsByType] = useState<{ [key: string]: any[] }>({});
  const [activeTab, setActiveTab] = useState('holidays');
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [studentClassId, setStudentClassId] = useState<string | null>(null);
  const [isSeatingModalOpen, setIsSeatingModalOpen] = useState(false);
  const [seatingFormData, setSeatingFormData] = useState({
    examId: '',
    classNumber: '',
    sectionId: '',
    venue: ''
  });
  const [sections, setSections] = useState([]);
  const [isLoadingSections, setIsLoadingSections] = useState(false);

  // Sample data
  const holidays = [
    { id: 1, name: 'New Year\'s Day', date: '2024-01-01', description: 'Public Holiday' },
    { id: 2, name: 'Republic Day', date: '2024-01-26', description: 'National Holiday' },
    { id: 3, name: 'Holi', date: '2024-03-25', description: 'Festival Holiday' },
    { id: 4, name: 'Independence Day', date: '2024-08-15', description: 'National Holiday' },
    { id: 5, name: 'Diwali', date: '2024-10-31', description: 'Festival Holiday' },
    { id: 6, name: 'Christmas', date: '2024-12-25', description: 'Public Holiday' },
  ];

  // Fetch academic years from API
  useEffect(() => {
    const fetchAcademicYears = async () => {
      try {
        setIsLoadingAcademicYears(true);
        const response = await fetch('/api/session');
        if (!response.ok) throw new Error('Failed to fetch academic years');

        const data = await response.json();
        setAcademicYears(data);

        if (data.length > 0) {
            // Sort by startDate in descending order
            const sortedYears = [...data].sort((a, b) =>
                new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
            );
            setSelectedAcademicYear(sortedYears[0]);
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

  // Fetch user data from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        try {
          const decodedPayload = JSON.parse(atob(storedToken.split('.')[1]));
          setUserRole(decodedPayload.role);
          setUserId(decodedPayload.id);
          // If user is a student, fetch their class ID
          if (decodedPayload.role === 'STUDENT') {
            fetchStudentClassId(decodedPayload.id);
          }
        } catch (error) {
          console.error('Error decoding token:', error);
          toast.error('Error retrieving user data');
        }
      }
    }
  }, []);

  // Fetch student's class ID
  const fetchStudentClassId = async (studentId: string) => {
    try {
      const response = await fetch(`/api/manage-staff?id=${studentId}`);
      if (!response.ok) throw new Error('Failed to fetch student data');

      const studentData = await response.json();
      if (studentData && studentData.class._id) {
        setStudentClassId(studentData.class._id);
      }
    } catch (error) {
      console.error('Error fetching student class ID:', error);
    }
  };

  // Fetch exam types
  const fetchExamTypes = async () => {
    try {
      setIsLoadingExamTypes(true);
      const response = await fetch('/api/examType');
      if (!response.ok) throw new Error('Failed to fetch exam types');
      const data = await response.json();
      setExamTypes(data);
    } catch (error) {
      console.error('Error fetching exam types:', error);
      toast.error('Failed to load exam types');
    } finally {
      setIsLoadingExamTypes(false);
    }
  };

  // Fetch subjects based on selected class and filter out already scheduled subjects
  const fetchSubjectsByClass = async (classId: string) => {
    if (!classId || !examFormData.examType || !selectedAcademicYear) return;

    try {
      setIsLoadingSubjects(true);
      // Fetch all subjects for the class
      const response = await fetch(`/api/manage-subject?classId=${classId}`);
      if (!response.ok) throw new Error('Failed to fetch subjects for this class');
      const allSubjects = await response.json();

      setSubjects(allSubjects);
    } catch (error) {
      console.error('Error fetching subjects for class:', error);
      toast.error('Failed to load subjects for this class');
    } finally {
      setIsLoadingSubjects(false);
    }
  };

  // Fetch classes
  const fetchClasses = async () => {
    try {
      setIsLoadingClasses(true);
      const response = await fetch('/api/classes');
      if (!response.ok) throw new Error('Failed to fetch classes');
      const data = await response.json();
      console.log('Classes data:', data);
      setClasses(data);
    } catch (error) {
      console.error('Error fetching classes:', error);
      toast.error('Failed to load classes');
    } finally {
      setIsLoadingClasses(false);
    }
  };

  // Fetch exams from API
  const fetchExams = async () => {
    if (!selectedAcademicYear) return;

    try {
      setIsLoadingExams(true);

      let apiUrl = `/api/manage-exam?academicYearId=${selectedAcademicYear._id}`;

      // If user is a student, add class ID filter
      if (userRole === 'STUDENT' && studentClassId) {
        apiUrl += `&classId=${studentClassId}`;
      }

      const response = await fetch(apiUrl);
      if (!response.ok) throw new Error('Failed to fetch exams');

      const data = await response.json();
      console.log('Exams data:', data);
      // Group exams by their examination type (e.g., Mid-Term, Final)
      const examGroups: { [key: string]: any[] } = {};

      // First pass: group all exams by their type ID
      data.forEach((exam: any) => {
        const typeId = exam.examType._id;
        
        if (!examGroups[typeId]) {
          examGroups[typeId] = [];
        }
        examGroups[typeId].push(exam);
      });

      // Second pass: format each exam group into a display-friendly object
      const formattedExams = [];

      for (const [typeId, exams] of Object.entries(examGroups)) {
        // Get sample exam to extract common details
        const sampleExam = exams[0];
        const examTypeName = sampleExam.examType.type;

        // Find the earliest and latest exam dates in this group
        let earliestDate = new Date(exams[0].examDate);
        let latestDate = new Date(exams[0].examDate);

        for (const exam of exams) {
          const currentDate = new Date(exam.examDate);
          if (currentDate < earliestDate) earliestDate = currentDate;
          if (currentDate > latestDate) latestDate = currentDate;
        }

        // Format the subjects list for this exam group
        const subjectsList = exams.map(exam => ({
          id: exam._id,
          name: exam.subjectId.subject,
          class: exam.classId.classNumber,
          date: new Date(exam.examDate).toISOString().split('T')[0]
        }));

        // Create the formatted exam group object
        formattedExams.push({
          id: typeId,
          name: `${examTypeName} Examinations`,
          startDate: earliestDate.toISOString().split('T')[0],
          endDate: latestDate.toISOString().split('T')[0],
          description: userRole === 'STUDENT' ? `` : `All classes`,
          examTypeId: sampleExam.examType,
          examTypeName: examTypeName,
          subjects: subjectsList
        });
      }

      // Update state with the formatted exams
      setExams(formattedExams);

      // Group exams by type name for display
      const groupedExams = formattedExams.reduce((acc: { [key: string]: any[] }, exam) => {
        const typeName = exam.examTypeName;
        if (!acc[typeName]) {
          acc[typeName] = [];
        }
        acc[typeName].push(exam);
        return acc;
      }, {});

      setExamsByType(groupedExams);

    } catch (error) {
      console.error('Error fetching exams:', error);
      toast.error('Failed to load exams');
    } finally {
      setIsLoadingExams(false);
    }
  };

  // Keep only this useEffect to fetch exams when switching to the exams tab
  useEffect(() => {
    if (activeTab === 'exams' && selectedAcademicYear) {
      if (userRole !== 'STUDENT' || (userRole === 'STUDENT' && studentClassId)) {
        fetchExams();
      }
    }
  }, [activeTab, selectedAcademicYear, userRole, studentClassId]);

  // Function to format date
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Function for responsive date display
  const responsiveDate = (dateString: string) => {
    // For small screens, use shorter format
    if (typeof window !== 'undefined' && window.innerWidth < 640) {
      const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
      return new Date(dateString).toLocaleDateString(undefined, options);
    }
    return formatDate(dateString);
  };

  // Format academic year label
  const formatAcademicYearLabel = (year: ISession) => {
    const startDate = new Date(year.startDate);
    const endDate = new Date(year.endDate);
    return `${startDate.toLocaleString('default', { month: 'short' })} ${startDate.getFullYear()} - ${endDate.toLocaleString('default', { month: 'short' })} ${endDate.getFullYear()}`;
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.academic-year-dropdown')) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle form input changes with special handling for classId and examType
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    setExamFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // If class is selected or exam type changes, fetch subjects for that class
    if (name === 'classId' && value) {
      // Reset subject selection when class changes
      setExamFormData(prev => ({
        ...prev,
        subjectId: ''
      }));

      if (examFormData.examType) {
        fetchSubjectsByClass(value);
      }
    } else if (name === 'examType' && value && examFormData.classId) {
      // Reset subject selection when exam type changes
      setExamFormData(prev => ({
        ...prev,
        subjectId: ''
      }));

      fetchSubjectsByClass(examFormData.classId);
    }
  };

  // Handle form submission
  const handleSubmitExam = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedAcademicYear) {
      toast.error('No academic year selected');
      return;
    }

    // Validate that exam date is within the academic year
    const examDate = new Date(examFormData.examDate);
    const academicYearStart = new Date(selectedAcademicYear.startDate);
    const academicYearEnd = new Date(selectedAcademicYear.endDate);

    if (examDate < academicYearStart || examDate > academicYearEnd) {
      toast.error(`Exam date must be within the selected academic year: ${formatAcademicYearLabel(selectedAcademicYear)}`);
      return;
    }

    try {
      setIsSubmitting(true);

      const examData = {
        examType: examFormData.examType,
        academicYearId: selectedAcademicYear._id,
        examDate: examFormData.examDate,
        classId: examFormData.classId,
        subjectId: examFormData.subjectId,
      };

      const response = await fetch('/api/manage-exam', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(examData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        toast.error(errorData.error || 'Failed to add exam');
        return;
      }
      toast.success('Exam added successfully');
      setIsAddExamModalOpen(false);

      // Reset form data
      setExamFormData({
        examType: '',
        subjectId: '',
        examDate: '',
        classId: '',
      });

      // Refresh exams list
      fetchExams();

    } catch (error) {
      console.error('Error creating exam:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open modal and load exam types and classes (but not subjects yet)
  const handleAddExamClick = () => {
    fetchExamTypes();
    fetchClasses();
    // Reset form data when opening modal
    setExamFormData({
      examType: '',
      subjectId: '',
      examDate: '',
      classId: '',
    });
    // Clear subjects list
    setSubjects([]);
    setIsAddExamModalOpen(true);
  };

  // Add ExamCard component right inside your calendar page file
  const ExamCard = ({ 
    exam, 
    isExpanded, 
    onToggle 
  }: { 
    exam: Exam; 
    isExpanded: boolean; 
    onToggle: () => void; 
  }) => {
    
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
                      <div className="flex items-center justify-between w-5/6">
                        <div className="text-xs font-bold text-primary/80 ml-2 bg-primary/10 px-3 py-1 rounded-full">
                          Class {classNumber}
                        </div>
                        
                        {/* Add seating arrangement button (only for staff) */}
                        {userRole !== 'STUDENT' && (
                          <button 
                            className="btn btn-xs btn-outline border-primary/30 text-primary/80 ml-2"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAddSeatingArrangement(exam.id, classNumber);
                            }}
                          >
                            <svg className="w-3.5 h-3.5 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12h18M12 3v18"/></svg>
                            <span className="text-xs opacity-80">Add Seating</span>
                          </button>
                        )}
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

  // Add ManageExam component right after ExamCard
  const ManageExam = ({ exams = [] }: { exams: Exam[] }) => {
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
  };

  // Handle opening the seating arrangement modal
  const handleAddSeatingArrangement = (examId: string, classNumber: string) => {
    // Reset form data
    setSeatingFormData({
      examId,
      classNumber,
      sectionId: '',
      venue: ''
    });
    
    // Fetch sections for this class
    fetchSections(classNumber);
    
    // Open the modal
    setIsSeatingModalOpen(true);
  };

  // Fetch sections for a class
  const fetchSections = async (classNumber: string) => {
    try {
      setIsLoadingSections(true);
      const response = await fetch(`/api/sections?classNumber=${classNumber}`);
      if (!response.ok) throw new Error('Failed to fetch sections');
      
      const data = await response.json();
      setSections(data);
    } catch (error) {
      console.error('Error fetching sections:', error);
      toast.error('Failed to load sections');
    } finally {
      setIsLoadingSections(false);
    }
  };

  // Handle form input changes for seating arrangement
  const handleSeatingInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setSeatingFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle seating arrangement form submission
  const handleSubmitSeatingArrangement = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/seating-arrangement', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          examId: seatingFormData.examId,
          sectionId: seatingFormData.sectionId,
          venue: seatingFormData.venue,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        toast.error(errorData.error || 'Failed to add seating arrangement');
        return;
      }
      
      toast.success('Seating arrangement added successfully');
      setIsSeatingModalOpen(false);
    } catch (error) {
      console.error('Error creating seating arrangement:', error);
      toast.error('An error occurred while saving the seating arrangement');
    }
  };

  // Handle year change from dropdown
  const handleYearChange = (yearId: ISession) => {
    setSelectedAcademicYear(yearId);
  };

  if (isLoadingAcademicYears || !selectedAcademicYear) {
    return (
      <div className="flex flex-col w-full min-h-screen p-6 bg-base-100">
        <div className="card bg-base-200 shadow-xl flex-1">
          <div className="card-body flex items-center justify-center">
            <span className="loading loading-spinner loading-lg text-primary"></span>
            <p className="mt-4 text-base-content">Loading calendar...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full min-h-screen p-6 bg-base-100">
      <div className="card bg-base-200 shadow-xl flex-1">
        <div className="card-body flex flex-col">
          <div className="mb-6 flex justify-between items-center">
            <h2 className="card-title text-xl sm:text-2xl text-base-content">Academic Calendar</h2>

            {/* Replace custom dropdown with our component */}
            <AcademicYearDropdown
              academicYears={academicYears}
              selectedYearId={selectedAcademicYear}
              onYearChange={handleYearChange}
              isLoading={isLoadingAcademicYears}
            />
          </div>

          <Tabs
            defaultValue="holidays"
            className="w-full"
            onValueChange={(value) => setActiveTab(value)}
          >
            <TabsList className="grid w-full grid-cols-2 bg-base-300/50 max-w-md mx-auto mb-4 sm:mb-6 rounded-xl p-1">
              <TabsTrigger
                value="holidays"
                className="flex items-center text-base-content/80 rounded-lg transition-all duration-200 data-[state=active]:bg-base-100 data-[state=active]:text-emerald-600 data-[state=active]:shadow-sm"
              >
                <Palmtree className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                <span className="text-xs sm:text-sm font-medium">Holidays</span>
              </TabsTrigger>
              <TabsTrigger
                value="exams"
                className="flex items-center text-base-content/80 rounded-lg transition-all duration-200 data-[state=active]:bg-base-100 data-[state=active]:text-rose-700 data-[state=active]:shadow-sm"
              >
                <GraduationCap className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                <span className="text-xs sm:text-sm font-medium">Exams</span>
              </TabsTrigger>
            </TabsList>

            <div className="overflow-x-auto flex-1">
              <div className="overflow-y-auto h-[calc(100vh-280px)]">
                <TabsContent value="holidays">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                    {holidays.map(holiday => (
                      <div key={holiday.id} className="border border-base-300 rounded-lg p-3 sm:p-4 hover:bg-base-300/50 transition-colors bg-base-100">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                          <div>
                            <h3 className="font-semibold text-base sm:text-lg text-base-content">{holiday.name}</h3>
                            <p className="text-xs sm:text-sm text-base-content/70">{holiday.description}</p>
                          </div>
                          <div className="badge bg-emerald-100 text-black border-emerald-200 self-start sm:self-auto">
                            {responsiveDate(holiday.date)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="exams">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-base-content">
                      {userRole === 'STUDENT' ? 'Your Examination Schedule' : 'Examination Schedule'}
                    </h3>

                    {/* Only show Add Exam button for non-student users */}
                    {userRole !== 'STUDENT' && (
                      <button
                        className="btn btn-sm btn-primary"
                        onClick={handleAddExamClick}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Exam
                      </button>
                    )}
                  </div>

                  {isLoadingExams ? (
                    <div className="flex flex-col justify-center items-center p-8">
                      <span className="loading loading-spinner loading-md text-primary"></span>
                      <p className="mt-2 text-base-content">Loading exams...</p>
                    </div>
                  ) : exams.length > 0 ? (
                    <ManageExam exams={exams} />
                  ) : (
                    <div className="text-center py-6 text-base-content/70">
                      <p>No exams scheduled for this academic year.</p>
                      <button
                        className="btn btn-sm btn-outline mt-2"
                        onClick={handleAddExamClick}
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Schedule an exam
                      </button>
                    </div>
                  )}
                </TabsContent>
              </div>
            </div>
          </Tabs>
        </div>
      </div>

      {/* Add Exam Modal */}
      {isAddExamModalOpen && userRole !== 'STUDENT' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-base-100 rounded-lg shadow-xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-base-content">Add New Examination</h3>
              <button
                className="btn btn-sm btn-ghost text-base-content"
                onClick={() => setIsAddExamModalOpen(false)}
              >
                ×
              </button>
            </div>

            <form className="space-y-4" onSubmit={handleSubmitExam}>
              <div className="form-control">
                <label className="label">
                  <span className="label-text text-base-content">Exam Type</span>
                </label>
                <select
                  className="select select-bordered w-full text-base-content"
                  required
                  name="examType"
                  value={examFormData.examType}
                  onChange={handleInputChange}
                >
                  <option value="" disabled className="text-base-content">Select exam type</option>
                  {isLoadingExamTypes ? (
                    <option disabled className="text-base-content">Loading exam types...</option>
                  ) : (
                    examTypes.map((type: any) => (
                      <option key={type._id} value={type._id} className="text-base-content">{type.type}</option>
                    ))
                  )}
                </select>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text text-base-content">Class</span>
                </label>
                <select
                  className="select select-bordered w-full text-base-content"
                  required
                  name="classId"
                  value={examFormData.classId}
                  onChange={handleInputChange}
                >
                  <option value="" disabled className="text-base-content">Select class</option>
                  {isLoadingClasses ? (
                    <option disabled className="text-base-content">Loading classes...</option>
                  ) : (
                    classes.map((cls: any) => (
                      <option key={cls._id} value={cls._id} className="text-base-content">
                        {cls.classNumber}
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text text-base-content">Subject</span>
                </label>
                <select
                  className="select select-bordered w-full text-base-content"
                  required
                  name="subjectId"
                  value={examFormData.subjectId}
                  onChange={handleInputChange}
                  disabled={!examFormData.classId || !examFormData.examType || isLoadingSubjects}
                >
                  <option value="" disabled className="text-base-content">
                    {!examFormData.classId
                      ? 'Select a class first'
                      : !examFormData.examType
                        ? 'Select an exam type first'
                        : 'Select subject'}
                  </option>
                  {isLoadingSubjects ? (
                    <option disabled className="text-base-content">Loading subjects...</option>
                  ) : (
                    subjects.map((subject: any) => (
                      <option key={subject._id} value={subject._id} className="text-base-content">
                        {subject.subject}
                      </option>
                    ))
                  )}
                </select>
                {examFormData.classId && examFormData.examType && subjects.length === 0 && !isLoadingSubjects && (
                  <p className="text-xs text-red-500 mt-1">No available subjects found. All subjects may already have exams scheduled for this exam type.</p>
                )}
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text text-base-content">Exam Date</span>
                </label>
                <input
                  type="date"
                  className="input input-bordered text-base-content"
                  required
                  name="examDate"
                  value={examFormData.examDate}
                  onChange={handleInputChange}
                  min={selectedAcademicYear ? selectedAcademicYear.startDate.toISOString().slice(0, 10) : ''}
                  max={selectedAcademicYear ? selectedAcademicYear.endDate.toISOString().slice(0, 10) : ''}
                />
                <label className="label">
                  <span className="label-text-alt text-info">
                    Date must be within {formatAcademicYearLabel(selectedAcademicYear)}
                  </span>
                </label>
              </div>

              <div className="flex justify-end gap-2 mt-6">
                <Button
                  type="button"
                  variant="ghost"
                  outline
                  onClick={() => setIsAddExamModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  type="submit"
                  outline
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <span className="loading loading-spinner loading-xs mr-2"></span>
                      Saving...
                    </>
                  ) : (
                    'Add Exam'
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Seating Arrangement Modal */}
      {isSeatingModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-base-100 rounded-lg shadow-xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-base-content">
                Add Seating Arrangement
              </h3>
              <button
                className="btn btn-sm btn-ghost text-base-content"
                onClick={() => setIsSeatingModalOpen(false)}
              >
                ×
              </button>
            </div>

            <form className="space-y-4" onSubmit={handleSubmitSeatingArrangement}>
              <div className="form-control">
                <label className="label">
                  <span className="label-text text-base-content">Class</span>
                </label>
                <input
                  type="text"
                  className="input input-bordered text-base-content"
                  value={`Class ${seatingFormData.classNumber}`}
                  disabled
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text text-base-content">Section</span>
                </label>
                <select
                  className="select select-bordered w-full text-base-content"
                  required
                  name="sectionId"
                  value={seatingFormData.sectionId}
                  onChange={handleSeatingInputChange}
                >
                  <option value="" disabled className="text-base-content">Select section</option>
                  {isLoadingSections ? (
                    <option disabled className="text-base-content">Loading sections...</option>
                  ) : (
                    sections.map((section: any) => (
                      <option key={section._id} value={section._id} className="text-base-content">
                        {section.section}
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text text-base-content">Venue</span>
                </label>
                <input
                  type="text"
                  className="input input-bordered text-base-content"
                  required
                  name="venue"
                  value={seatingFormData.venue}
                  onChange={handleSeatingInputChange}
                  placeholder="Enter venue (e.g., Room 101)"
                />
              </div>

              <div className="flex justify-end gap-2 mt-6">
                <Button
                  type="button"
                  variant="ghost"
                  outline
                  onClick={() => setIsSeatingModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  type="submit"
                  outline
                >
                  Save Arrangement
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarPage; 