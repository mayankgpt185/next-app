'use client'

import React from 'react';
import { Bell, MessageSquare, ShoppingBag } from 'lucide-react';
import { useSidebarStore } from '../store/useSidebarStore';

const Navbar = () => {
  const { isExpanded } = useSidebarStore();

  return (
    <div 
      className={`fixed top-0 bg-base-300 h-16 z-[999] transition-all duration-300 ease-in-out ${
        isExpanded ? 'left-64 w-[calc(100%-16rem)]' : 'left-16 w-[calc(100%-4rem)]'
      }`}
    >
      <div className="h-full px-4 flex items-center justify-end">
        {/* Right side - Icons */}
        <div className="flex items-center gap-4">
          {/* Messages */}
          <div className="dropdown dropdown-end">
            <button className="btn btn-ghost btn-circle">
              <div className="indicator">
                <MessageSquare className="w-5 h-5 text-primary" />
                <span className="badge badge-sm badge-primary indicator-item">8</span>
              </div>
            </button>
            <div className="dropdown-content z-[1] menu p-2 shadow bg-base-300 rounded-box w-52 border border-base-200">
              <div className="p-2 text-sm">
                <h3 className="font-semibold text-base-content">Messages</h3>
                <p className="text-xs text-base-content/70">You have 8 unread messages</p>
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div className="dropdown dropdown-end">
            <button className="btn btn-ghost btn-circle">
              <div className="indicator">
                <Bell className="w-5 h-5 text-success" />
                <span className="badge badge-sm badge-secondary indicator-item">3</span>
              </div>
            </button>
            <div className="dropdown-content z-[1] menu p-2 shadow bg-base-300 rounded-box w-52 border border-base-200">
              <div className="p-2 text-sm">
                <h3 className="font-semibold text-base-content">Notifications</h3>
                <p className="text-xs text-base-content/70">You have 3 unread notifications</p>
              </div>
            </div>
          </div>

          {/* Marketplace */}
          <div className="dropdown dropdown-end">
            <button className="btn btn-ghost btn-circle">
              <div className="indicator">
                <ShoppingBag className="w-5 h-5 text-accent" />
                <span className="badge badge-sm badge-accent indicator-item">5</span>
              </div>
            </button>
            <div className="dropdown-content z-[1] menu p-2 shadow bg-base-300 rounded-box w-52 border border-base-200">
              <div className="p-2 text-sm">
                <h3 className="font-semibold text-base-content">Marketplace</h3>
                <p className="text-xs text-base-content/70">You have 5 items in your cart</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
