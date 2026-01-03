import React, { useState, useEffect } from 'react';
import { db } from '../firebase-setup/firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import Loader from './Loader';
import {
    Calendar,
    CheckCircle,
    XCircle,
    TrendingUp,
    Clock,
    Info
} from 'lucide-react';

const StudentAttendance = ({ user }) => {
    const [attendance, setAttendance] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ total: 0, present: 0, absent: 0, percentage: 0 });

    useEffect(() => {
        const fetchAttendance = async () => {
            if (!user?.uid) return;
            setLoading(true);
            try {
                const q = query(collection(db, "Attendance"), orderBy("date", "desc"));
                const querySnapshot = await getDocs(q);
                const records = [];
                let present = 0;
                let absent = 0;

                querySnapshot.forEach(doc => {
                    const data = doc.data();
                    if (data.records && data.records[user.uid]) {
                        const status = data.records[user.uid];
                        records.push({
                            id: doc.id,
                            date: data.date,
                            status: status
                        });
                        if (status === 'present') present++;
                        else absent++;
                    }
                });

                setAttendance(records);
                const total = records.length;
                const percentage = total > 0 ? Math.round((present / total) * 100) : 0;
                setStats({ total, present, absent, percentage });

            } catch (error) {
                console.error("Error fetching student attendance:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchAttendance();
    }, [user?.uid]);

    if (loading) return <div className="py-20"><Loader type="dots" /></div>;

    return (
        <div className="space-y-8 animate-fadeIn">
            <div>
                <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Your Attendance</h2>
                <p className="text-gray-500 mt-1">Track your daily presence and overall performance</p>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col items-center">
                    <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-4">
                        <Calendar size={24} />
                    </div>
                    <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Total Classes</p>
                    <p className="text-3xl font-black text-gray-900 mt-1">{stats.total}</p>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col items-center">
                    <div className="w-12 h-12 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center mb-4">
                        <CheckCircle size={24} />
                    </div>
                    <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Present</p>
                    <p className="text-3xl font-black text-green-600 mt-1">{stats.present}</p>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col items-center">
                    <div className="w-12 h-12 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mb-4">
                        <XCircle size={24} />
                    </div>
                    <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Absent</p>
                    <p className="text-3xl font-black text-red-600 mt-1">{stats.absent}</p>
                </div>

                <div className="bg-indigo-600 p-6 rounded-3xl shadow-lg shadow-indigo-100 flex flex-col items-center text-white">
                    <div className="w-12 h-12 bg-indigo-500 text-white rounded-2xl flex items-center justify-center mb-4">
                        <TrendingUp size={24} />
                    </div>
                    <p className="text-indigo-100 text-xs font-bold uppercase tracking-wider">Attendance Rate</p>
                    <p className="text-3xl font-black mt-1">{stats.percentage}%</p>
                </div>
            </div>

            {/* History Table */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-50 flex items-center gap-2">
                    <Clock size={20} className="text-gray-400" />
                    <h3 className="font-black text-gray-900">Attendance Log</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50/50">
                            <tr>
                                <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-wider">Date</th>
                                <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-wider">Day</th>
                                <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-wider text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {attendance.length === 0 ? (
                                <tr>
                                    <td colSpan="3" className="px-8 py-20 text-center text-gray-400 font-medium">
                                        <div className="flex flex-col items-center gap-3">
                                            <Info size={40} strokeWidth={1.5} />
                                            <p>No attendance records available yet.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : attendance.map((record) => {
                                const dateObj = new Date(record.date);
                                const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'long' });

                                return (
                                    <tr key={record.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-8 py-5 font-black text-gray-900">{record.date}</td>
                                        <td className="px-8 py-5 text-gray-500 font-medium">{dayName}</td>
                                        <td className="px-8 py-5">
                                            <div className="flex justify-center">
                                                <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest ${record.status === 'present'
                                                        ? 'bg-green-100 text-green-700 ring-1 ring-green-200'
                                                        : 'bg-red-100 text-red-700 ring-1 ring-red-200'
                                                    }`}>
                                                    {record.status}
                                                </span>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default StudentAttendance;
