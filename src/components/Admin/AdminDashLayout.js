import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LayoutDashboard, Users, BookOpen, LogOut, FileText, Menu, X } from 'lucide-react';
import AdminCourseView from './course';
import StdView from '../studentView';
import ShowContent from '../showContent';
import TeacherList from './TeacherList';

const AdminDashLayout = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // State for sidebar toggle on mobile
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Active tab state - could also be managed via URL routes for better UX
    const [activeTab, setActiveTab] = useState('courses');

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const menuItems = [
        { id: 'courses', label: 'Courses', icon: <BookOpen size={20} /> },
        { id: 'students', label: 'Students', icon: <Users size={20} /> },
        { id: 'teachers', label: 'Teachers', icon: <Users size={20} /> },
        { id: 'content', label: 'Content', icon: <FileText size={20} /> },
    ];

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-20 lg:hidden glass"
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
                            EL
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-gray-800 tracking-tight">E-Learning</h1>
                            <p className="text-xs text-gray-500 font-medium">Admin Portal</p>
                        </div>
                    </div>
                    <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-gray-500">
                        <X size={24} />
                    </button>
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
                            {/* Accent indicator for active state */}
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
                        className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200 text-sm font-medium active:translate-y-0.5"
                    >
                        <LogOut size={20} />
                        <span>Sign Out</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Header */}
                <header className="bg-white border-b border-gray-200 py-4 px-6 flex items-center justify-between shadow-sm z-10">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setIsSidebarOpen(true)}
                            className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                        >
                            <Menu size={24} />
                        </button>
                        <h2 className="text-xl font-semibold text-gray-800 capitalize">
                            {menuItems.find(i => i.id === activeTab)?.label} Overview
                        </h2>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold border border-indigo-200">
                            A
                        </div>
                    </div>
                </header>

                {/* Content Area */}
                <main className="flex-1 overflow-auto p-4 md:p-8">
                    <div className="max-w-7xl mx-auto">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 min-h-[500px] p-6 animate-fadeIn">
                            {activeTab === 'courses' && <AdminCourseView />}
                            {activeTab === 'students' && <StdView />}
                            {activeTab === 'teachers' && <TeacherList />}
                            {activeTab === 'content' && <ShowContent />}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default AdminDashLayout;
