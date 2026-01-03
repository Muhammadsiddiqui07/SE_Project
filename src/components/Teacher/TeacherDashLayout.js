import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ClipboardList, GraduationCap, FileBarChart, LogOut, Menu, X, FileText } from 'lucide-react';
import Attendance from './Attendance';
import MarksEntry from './MarksEntry';
import CourseContent from './CourseContent';

const TeacherDashLayout = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('attendance');

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const menuItems = [
        { id: 'attendance', label: 'Attendance', icon: <ClipboardList size={20} /> },
        { id: 'marks', label: 'Marks Entry', icon: <FileBarChart size={20} /> },
        { id: 'content', label: 'Course Content', icon: <FileText size={20} /> },
    ];

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-20 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
                fixed lg:relative z-30 w-64 h-full bg-white border-r border-gray-200 shadow-sm transition-transform duration-300 ease-in-out
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `}>
                <div className="p-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-200">
                            <GraduationCap size={24} />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-gray-800 tracking-tight">E-Learning</h1>
                            <p className="text-xs text-gray-500 font-medium">Teacher Portal</p>
                        </div>
                    </div>
                </div>

                <div className="px-6 mb-2">
                    <div className="bg-indigo-50 p-4 rounded-xl">
                        <p className="text-xs text-indigo-500 font-bold uppercase tracking-wider mb-1">Welcome Back</p>
                        <p className="text-sm font-bold text-indigo-900 truncate">{user?.firstname ? `${user.firstname} ${user.lastname}` : 'Teacher'}</p>
                    </div>
                </div>

                <nav className="px-3 py-4 space-y-1">
                    {menuItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => {
                                setActiveTab(item.id);
                                setIsSidebarOpen(false);
                            }}
                            className={`
                                w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200
                                ${activeTab === item.id
                                    ? 'bg-indigo-50 text-indigo-700 shadow-sm ring-1 ring-indigo-200'
                                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}
                            `}
                        >
                            {activeTab === item.id && (
                                <div className="absolute left-0 w-1 h-8 bg-indigo-600 rounded-r-full" />
                            )}
                            {item.icon}
                            <span>{item.label}</span>
                        </button>
                    ))}
                </nav>

                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-colors text-sm font-medium"
                    >
                        <LogOut size={20} />
                        <span>Sign Out</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <header className="bg-white border-b border-gray-200 py-4 px-6 flex items-center justify-between shadow-sm z-10">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setIsSidebarOpen(true)}
                            className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                        >
                            <Menu size={24} />
                        </button>
                        <h2 className="text-xl font-semibold text-gray-800 capitalize">
                            {menuItems.find(i => i.id === activeTab)?.label}
                        </h2>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold border border-indigo-200">
                        {user?.firstname?.charAt(0) || 'T'}
                    </div>
                </header>

                <main className="flex-1 overflow-auto p-4 md:p-8">
                    <div className="max-w-7xl mx-auto">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 min-h-[500px] p-6 animate-fadeIn">
                            {activeTab === 'attendance' && <Attendance />}
                            {activeTab === 'marks' && <MarksEntry />}
                            {activeTab === 'content' && <CourseContent />}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default TeacherDashLayout;
