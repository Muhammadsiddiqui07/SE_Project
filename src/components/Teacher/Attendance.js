import React, { useState, useEffect, useCallback } from 'react';
import { db } from '../../firebase-setup/firebase';
import { collection, getDocs, addDoc, query, where, Timestamp, deleteDoc, doc, updateDoc, orderBy, onSnapshot } from 'firebase/firestore';
import Loader from '../Loader';
import { useAuth } from '../../context/AuthContext';
import {
    CheckCircle,
    XCircle,
    Save,
    Calendar,
    Users,
    History,
    Search,
    Trash2,
    Edit3,
    ChevronLeft,
    AlertCircle
} from 'lucide-react';

const Attendance = () => {
    const { user } = useAuth();
    const [view, setView] = useState('mark'); // 'mark' | 'report'
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [attendanceData, setAttendanceData] = useState({});
    const [assignedCourse, setAssignedCourse] = useState(null);
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [attendanceHistory, setAttendanceHistory] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [summary, setSummary] = useState({ present: 0, absent: 0 });

    const fetchStudents = useCallback(async () => {
        if (!user?.id) return;
        setLoading(true);
        try {
            // 1. Fetch Assigned Course
            const coursesRef = collection(db, "Courses");
            const courseQuery = query(coursesRef, where("TeacherId", "==", user.id));
            const courseSnapshot = await getDocs(courseQuery);

            let subjectTitle = "";
            if (!courseSnapshot.empty) {
                const courseData = courseSnapshot.docs[0].data();
                setAssignedCourse({ id: courseSnapshot.docs[0].id, ...courseData });
                subjectTitle = courseData.CourseTitle;
            } else {
                setAssignedCourse(null);
            }

            // 2. Fetch enrolled students
            const registeredSnapshot = await getDocs(collection(db, "Registered-Course"));
            const enrolledStudentIds = new Set();
            registeredSnapshot.forEach(doc => {
                const data = doc.data();
                if (data.uid) enrolledStudentIds.add(data.uid);
            });

            const querySnapshot = await getDocs(collection(db, "Users"));
            const users = [];
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                if ((data.role === 'student' || !data.role) && enrolledStudentIds.has(doc.id)) {
                    users.push({ id: doc.id, ...data });
                }
            });
            setStudents(users);

            // Initial attendance state (all present)
            const initial = {};
            users.forEach(u => initial[u.id] = 'present');
            setAttendanceData(initial);
        } catch (error) {
            console.error("Error fetching students:", error);
        } finally {
            setLoading(false);
        }
    }, [user]);

    const fetchAttendanceByDate = useCallback(async (selectedDate) => {
        if (!assignedCourse) return;
        setLoading(true);
        try {
            const q = query(
                collection(db, "Attendance"),
                where("date", "==", selectedDate),
                where("subject", "==", assignedCourse.CourseTitle)
            );
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                const docData = querySnapshot.docs[0].data();
                setAttendanceData(docData.records);
                setEditingId(querySnapshot.docs[0].id);
            } else {
                // Reset to default (all present) if no record exists
                const initial = {};
                students.forEach(u => initial[u.id] = 'present');
                setAttendanceData(initial);
                setEditingId(null);
            }
        } catch (error) {
            console.error("Error fetching attendance for date:", error);
        } finally {
            setLoading(false);
        }
    }, [students, assignedCourse]);

    const fetchAttendanceHistory = async () => {
        setLoading(true);
        try {
            const q = query(collection(db, "Attendance"), orderBy("date", "desc"));
            const querySnapshot = await getDocs(q);
            const history = [];
            querySnapshot.forEach(doc => {
                history.push({ id: doc.id, ...doc.data() });
            });
            setAttendanceHistory(history);
        } catch (error) {
            console.error("Error fetching history:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStudents();
    }, [fetchStudents]);

    useEffect(() => {
        if (view === 'mark' && students.length > 0) {
            fetchAttendanceByDate(date);
        }
    }, [view, date, students.length, fetchAttendanceByDate]);

    // REAL-TIME LISTENER for history
    useEffect(() => {
        if (!user?.id || !assignedCourse) return;

        const q = query(
            collection(db, "Attendance"),
            where("subject", "==", assignedCourse.CourseTitle),
            orderBy("date", "desc")
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const history = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setAttendanceHistory(history);
        }, (error) => {
            console.error("Attendance history listener error:", error);
        });

        return () => unsubscribe();
    }, [user, assignedCourse]);

    useEffect(() => {
        const counts = Object.values(attendanceData).reduce(
            (acc, status) => {
                acc[status]++;
                return acc;
            },
            { present: 0, absent: 0 }
        );
        setSummary(counts);
    }, [attendanceData]);

    const handleAttendanceChange = (studentId, status) => {
        setAttendanceData(prev => ({ ...prev, [studentId]: status }));
    };

    const submitAttendance = async () => {
        setLoading(true);
        try {
            if (editingId) {
                await updateDoc(doc(db, "Attendance", editingId), {
                    records: attendanceData,
                    timestamp: Timestamp.now(),
                    subject: assignedCourse.CourseTitle,
                    teacherId: user.id
                });
            } else {
                await addDoc(collection(db, "Attendance"), {
                    date: date,
                    records: attendanceData,
                    timestamp: Timestamp.now(),
                    subject: assignedCourse.CourseTitle,
                    teacherId: user.id
                });
            }
            alert(editingId ? "Attendance updated successfully!" : "Attendance saved successfully!");
            if (view === 'report') {
                setView('report');
            }
        } catch (error) {
            console.error(error);
            alert("Failed to save attendance");
        } finally {
            setLoading(false);
        }
    };

    const deleteRecord = async (id) => {
        if (window.confirm("Are you sure you want to delete this attendance record?")) {
            setLoading(true);
            try {
                await deleteDoc(doc(db, "Attendance", id));
                setAttendanceHistory(prev => prev.filter(item => item.id !== id));
            } catch (error) {
                console.error("Error deleting record:", error);
                alert("Failed to delete record");
            } finally {
                setLoading(false);
            }
        }
    };

    const editRecord = (record) => {
        setDate(record.date);
        setAttendanceData(record.records);
        setEditingId(record.id);
        setView('mark');
    };

    const markAll = (status) => {
        const updated = {};
        students.forEach(s => updated[s.id] = status);
        setAttendanceData(updated);
    };

    const filteredHistory = attendanceHistory.filter(record =>
        record.date.includes(searchQuery) ||
        Object.keys(record.records).some(uid => {
            const student = students.find(s => s.id === uid);
            return student && `${student.firstname} ${student.lastname}`.toLowerCase().includes(searchQuery.toLowerCase());
        })
    );

    return (
        <div className="space-y-6">
            {/* Header with Navigation */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                        Attendance Management
                        {assignedCourse && <span className="text-indigo-600 ml-2 text-xl font-bold">({assignedCourse.CourseTitle})</span>}
                    </h2>
                    <p className="text-gray-500 mt-1">
                        {view === 'mark' ? 'Capture daily attendance for students' : 'Review and manage past attendance records'}
                    </p>
                </div>

                <div className="flex bg-gray-100 p-1 rounded-xl w-full md:w-auto">
                    <button
                        onClick={() => setView('mark')}
                        className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2 rounded-lg font-bold transition-all ${view === 'mark'
                            ? 'bg-white text-indigo-600 shadow-sm'
                            : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        <Calendar size={18} />
                        Mark
                    </button>
                    <button
                        onClick={() => setView('report')}
                        className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2 rounded-lg font-bold transition-all ${view === 'report'
                            ? 'bg-white text-indigo-600 shadow-sm'
                            : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        <History size={18} />
                        Reports
                    </button>
                </div>
            </div>

            {view === 'mark' ? (
                <div className="animate-fadeIn space-y-6">
                    {/* Controls & Summary */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col md:flex-row items-center gap-6">
                            <div className="flex flex-col gap-2 w-full md:w-auto">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Select Date</label>
                                <input
                                    type="date"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    className="border-2 border-gray-100 rounded-xl px-4 py-3 text-gray-700 focus:border-indigo-500 outline-none transition-colors font-semibold"
                                />
                            </div>
                            <div className="flex flex-wrap gap-2 w-full md:w-auto mt-4 md:mt-0">
                                <button
                                    onClick={() => markAll('present')}
                                    className="flex-1 md:flex-none px-4 py-2 border-2 border-green-50 text-green-600 rounded-lg hover:bg-green-50 font-bold transition-colors text-sm"
                                >
                                    Mark All Present
                                </button>
                                <button
                                    onClick={() => markAll('absent')}
                                    className="flex-1 md:flex-none px-4 py-2 border-2 border-red-50 text-red-600 rounded-lg hover:bg-red-50 font-bold transition-colors text-sm"
                                >
                                    Mark All Absent
                                </button>
                            </div>
                        </div>

                        <div className="bg-indigo-600 rounded-2xl p-6 text-white shadow-lg shadow-indigo-100 flex justify-around items-center">
                            <div className="text-center">
                                <p className="text-indigo-100 text-xs font-bold uppercase tracking-wider">Present</p>
                                <p className="text-3xl font-black">{summary.present}</p>
                            </div>
                            <div className="h-10 w-px bg-indigo-400 opacity-30"></div>
                            <div className="text-center">
                                <p className="text-indigo-100 text-xs font-bold uppercase tracking-wider">Absent</p>
                                <p className="text-3xl font-black">{summary.absent}</p>
                            </div>
                            <div className="h-10 w-px bg-indigo-400 opacity-30"></div>
                            <div className="text-center">
                                <p className="text-indigo-100 text-xs font-bold uppercase tracking-wider">Total</p>
                                <p className="text-3xl font-black">{students.length}</p>
                            </div>
                        </div>
                    </div>

                    {/* Students Table */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50/50 border-b border-gray-100">
                                    <tr>
                                        <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-wider">Student Name</th>
                                        <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-wider hidden md:table-cell">Student ID</th>
                                        <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-wider text-center">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {loading && students.length === 0 ? (
                                        <tr><td colSpan="3" className="px-8 py-12"><Loader type="dots" /></td></tr>
                                    ) : !assignedCourse ? (
                                        <tr>
                                            <td colSpan="3" className="px-8 py-12 text-center">
                                                <div className="flex flex-col items-center gap-2 text-red-500">
                                                    <AlertCircle size={48} strokeWidth={1} />
                                                    <p className="font-bold">No assigned course found. You cannot mark attendance.</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : students.length === 0 ? (
                                        <tr>
                                            <td colSpan="3" className="px-8 py-12 text-center">
                                                <div className="flex flex-col items-center gap-2 text-gray-400">
                                                    <Users size={48} strokeWidth={1} />
                                                    <p className="font-medium">No students enrolled found</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : students.map(student => (
                                        <tr key={student.id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-8 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold border border-indigo-100">
                                                        {student.firstname?.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-gray-900">{student.firstname} {student.lastname}</p>
                                                        <p className="text-xs text-gray-500 md:hidden">{student.id}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-4 text-gray-500 text-sm hidden md:table-cell font-mono">
                                                {student.id.substring(0, 12)}...
                                            </td>
                                            <td className="px-8 py-4">
                                                <div className="flex justify-center gap-2">
                                                    <button
                                                        onClick={() => handleAttendanceChange(student.id, 'present')}
                                                        className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all font-bold text-sm ${attendanceData[student.id] === 'present'
                                                            ? 'bg-green-500 text-white shadow-md shadow-green-100 ring-2 ring-green-500 ring-offset-2'
                                                            : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
                                                            }`}
                                                    >
                                                        <CheckCircle size={16} />
                                                        <span className="hidden sm:inline">Present</span>
                                                    </button>
                                                    <button
                                                        onClick={() => handleAttendanceChange(student.id, 'absent')}
                                                        className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all font-bold text-sm ${attendanceData[student.id] === 'absent'
                                                            ? 'bg-red-500 text-white shadow-md shadow-red-100 ring-2 ring-red-500 ring-offset-2'
                                                            : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
                                                            }`}
                                                    >
                                                        <XCircle size={16} />
                                                        <span className="hidden sm:inline">Absent</span>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="flex justify-end pt-4">
                        <button
                            onClick={submitAttendance}
                            disabled={loading}
                            className={`
                                flex items-center justify-center gap-3 px-10 py-4 rounded-2xl font-black text-white shadow-xl transition-all active:scale-95 min-w-[240px]
                                ${loading ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200'}
                            `}
                        >
                            {loading ? (
                                <>
                                    <Loader variant="button" size={20} />
                                    <span>Processing...</span>
                                </>
                            ) : (
                                <>
                                    <Save size={20} />
                                    <span>{editingId ? 'Update Attendance' : 'Save Attendance'}</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            ) : (
                /* History / Report View */
                <div className="animate-fadeIn space-y-6">
                    {/* Search and Filters */}
                    <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                placeholder="Search by date or student name..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-gray-50 border-transparent focus:bg-white focus:border-indigo-500 rounded-xl outline-none transition-all font-medium"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {loading && attendanceHistory.length === 0 ? (
                            <div className="col-span-full py-20"><Loader type="dots" /></div>
                        ) : filteredHistory.length === 0 ? (
                            <div className="col-span-full py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200 flex flex-col items-center text-gray-400">
                                <AlertCircle size={48} strokeWidth={1} />
                                <p className="mt-4 font-bold text-lg">No records found matching your search</p>
                            </div>
                        ) : (
                            filteredHistory.map((record) => {
                                const presentCount = Object.values(record.records).filter(s => s === 'present').length;
                                const total = Object.keys(record.records).length;
                                const percentage = Math.round((presentCount / total) * 100);

                                return (
                                    <div key={record.id} className="group bg-white rounded-3xl border border-gray-100 p-6 shadow-sm hover:shadow-xl hover:border-indigo-100 transition-all duration-300">
                                        <div className="flex justify-between items-start mb-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                                                    <Calendar size={24} />
                                                </div>
                                                <div>
                                                    <h3 className="font-black text-gray-900">{record.date}</h3>
                                                    <p className="text-xs text-indigo-500 font-bold uppercase tracking-widest">{record.subject || 'Academic Session'}</p>
                                                </div>
                                            </div>
                                            <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${percentage >= 75 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                                }`}>
                                                {percentage}% Avg.
                                            </div>
                                        </div>

                                        <div className="space-y-4 mb-6">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-500 font-medium">Students Present</span>
                                                <span className="font-bold text-gray-900">{presentCount} / {total}</span>
                                            </div>
                                            <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full transition-all duration-1000 ${percentage >= 75 ? 'bg-green-500' : 'bg-orange-500'}`}
                                                    style={{ width: `${percentage}%` }}
                                                ></div>
                                            </div>
                                        </div>

                                        <div className="flex gap-2 pt-4 border-t border-gray-50">
                                            <button
                                                onClick={() => editRecord(record)}
                                                className="flex-1 flex items-center justify-center gap-2 py-3 bg-gray-50 hover:bg-indigo-50 text-gray-600 hover:text-indigo-600 rounded-xl font-bold transition-all"
                                            >
                                                <Edit3 size={16} />
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => deleteRecord(record.id)}
                                                className="flex-1 flex items-center justify-center gap-2 py-3 bg-gray-50 hover:bg-red-50 text-gray-600 hover:text-red-600 rounded-xl font-bold transition-all"
                                            >
                                                <Trash2 size={16} />
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Attendance;
