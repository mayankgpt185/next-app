'use client';

import React, { useEffect, useState } from 'react';
import Sidebar from '../components/sidebar/sidebar';
import Navbar from '../components/navbar/navbar';
export default function ManageLeaveLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return null;
    }

    return (
        <div className="flex min-h-screen bg-gray-100 dark:bg-neutral-900">
            <Sidebar />
            <div className="flex-1">
                <Navbar />
                <main className="min-h-screen pt-16">
                    {children}
                </main>
            </div>
        </div>
    );
}