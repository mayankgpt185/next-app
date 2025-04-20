'use client'
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { GraduationCap, Palmtree, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';

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

  // Sample data
  const holidays = [
    { id: 1, name: 'New Year\'s Day', date: '2024-01-01', description: 'Public Holiday' },
    { id: 2, name: 'Republic Day', date: '2024-01-26', description: 'National Holiday' },
    { id: 3, name: 'Holi', date: '2024-03-25', description: 'Festival Holiday' },
    { id: 4, name: 'Independence Day', date: '2024-08-15', description: 'National Holiday' },
    { id: 5, name: 'Diwali', date: '2024-10-31', description: 'Festival Holiday' },
    { id: 6, name: 'Christmas', date: '2024-12-25', description: 'Public Holiday' },
  ];

  const exams = [
    { id: 1, name: 'Mid-Term Examination', startDate: '2024-03-15', endDate: '2024-03-22', description: 'All courses' },
    { id: 2, name: 'Final Examination', startDate: '2024-05-20', endDate: '2024-05-30', description: 'All courses' },
    { id: 4, name: 'Supplementary Exams', startDate: '2024-07-10', endDate: '2024-07-15', description: 'For failed subjects' },
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
          
          <Tabs defaultValue="holidays" className="w-full">
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                    {exams.map(exam => (
                      <div key={exam.id} className="border border-base-300 rounded-lg p-3 sm:p-4 hover:bg-base-300/50 transition-colors bg-base-100">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                          <div>
                            <h3 className="font-semibold text-base sm:text-lg text-base-content">{exam.name}</h3>
                            <p className="text-xs sm:text-sm text-base-content/70">{exam.description}</p>
                          </div>
                          <div className="badge bg-rose-100 text-black border-rose-200 self-start sm:self-auto whitespace-normal text-center">
                            {exam.startDate === exam.endDate 
                              ? responsiveDate(exam.startDate)
                              : `${responsiveDate(exam.startDate)} - ${responsiveDate(exam.endDate)}`
                            }
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>
              </div>
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default CalendarPage; 