'use client'
import React, { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { useRouter } from 'next/navigation';
import { useSidebarStore } from '../store/useSidebarStore';
const lucideReact = require('lucide-react');

const Sidebar = () => {
  const router = useRouter();
  const { isExpanded, toggleSidebar } = useSidebarStore();
  const [currentTheme, setCurrentTheme] = useState<'light' | 'dark'>('light');
  const [currentPath, setCurrentPath] = useState('');

  useEffect(() => {
    // Initialize theme state
    setCurrentTheme(document.documentElement.getAttribute('data-theme') as 'light' | 'dark' || 'light');
    setCurrentPath(window.location.pathname);
  }, []);

  // const toggleSidebar = () => {
  //   setIsExpanded(!isExpanded);
  // };

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
    <div className="flex h-screen">
      {/* Sidebar - Fixed */}
      <div className={`flex flex-col ${isExpanded ? 'w-64' : 'w-16'} h-full bg-base-300 border-r border-base-200 shrink-0 transition-all duration-300 ease-in-out`}>
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

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar-sidebar">
          <div className="flex flex-col items-center space-y-4">
            <div className="tooltip tooltip-right" data-tip="Manage Staff">
              <button
                className={`btn btn-ghost btn-circle ${currentPath === '/manage-staff' ? 'btn-active' : ''}`}
                onClick={() => handleNavigation('/manage-staff')}
              >
                <lucideReact.Users className="w-5 h-5 text-primary" />
              </button>
            </div>
            <div className="tooltip tooltip-right" data-tip="Manage Student">
              <button
                className={`btn btn-ghost btn-circle ${currentPath === '/manage-student' ? 'btn-active' : ''}`}
                onClick={() => handleNavigation('/manage-student')}
              >
                <lucideReact.Contact className="w-5 h-5 text-success" />
              </button>
            </div>
            <div className="tooltip tooltip-right" data-tip="Manage Course">
              <button
                className={`btn btn-ghost btn-circle ${currentPath === '/manage-course' ? 'btn-active' : ''}`}
                onClick={() => handleNavigation('/manage-course')}
              >
                <lucideReact.NotebookTabs className="w-5 h-5 text-accent" />
              </button>
            </div>
            <div className="tooltip tooltip-right" data-tip="Manage Subject">
              <button
                className={`btn btn-ghost btn-circle ${currentPath === '/manage-subject' ? 'btn-active' : ''}`}
                onClick={() => handleNavigation('/manage-subject')}
              >
                <lucideReact.Bookmark className="w-5 h-5 text-secondary" />
              </button>
            </div>
            <div className="tooltip tooltip-right" data-tip="Take Attendance">
              <button
                className={`btn btn-ghost btn-circle ${currentPath === '/attendance/add' ? 'btn-active' : ''}`}
                onClick={() => handleNavigation('/attendance/add')}
              >
                <lucideReact.CalendarPlus2 className="w-5 h-5 text-warning" />
              </button>
            </div>
            <div className="tooltip tooltip-right" data-tip="View Attendance">
              <button
                className={`btn btn-ghost btn-circle ${currentPath === '/attendance' ? 'btn-active' : ''}`}
                onClick={() => handleNavigation('/attendance')}
              >
                <lucideReact.FileChartLine className="w-5 h-5 text-info" />
              </button>
            </div>
            <div className="tooltip tooltip-right" data-tip="Apply Leave">
              <button
                className={`btn btn-ghost btn-circle ${currentPath === '/manage-leave/add' ? 'btn-active' : ''}`}
                onClick={() => handleNavigation('/manage-leave/add')}
              >
                <lucideReact.DoorOpen className="w-5 h-5 text-amber-700" />
              </button>
            </div>
            <div className="tooltip tooltip-right" data-tip="View Leave">
              <button
                className={`btn btn-ghost btn-circle ${currentPath === '/manage-leave' ? 'btn-active' : ''}`}
                onClick={() => handleNavigation('/manage-leave')}
              >
                <lucideReact.Sticker className="w-5 h-5 text-error" />
              </button>
            </div>
            <div className="tooltip tooltip-right" data-tip="Add Result">
              <button
                className={`btn btn-ghost btn-circle ${currentPath === '/manage-result/add' ? 'btn-active' : ''}`}
                onClick={() => handleNavigation('/manage-result/add')}
              >
                <lucideReact.FilePenLine className="w-5 h-5 text-emerald-500" />
              </button>
            </div>
            <div className="tooltip tooltip-right" data-tip="View Result">
              <button
                className={`btn btn-ghost btn-circle ${currentPath === '/manage-result' ? 'btn-active' : ''}`}
                onClick={() => handleNavigation('/manage-result')}
              >
                <lucideReact.FileChartColumn className="w-5 h-5 text-purple-500" />
              </button>
            </div>
          </div>
        </div>

        {/* Theme Change Button - Fixed at the bottom */}
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
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Main content goes here */}
      </div>
    </div>
  );
};

export default Sidebar;