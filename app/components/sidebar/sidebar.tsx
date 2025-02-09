'use client'
import React, { useState, useEffect } from 'react';
import { Card } from '../ui/card';
const lucideReact = require('lucide-react');

const Sidebar = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentTheme, setCurrentTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    // Initialize theme state
    setCurrentTheme(document.documentElement.getAttribute('data-theme') as 'light' | 'dark' || 'light');
  }, []);

  const toggleSidebar = () => {
    setIsExpanded(!isExpanded);
  };

  const setTheme = (theme: 'light' | 'dark') => {
    document.documentElement.setAttribute('data-theme', theme);
    setCurrentTheme(theme);
  };

  const getCurrentTheme = () => {
    return document.documentElement.getAttribute('data-theme') || 'light';
  };

  return (
    <div className="flex h-screen">
      {/* Narrow Sidebar - Fixed */}
      {!isExpanded && (
        <div className="w-16 bg-base-300 flex flex-col items-center py-4 border-r border-base-200 shrink-0 transition-colors duration-300 ease-in-out">
          <div className="flex flex-col items-center space-y-6 flex-1">
            {/* Toggle button */}
            <button
              onClick={toggleSidebar}
              className="btn btn-sm btn-neutral btn-circle"
            >
              <lucideReact.ChevronRight className="w-4 h-4 text-base-content" />
            </button>

            <button className="btn btn-ghost btn-circle">
              <lucideReact.Users className="w-5 h-5 text-primary" />
            </button>
            <button className="btn btn-ghost btn-circle">
              <lucideReact.Contact className="w-5 h-5 text-success" />
            </button>
            <button className="btn btn-ghost btn-circle">
              <lucideReact.NotebookTabs className="w-5 h-5 text-accent" />
            </button>
            <button className="btn btn-ghost btn-circle">
              <lucideReact.Bookmark className="w-5 h-5 text-secondary" />
            </button>
            <button className="btn btn-ghost btn-circle">
              <lucideReact.CalendarCog className="w-5 h-5 text-warning" />
            </button>
            <button className="btn btn-ghost btn-circle">
              <lucideReact.FileChartLine className="w-5 h-5 text-info" />
            </button>
            <button className="btn btn-ghost btn-circle">
              <lucideReact.Sticker className="w-5 h-5 text-error" />
            </button>
            <button className="btn btn-ghost btn-circle">
              <lucideReact.DoorOpen className="w-5 h-5 text-neutral" />
            </button>
          </div>

          {/* Bottom section */}
          <div className="mt-auto flex flex-col items-center space-y-4">
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

      {/* Wide Sidebar - Scrollable */}
      {isExpanded && (
        <div className="w-64 bg-base-300 flex flex-col shrink-0">
          {/* Fixed Header */}
          <div className="p-4 border-b border-base-200">
            <div className="flex items-center space-x-2">
              <button
                onClick={toggleSidebar}
                className="btn btn-sm btn-neutral btn-circle"
              >
                <lucideReact.ChevronLeft className="w-4 h-4 text-base-content" />
              </button>
              <div className="badge badge-primary">CJS</div>
            </div>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto">
            <ul className="menu p-4 text-base-content">
              <li>
                <a className="flex items-center space-x-3">
                  <lucideReact.Users className="w-5 h-5 text-primary" />
                  <span>Manage Staff</span>
                </a>
              </li>
              <li>
                <a className="flex items-center space-x-3">
                  <lucideReact.Contact className="w-5 h-5 text-success" />
                  <span>Manage Student</span>
                </a>
              </li>
              <li>
                <a className="flex items-center space-x-3">
                  <lucideReact.NotebookTabs className="w-5 h-5 text-accent" />
                  <span>Manage Course</span>
                </a>
              </li>
              <li>
                <a className="flex items-center space-x-3">
                  <lucideReact.Bookmark className="w-5 h-5 text-secondary" />
                  <span>Manage Subject</span>
                </a>
              </li>
              <li>
                <a className="flex items-center space-x-3">
                  <lucideReact.CalendarCog className="w-5 h-5 text-warning" />
                  <span>Manage Session</span>
                </a>
              </li>
              <li>
                <a className="flex items-center space-x-3">
                  <lucideReact.FileChartLine className="w-5 h-5 text-info" />
                  <span>View Attendance</span>
                </a>
              </li>
              <li>
                <a className="flex items-center space-x-3">
                  <lucideReact.Sticker className="w-5 h-5 text-error" />
                  <span>Feedback</span>
                </a>
              </li>
              <li>
                <a className="flex items-center space-x-3">
                  <lucideReact.DoorOpen className="w-5 h-5 text-neutral" />
                  <span>Leave</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Fixed Footer */}
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
        </div>
      )}
    </div>
  );
};

export default Sidebar;