import React, { useEffect, useState } from 'react';
import { db } from '../firebase-setup/firebase';
import { doc, getDoc, query, collection, getDocs, where, onSnapshot } from 'firebase/firestore';
import { User, Mail, Phone, Hash, Clock, CheckCircle, XCircle } from 'lucide-react';
import Loader from '../components/Loader';

function ProAndCourView({ user }) {
    const [data, setData] = useState({});
    const [registeredCourses, setRegisteredCourses] = useState([]);
    const [tableLoading, setTableLoading] = useState(false);
    const [attendanceStats, setAttendanceStats] = useState({ present: 0, absent: 0, percentage: 0 });
    const uid = user?.uid || localStorage.getItem('uid');

    useEffect(() => {
        const fetchUserData = async () => {
            if (uid) {
                try {
                    const docRef = doc(db, "Users", uid);
                    const docSnap = await getDoc(docRef);

                    if (docSnap.exists()) {
                        setData(docSnap.data());
                    } else {
                        console.log("No such document! Falling back to localStorage user if available.");
                        // Fallback logic could go here
                    }
                } catch (error) {
                    console.error("Error fetching document:", error);
                }
            }
        };

        fetchUserData();
    }, [uid]);

    useEffect(() => {
        if (!uid) return;
        const q = query(collection(db, "Attendance"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            let present = 0;
            let absent = 0;

            snapshot.forEach(doc => {
                const data = doc.data();
                if (data.records && data.records[uid]) {
                    if (data.records[uid] === 'present') present++;
                    else absent++;
                }
            });

            const total = present + absent;
            const percentage = total > 0 ? Math.round((present / total) * 100) : 0;
            setAttendanceStats({ present, absent, percentage });
        }, (error) => {
            console.error("Error with attendance stats listener:", error);
        });

        return () => unsubscribe();
    }, [uid]);

    useEffect(() => {
        if (!uid) return;
        setTableLoading(true);
        const q = query(collection(db, "Registered-Course"), where("uid", "==", uid));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const registeredCoursesData = [];
            snapshot.forEach((doc) => {
                const data = doc.data();
                registeredCoursesData.push({
                    key: doc.id,
                    Categories: data.CourseCategory,
                    Title: data.courseTitle,
                    Description: "Course Description"
                });
            });
            setRegisteredCourses(registeredCoursesData);
            setTableLoading(false);
        }, (err) => {
            console.error("Error with courses listener", err);
            setTableLoading(false);
        });

        return () => unsubscribe();
    }, [uid]);

    return (
        <div className="w-full space-y-6">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-indigo-700">Student Dashboard</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* ===== Attendance Summary Widget ===== */}
                <div className="md:col-span-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl p-6 text-white shadow-lg shadow-indigo-100 flex items-center justify-between">
                        <div>
                            <p className="text-indigo-100 text-xs font-bold uppercase tracking-wider mb-1">Attendance Rate</p>
                            <h4 className="text-3xl font-black">{attendanceStats.percentage}%</h4>
                        </div>
                        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                            <Clock size={24} />
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex items-center justify-between">
                        <div>
                            <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Days Present</p>
                            <h4 className="text-3xl font-black text-green-600">{attendanceStats.present}</h4>
                        </div>
                        <div className="w-12 h-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center">
                            <CheckCircle size={24} />
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex items-center justify-between">
                        <div>
                            <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Days Absent</p>
                            <h4 className="text-3xl font-black text-red-600">{attendanceStats.absent}</h4>
                        </div>
                        <div className="w-12 h-12 bg-red-50 text-red-600 rounded-xl flex items-center justify-center">
                            <XCircle size={24} />
                        </div>
                    </div>
                </div>

                {/* ===== Profile Card ===== */}
                <div className="md:col-span-1">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col items-center text-center">
                        <div className="relative mb-4">
                            <div className="w-28 h-28 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 border-4 border-indigo-50">
                                {data.imageUrl ? (
                                    <img
                                        src={data.imageUrl}
                                        alt="Profile"
                                        className="w-full h-full rounded-full object-cover"
                                    />
                                ) : (
                                    <User size={48} />
                                )}
                            </div>
                        </div>

                        <h3 className="text-xl font-bold text-gray-800 mb-1">
                            {user.firstname || "Student"} {user.lastname || ""}
                        </h3>
                        <p className="text-gray-500 text-sm mb-6 flex items-center gap-2 justify-center">
                            <Mail size={14} />
                            {user.email || "student@example.com"}
                        </p>

                        <div className="w-full space-y-3 text-left bg-gray-50 p-4 rounded-lg">
                            <div className="flex items-center gap-3 text-sm text-gray-600">
                                <Phone size={16} className="text-indigo-400" />
                                <div>
                                    <p className="text-xs text-gray-400 font-medium uppercase">Phone</p>
                                    <p>{user.phonenumber || "N/A"}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-gray-600 border-t border-gray-200 pt-3">
                                <Hash size={16} className="text-indigo-400" />
                                <div>
                                    <p className="text-xs text-gray-400 font-medium uppercase">User ID</p>
                                    <p title={uid}>{uid ? `${uid.slice(0, 8)}...` : "N/A"}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ===== Courses Table ===== */}
                <div className="md:col-span-2">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 h-full">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Registered Courses</h3>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm text-gray-600">
                                <thead className="bg-gray-50 text-gray-900 font-semibold border-b border-gray-100">
                                    <tr>
                                        <th className="px-6 py-4">Categories</th>
                                        <th className="px-6 py-4">Title</th>
                                        <th className="px-6 py-4">Description</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {tableLoading ? (
                                        <tr>
                                            <td colSpan="3" className="px-6 py-8"><Loader type="dots" /></td>
                                        </tr>
                                    ) : registeredCourses.length === 0 ? (
                                        <tr>
                                            <td colSpan="3" className="px-6 py-8 text-center text-gray-500">No courses registered yet.</td>
                                        </tr>
                                    ) : (
                                        registeredCourses.map((course) => (
                                            <tr key={course.key} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700">
                                                        {course.Categories}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 font-medium text-gray-900">{course.Title}</td>
                                                <td className="px-6 py-4 text-gray-500">{course.Description}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ProAndCourView;
