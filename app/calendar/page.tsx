'use client'
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { GraduationCap, Palmtree, ChevronDown, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import ManageExamPage from '../manage-exam/page';
import { Button } from '../components/ui/button';

interface AcademicYear {
  _id: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

const CalendarPage = () => {
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [selectedAcademicYear, setSelectedAcademicYear] = useState<AcademicYear | null>(null);
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

        // Find current academic year or default to the first one
        const currentDate = new Date();
        const currentYear = data.find((year: AcademicYear) => {
          const startDate = new Date(year.startDate);
          const endDate = new Date(year.endDate);
          return currentDate >= startDate && currentDate <= endDate;
        }) || (data.length > 0 ? data[0] : null);

        setSelectedAcademicYear(currentYear);
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

      // Fetch existing exams to check which subjects are already scheduled
      // const examsResponse = await fetch(`/api/manage-exam?academicYearId=${selectedAcademicYear._id}&classId=${classId}&examType=${examFormData.examType}`);
      // if (!examsResponse.ok) throw new Error('Failed to fetch existing exams');
      // const existingExams = await examsResponse.json();

      // // Extract subject IDs that already have exams for this class and exam type
      // const scheduledSubjectIds = existingExams.map((exam: any) =>
      //   typeof exam.subjectId === 'object' ? exam.subjectId._id : exam.subjectId
      // );

      // // Filter out subjects that already have exams scheduled
      // const availableSubjects = allSubjects.filter((subject: any) =>
      //   !scheduledSubjectIds.includes(subject._id)
      // );

      // console.log('Available subjects after filtering:', availableSubjects);
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
  const formatAcademicYearLabel = (year: AcademicYear) => {
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

            {/* Academic Year Dropdown */}
            <div className="relative academic-year-dropdown">
              <button
                className="btn btn-sm btn-outline border-base-300 bg-base-100 text-base-content flex items-center gap-2"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                {formatAcademicYearLabel(selectedAcademicYear)}
                <ChevronDown className="h-4 w-4" />
              </button>

              {isDropdownOpen && (
                <div className="absolute right-0 mt-1 w-64 bg-base-100 shadow-lg rounded-md border border-base-300 z-10">
                  <ul className="py-1">
                    {academicYears.map(year => (
                      <li key={year._id}>
                        <button
                          className={`w-full text-left px-4 py-2 hover:bg-base-200 ${selectedAcademicYear._id === year._id ? 'bg-base-200 text-primary' : 'text-base-content'}`}
                          onClick={() => {
                            setSelectedAcademicYear(year);
                            setIsDropdownOpen(false);
                          }}
                        >
                          {formatAcademicYearLabel(year)}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
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
                    <div className="flex justify-center items-center p-8">
                      <span className="loading loading-spinner loading-md text-primary"></span>
                      <p className="ml-2 text-base-content">Loading exams...</p>
                    </div>
                  ) : exams.length > 0 ? (
                    <ManageExamPage exams={exams} />
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
                  min={selectedAcademicYear ? selectedAcademicYear.startDate.slice(0, 10) : ''}
                  max={selectedAcademicYear ? selectedAcademicYear.endDate.slice(0, 10) : ''}
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
    </div>
  );
};

export default CalendarPage; 