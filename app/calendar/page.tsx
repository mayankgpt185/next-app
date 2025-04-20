'use client'
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { GraduationCap, Palmtree } from 'lucide-react';

const CalendarPage = () => {
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

  return (
    <div className="flex flex-col w-full min-h-screen p-6 bg-base-100">
      <div className="card bg-base-200 shadow-xl flex-1">
        <div className="card-body flex flex-col">
          <h2 className="card-title text-xl sm:text-2xl mb-4 text-base-content">Academic Calendar</h2>
          
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