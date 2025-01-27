'use client'
import React, { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { Card } from '../ui/Card';
const lucideReact = require('lucide-react');
const Sidebar = () => {
  // const [isCollapsed, setIsCollapsed] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const mainContainerClass = `flex h-screen ${theme === 'light' ? 'bg-gray-100' : 'bg-neutral-900'}`;
  const menuItemClass = `flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors duration-200 ${theme === 'light' ? 'bg-white hover:bg-gray-200 text-gray-800' : 'bg-neutral-800 hover:bg-neutral-700 text-white'}`;
  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleSidebar = () => {
    setIsExpanded(!isExpanded);
  };

  if (!mounted) return null;

  return (

    <div className={`flex h-screen ${theme === 'light' ? 'bg-white' : 'bg-neutral-900'}`}>

      {/* Narrow Sidebar - Fixed */}
      {!isExpanded && (
        <div className="w-16 bg-neutral-900 flex flex-col items-center py-4 border-r border-neutral-800 shrink-0">
          <div className="flex flex-col items-center space-y-6 flex-1">
            {/* Toggle button */}
            <button
              onClick={toggleSidebar}
              className="w-6 h-6 bg-neutral-800 rounded flex items-center justify-center text-neutral-400 hover:text-white transition-colors duration-200"
            >
              <lucideReact.ChevronRight className="w-4 h-4" />
            </button>

            <button className="p-2 rounded-lg hover:bg-neutral-800 transition-colors duration-200">
              <lucideReact.Users className="w-5 h-5 text-blue-500" />
            </button>
            <button className="p-2 rounded-lg hover:bg-neutral-800 transition-colors duration-200">
              <lucideReact.Contact className="w-5 h-5 text-green-500" />
            </button>
            <button className="p-2 rounded-lg hover:bg-neutral-800 transition-colors duration-200">
              <lucideReact.NotebookTabs className="w-5 h-5 text-pink-500" />
            </button>
            <button className="p-2 rounded-lg hover:bg-neutral-800 transition-colors duration-200">
              <lucideReact.Bookmark className="w-5 h-5 text-purple-500" />
            </button>
            <button className="p-2 rounded-lg hover:bg-neutral-800 transition-colors duration-200">
              <lucideReact.CalendarCog className="w-5 h-5 text-yellow-500" />
            </button>
            <button className="p-2 rounded-lg hover:bg-neutral-800 transition-colors duration-200">
              <lucideReact.FileChartLine className="w-5 h-5 text-cyan-500" />
            </button>
            <button className="p-2 rounded-lg hover:bg-neutral-800 transition-colors duration-200">
              <lucideReact.Sticker className="w-5 h-5 text-orange-500" />
            </button>
            <button className="p-2 rounded-lg hover:bg-neutral-800 transition-colors duration-200">
              <lucideReact.DoorOpen className="w-5 h-5 text-violet-500" />
            </button>
          </div>

          {/* Bottom section */}
          <div className="mt-auto flex flex-col items-center space-y-4">
            <div className="w-8 h-8 rounded-full overflow-hidden hover:ring-2 hover:ring-blue-500 transition-all duration-200">
              <img
                src='/images/mayank.jpg'
                alt="User"
                className="w-full h-full object-cover"
              />
            </div>
            <button className="w-8 h-8 bg-neutral-800 rounded-lg flex items-center justify-center hover:bg-neutral-700 transition-colors duration-200">
              <lucideReact.Plus className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Wide Sidebar - Scrollable */}
      {isExpanded && (
        <div className="w-64 bg-neutral-900 transition-all duration-300 ease-in-out flex flex-col shrink-0">
          {/* Fixed Header */}
          <div className="p-4 border-b border-neutral-800">
            <div className="flex items-center space-x-2">
              <button
                onClick={toggleSidebar}
                className="w-6 h-6 bg-neutral-800 rounded flex items-center justify-center text-neutral-400 hover:text-white transition-colors duration-200"
              >
                <lucideReact.ChevronLeft className="w-4 h-4" />
              </button>
              <div className="w-6 h-6 rounded-full bg-blue-500" />
              <span className="text-white text-lg font-semibold">Brainwave</span>
            </div>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            <div className="p-4 space-y-6">
              {/* Menu Items */}
              <div className="space-y-2">
                <div className={menuItemClass}>
                  <lucideReact.Users className="w-5 h-5 text-blue-500" />
                  <span className="text-white">Manage Staff</span>
                </div>
                <div className={menuItemClass}>
                  <lucideReact.UserPlus className="w-5 h-5 text-blue-500" />
                  <span className="text-white">Add Staff</span>
                </div>
                <div className="flex items-center space-x-3 px-3 py-2 bg-neutral-800 rounded-lg hover:bg-neutral-700 transition-colors duration-200">
                  <lucideReact.Contact className="w-5 h-5 text-green-500" />
                  <span className="text-white">Manage Student</span>
                </div>
                <div className="flex items-center space-x-3 px-3 py-2 bg-neutral-800 rounded-lg hover:bg-neutral-700 transition-colors duration-200">
                  <lucideReact.BookUser className="w-5 h-5 text-green-500" />
                  <span className="text-white">Add Student</span>
                </div>
                <div className="flex items-center space-x-3 px-3 py-2 bg-neutral-800 rounded-lg hover:bg-neutral-700 transition-colors duration-200">
                  <lucideReact.NotebookTabs className="w-5 h-5 text-pink-500" />
                  <span className="text-white">Manage Course</span>
                </div>
                <div className="flex items-center space-x-3 px-3 py-2 bg-neutral-800 rounded-lg hover:bg-neutral-700 transition-colors duration-200">
                  <lucideReact.BookmarkPlus className="w-5 h-5 text-pink-500" />
                  <span className="text-white">Add Course</span>
                </div>
                <div className="flex items-center space-x-3 px-3 py-2 bg-neutral-800 rounded-lg hover:bg-neutral-700 transition-colors duration-200">
                  <lucideReact.Bookmark className="w-5 h-5 text-purple-500" />
                  <span className="text-white">Manage Subject</span>
                </div>
                <div className="flex items-center space-x-3 px-3 py-2 bg-neutral-800 rounded-lg hover:bg-neutral-700 transition-colors duration-200">
                  <lucideReact.BookmarkCheck className="w-5 h-5 text-purple-500" />
                  <span className="text-white">Add Subject</span>
                </div>
                <div className="flex items-center space-x-3 px-3 py-2 bg-neutral-800 rounded-lg hover:bg-neutral-700 transition-colors duration-200">
                  <lucideReact.CalendarCog className="w-5 h-5 text-yellow-500" />
                  <span className="text-white">Manage Session</span>
                </div>
                <div className="flex items-center space-x-3 px-3 py-2 bg-neutral-800 rounded-lg hover:bg-neutral-700 transition-colors duration-200">
                  <lucideReact.CalendarCheck2 className="w-5 h-5 text-yellow-500" />
                  <span className="text-white">Add Session</span>
                </div>
                <div className="flex items-center space-x-3 px-3 py-2 bg-neutral-800 rounded-lg hover:bg-neutral-700 transition-colors duration-200">
                  <lucideReact.FileChartLine className="w-5 h-5 text-cyan-500" />
                  <span className="text-white">View Attendance</span>
                </div><div className="flex items-center space-x-3 px-3 py-2 bg-neutral-800 rounded-lg hover:bg-neutral-700 transition-colors duration-200">
                  <lucideReact.Sticker className="w-5 h-5 text-orange-500" />
                  <span className="text-white">Student Feedback</span>
                </div><div className="flex items-center space-x-3 px-3 py-2 bg-neutral-800 rounded-lg hover:bg-neutral-700 transition-colors duration-200">
                  <lucideReact.Sticker className="w-5 h-5 text-orange-500" />
                  <span className="text-white">Staff Feedback</span>
                </div><div className="flex items-center space-x-3 px-3 py-2 bg-neutral-800 rounded-lg hover:bg-neutral-700 transition-colors duration-200">
                  <lucideReact.DoorOpen className="w-5 h-5 text-violet-500" />
                  <span className="text-white">Student Leave</span>
                </div><div className="flex items-center space-x-3 px-3 py-2 bg-neutral-800 rounded-lg hover:bg-neutral-700 transition-colors duration-200">
                  <lucideReact.DoorOpen className="w-5 h-5 text-violet-500" />
                  <span className="text-white">Staff Leave</span>
                </div>

                {/* <div className="flex items-center space-x-3 px-3 py-2 text-neutral-400 hover:bg-neutral-800 rounded-lg transition-colors duration-200">
                <lucideReact.Search className="w-5 h-5" />
                <span>Search</span>
                <span className="ml-auto text-sm bg-neutral-800 px-2 py-0.5 rounded">⌘ F</span>
              </div>
              <div className="flex items-center space-x-3 px-3 py-2 text-neutral-400 hover:bg-neutral-800 rounded-lg transition-colors duration-200">
                <div className="w-5 h-5">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <path d="M3 9h18" />
                  </svg>
                </div>
                <span>Manage subscription</span>
              </div>
              <div className="flex items-center space-x-3 px-3 py-2 text-neutral-400 hover:bg-neutral-800 rounded-lg transition-colors duration-200">
                <lucideReact.Clock className="w-5 h-5" />
                <span>Updates & FAQ</span>
              </div>
              <div className="flex items-center space-x-3 px-3 py-2 text-neutral-400 hover:bg-neutral-800 rounded-lg transition-colors duration-200">
                <lucideReact.Settings className="w-5 h-5" />
                <span>Settings</span>
              </div> */}
              </div>
            </div>
          </div>

          {/* Fixed Footer */}
          <div className="p-4 border-t border-neutral-800">
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
                    {/* <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded">Free</span> */}
                  </div>
                  {/* <span className="text-sm text-neutral-400">tam@ui8.net</span> */}
                </div>
              </div>
            </Card>

            {/* <button className="w-full px-3 py-2 bg-neutral-800 text-neutral-400 rounded-lg hover:bg-neutral-700 transition-colors duration-200">
            Upgrade to Pro
          </button> */}

            {/* Theme Toggle */}
            <div className="flex items-center mt-3 bg-neutral-800 rounded-lg p-1">
              <button
                onClick={() => setTheme('light')}
                className={`flex-1 flex items-center justify-center space-x-2 py-1 px-3 rounded transition-colors duration-200 ${theme === 'light' ? 'bg-neutral-700 text-white' : 'text-neutral-400'
                  }`}
              >
                <lucideReact.Sun className="w-4 h-4" />
                <span>Light</span>
              </button>
              <button
                onClick={() => setTheme('dark')}
                className={`flex-1 flex items-center justify-center space-x-2 py-1 px-3 rounded transition-colors duration-200 ${theme === 'dark' ? 'bg-neutral-700 text-white' : 'text-neutral-400'
                  }`}
              >
                <lucideReact.Moon className="w-4 h-4" />
                <span>Dark</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #4a4a4a;
          border-radius: 3px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: #6b6b6b;
        }
      `}</style>
    </div>

  );

};

export default Sidebar;