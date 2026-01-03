import React, { useState, useEffect } from 'react';
import { db } from '../../firebase-setup/firebase';
import { collection, getDocs, addDoc, query, where, Timestamp } from 'firebase/firestore';
import Loader from '../Loader';
import { CheckCircle, XCircle, Save } from 'lucide-react';

const Attendance = () => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [attendanceData, setAttendanceData] = useState({});
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

    useEffect(() => {
        const fetchStudents = async () => {
            setLoading(true);
            try {
                // 1. Get UIDs of students who have registered for AT LEAST one course
                const registeredSnapshot = await getDocs(collection(db, "Registered-Course"));
                const enrolledStudentIds = new Set();
                registeredSnapshot.forEach(doc => {
                    const data = doc.data();
                    if (data.uid) enrolledStudentIds.add(data.uid);
                });

                // 2. Fetch all users and filter
                const querySnapshot = await getDocs(collection(db, "Users"));
                const users = [];
                querySnapshot.forEach((doc) => {
                    const data = doc.data();
                    // Check role AND if they are in the enrolled set
                    if ((data.role === 'student' || !data.role) && enrolledStudentIds.has(doc.id)) {
                        users.push({ id: doc.id, ...data });
                    }
                });
                setStudents(users);

                // Initialize attendance state
                const initial = {};
                users.forEach(u => initial[u.id] = 'present');
                setAttendanceData(initial);

            } catch (error) {
                console.error("Error fetching students:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchStudents();
    }, []);

    const handleAttendanceChange = (studentId, status) => {
        setAttendanceData(prev => ({
            ...prev,
            [studentId]: status
        }));
    };

    const submitAttendance = async () => {
        try {
            await addDoc(collection(db, "Attendance"), {
                date: date,
                records: attendanceData,
                timestamp: Timestamp.now()
            });
            alert("Attendance saved successfully!");
        } catch (error) {
            console.error(error);
            alert("Failed to save attendance");
        }
    };

    return (
        <div className="p-4">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Attendance Management</h2>
                <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-gray-700 focus:ring-2 focus:ring-indigo-500 outline-none"
                />
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th className="px-6 py-4 font-semibold text-gray-900">Student Name</th>
                            <th className="px-6 py-4 font-semibold text-gray-900">ID</th>
                            <th className="px-6 py-4 font-semibold text-gray-900 text-center">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {loading ? (
                            <tr><td colSpan="3" className="px-6 py-8"><Loader type="dots" /></td></tr>
                        ) : students.map(student => (
                            <tr key={student.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 font-medium">{student.firstname} {student.lastname}</td>
                                <td className="px-6 py-4 text-gray-500 text-sm">{student.id}</td>
                                <td className="px-6 py-4 flex justify-center gap-4">
                                    <button
                                        onClick={() => handleAttendanceChange(student.id, 'present')}
                                        className={`flex items-center gap-1 px-3 py-1.5 rounded-lg transition-colors ${attendanceData[student.id] === 'present'
                                            ? 'bg-green-100 text-green-700 ring-1 ring-green-500'
                                            : 'text-gray-400 hover:bg-gray-100'
                                            }`}
                                    >
                                        <CheckCircle size={18} /> Present
                                    </button>
                                    <button
                                        onClick={() => handleAttendanceChange(student.id, 'absent')}
                                        className={`flex items-center gap-1 px-3 py-1.5 rounded-lg transition-colors ${attendanceData[student.id] === 'absent'
                                            ? 'bg-red-100 text-red-700 ring-1 ring-red-500'
                                            : 'text-gray-400 hover:bg-gray-100'
                                            }`}
                                    >
                                        <XCircle size={18} /> Absent
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="mt-6 flex justify-end">
                <button
                    onClick={submitAttendance}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-indigo-100 transition-all active:translate-y-0.5 flex items-center gap-2"
                >
                    <Save size={20} />
                    Save Attendance
                </button>
            </div>
        </div>
    );
};

export default Attendance;
