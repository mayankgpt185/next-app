'use client'
import React, { useState, useEffect, useRef } from 'react';
import { Card } from '../ui/card';
import { useRouter } from 'next/navigation';
import { useSidebarStore } from '../store/useSidebarStore';
const lucideReact = require('lucide-react');

const Sidebar = () => {
  const router = useRouter();
  const { isExpanded, toggleSidebar } = useSidebarStore();
  const [currentTheme, setCurrentTheme] = useState<'light' | 'dark'>('light');
  const [currentPath, setCurrentPath] = useState('');
  const [showScrollUp, setShowScrollUp] = useState(false);
  const [showScrollDown, setShowScrollDown] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize theme state
    setCurrentTheme(document.documentElement.getAttribute('data-theme') as 'light' | 'dark' || 'light');
    setCurrentPath(window.location.pathname);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (scrollRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
        setShowScrollUp(scrollTop > 0);
        setShowScrollDown(scrollTop + clientHeight < scrollHeight);
      }
    };

    const scrollElement = scrollRef.current;
    if (scrollElement) {
      scrollElement.addEventListener('scroll', handleScroll);
      handleScroll(); // Initial check
    }

    return () => {
      if (scrollElement) {
        scrollElement.removeEventListener('scroll', handleScroll);
      }
    };
  }, []);

  const scrollToTop = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  };

  const setTheme = (theme: 'light' | 'dark') => {
    document.documentElement.setAttribute('data-theme', theme);
    setCurrentTheme(theme);
  };

  const getCurrentTheme = () => {
    return document.documentElement.getAttribute('data-theme') || 'light';
  };

  const handleNavigation = (path: string) => {
    router.push(path);
    setCurrentPath(path);
  };

  return (
    <div className="flex">
      {/* Sidebar - Fixed */}
      <div className={`fixed top-0 left-0 flex flex-col ${isExpanded ? 'w-64' : 'w-16'} h-full bg-base-300 border-r border-base-200 transition-all duration-300 ease-in-out`}>
        {/* Expander Button - Fixed at the top */}
        <div className="p-4 border-b border-base-200">
          <button
            onClick={toggleSidebar}
            className="btn btn-sm btn-primary"
          >
            {isExpanded ? (
              <lucideReact.ChevronLeft className="w-4 h-4 text-primary-content" />
            ) : (
              <lucideReact.ChevronRight className="w-4 h-4 text-primary-content" />
            )}
          </button>
        </div>

        {/* Scrollable Content with Chevron Indicators */}
        <div className="flex-1 overflow-hidden relative">
          {showScrollUp && (
            <div className="absolute top-0 left-0 right-0 flex justify-center">
              <button onClick={scrollToTop} className="btn btn-circle btn-sm">
                <lucideReact.ChevronUp className="w-4 h-4 text-white" />
              </button>
            </div>
          )}
          <div ref={scrollRef} className="flex flex-col space-y-2 overflow-y-auto custom-scrollbar-sidebar h-full">
            <div className="tooltip tooltip-right" data-tip="Manage Staff">
              <button
                className={`btn btn-ghost flex items-center justify-start w-full ${currentPath === '/manage-staff' ? 'btn-active' : ''}`}
                onClick={() => handleNavigation('/manage-staff')}
                title={!isExpanded ? "Manage Staff" : ""}
              >
                <lucideReact.Users className="w-5 h-5 text-primary" />
                {isExpanded && <span className="ml-2 text-base-content font-medium">Manage Staff</span>}
              </button>
            </div>
            <div className="tooltip tooltip-right" data-tip="Manage Student">
              <button
                className={`btn btn-ghost flex items-center justify-start w-full ${currentPath === '/manage-student' ? 'btn-active' : ''}`}
                onClick={() => handleNavigation('/manage-student')}
                title={!isExpanded ? "Manage Student" : ""}
              >
                <lucideReact.Contact className="w-5 h-5 text-success" />
                {isExpanded && <span className="ml-2 text-base-content font-medium">Manage Student</span>}
              </button>
            </div>
            <div className="tooltip tooltip-right" data-tip="Manage Course">
              <button
                className={`btn btn-ghost flex items-center justify-start w-full ${currentPath === '/manage-course' ? 'btn-active' : ''}`}
                onClick={() => handleNavigation('/manage-course')}
                title={!isExpanded ? "Manage Course" : ""}
              >
                <lucideReact.NotebookTabs className="w-5 h-5 text-accent" />
                {isExpanded && <span className="ml-2 text-base-content font-medium">Manage Course</span>}
              </button>
            </div>
            <div className="tooltip tooltip-right" data-tip="Manage Subject">
              <button
                className={`btn btn-ghost flex items-center justify-start w-full ${currentPath === '/manage-subject' ? 'btn-active' : ''}`}
                onClick={() => handleNavigation('/manage-subject')}
                title={!isExpanded ? "Manage Subject" : ""}
              >
                <lucideReact.Bookmark className="w-5 h-5 text-secondary" />
                {isExpanded && <span className="ml-2 text-base-content font-medium">Manage Subject</span>}
              </button>
            </div>
            <div className="tooltip tooltip-right" data-tip="Take Attendance">
              <button
                className={`btn btn-ghost flex items-center justify-start w-full ${currentPath === '/attendance/add' ? 'btn-active' : ''}`}
                onClick={() => handleNavigation('/attendance/add')}
                title={!isExpanded ? "Take Attendance" : ""}
              >
                <lucideReact.CalendarPlus2 className="w-5 h-5 text-warning" />
                {isExpanded && <span className="ml-2 text-base-content font-medium">Take Attendance</span>}
              </button>
            </div>
            <div className="tooltip tooltip-right" data-tip="View Attendance">
              <button
                className={`btn btn-ghost flex items-center justify-start w-full ${currentPath === '/attendance' ? 'btn-active' : ''}`}
                onClick={() => handleNavigation('/attendance')}
                title={!isExpanded ? "View Attendance" : ""}
              >
                <lucideReact.FileChartLine className="w-5 h-5 text-info" />
                {isExpanded && <span className="ml-2 text-base-content font-medium">View Attendance</span>}
              </button>
            </div>
            <div className="tooltip tooltip-right" data-tip="Apply Leave">
              <button
                className={`btn btn-ghost flex items-center justify-start w-full ${currentPath === '/manage-leave/add' ? 'btn-active' : ''}`}
                onClick={() => handleNavigation('/manage-leave/add')}
                title={!isExpanded ? "Apply Leave" : ""}
              >
                <lucideReact.DoorOpen className="w-5 h-5 text-amber-700" />
                {isExpanded && <span className="ml-2 text-base-content font-medium">Apply Leave</span>}
              </button>
            </div>
            <div className="tooltip tooltip-right" data-tip="View Leave">
              <button
                className={`btn btn-ghost flex items-center justify-start w-full ${currentPath === '/manage-leave' ? 'btn-active' : ''}`}
                onClick={() => handleNavigation('/manage-leave')}
                title={!isExpanded ? "View Leave" : ""}
              >
                <lucideReact.Sticker className="w-5 h-5 text-error" />
                {isExpanded && <span className="ml-2 text-base-content font-medium">View Leave</span>}
              </button>
            </div>
            <div className="tooltip tooltip-right" data-tip="Add Result">
              <button
                className={`btn btn-ghost flex items-center justify-start w-full ${currentPath === '/manage-result/add' ? 'btn-active' : ''}`}
                onClick={() => handleNavigation('/manage-result/add')}
                title={!isExpanded ? "Add Result" : ""}
              >
                <lucideReact.FilePenLine className="w-5 h-5 text-emerald-500" />
                {isExpanded && <span className="ml-2 text-base-content font-medium">Add Result</span>}
              </button>
            </div>
            <div className="tooltip tooltip-right" data-tip="View Result">
              <button
                className={`btn btn-ghost flex items-center justify-start w-full ${currentPath === '/manage-result' ? 'btn-active' : ''}`}
                onClick={() => handleNavigation('/manage-result')}
                title={!isExpanded ? "View Result" : ""}
              >
                <lucideReact.FileChartColumn className="w-5 h-5 text-purple-500" />
                {isExpanded && <span className="ml-2 text-base-content font-medium">View Result</span>}
              </button>
            </div>
          </div>
          {showScrollDown && (
            <div className="absolute bottom-0 left-0 right-0 flex justify-center">
              <button onClick={scrollToBottom} className="btn btn-circle btn-sm">
                <lucideReact.ChevronDown className="w-4 h-4 text-white" />
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        {isExpanded ? (
          <div className="p-4 border-t border-base-200">
            <Card className="bg-neutral-800 border-0 p-3 mb-3 hover:bg-neutral-700 transition-colors duration-200">
              <div className="flex items-center space-x-3">
                <img
                  src='/images/mayank.jpg'
                  alt="User"
                  className="w-8 h-8 rounded-full"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-white">Mayank Gupta</span>
                  </div>
                </div>
              </div>
            </Card>
            <div className="join w-full mb-3">
              <button
                onClick={() => setTheme('light')}
                className={`join-item btn flex-1 ${currentTheme === 'light' ? 'btn-active btn-neutral' : ''}`}
              >
                <lucideReact.Sun className="w-5 h-5 mr-2 text-warning" />
                Light
              </button>
              <button
                onClick={() => setTheme('dark')}
                className={`join-item btn flex-1 ${currentTheme === 'dark' ? 'btn-active btn-neutral' : ''}`}
              >
                <lucideReact.Moon className="w-5 h-5 text-neutral" />
                Dark
              </button>
            </div>
          </div>
        ) : (
          <div className="p-4 border-t border-base-200">
            <div className="flex flex-col items-center space-y-2">
              <div className="avatar">
                <div className="w-8 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                  <img src='/images/mayank.jpg' alt="User" />
                </div>
              </div>
              <button
                onClick={() => setTheme(currentTheme === 'light' ? 'dark' : 'light')}
                className="btn btn-ghost btn-circle"
              >
                {currentTheme === 'light' ? (
                  <lucideReact.Moon className="w-5 h-5 text-neutral" />
                ) : (
                  <lucideReact.Sun className="w-5 h-5 text-warning" />
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className={`flex-1 ${isExpanded ? 'ml-64' : 'ml-16'} overflow-y-auto transition-all duration-300 ease-in-out`}>
        {/* Main content goes here */}
      </div>
    </div>
  );
};

export default Sidebar;