import React, { useState, useEffect } from 'react';
import { db } from '../../firebase-setup/firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, Timestamp, query, where, onSnapshot } from 'firebase/firestore';
import Loader from '../Loader';
import { Save, Search, Book } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const MarksEntry = () => {
    const { user } = useAuth();
    const [students, setStudents] = useState([]);
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('entry'); // 'entry' or 'reports'
    const [marksData, setMarksData] = useState({});
    const [assignedCourse, setAssignedCourse] = useState(null);
    const [examName, setExamName] = useState("Mid-Term Exam");
    const [searchTerm, setSearchTerm] = useState("");
    const [editingResultId, setEditingResultId] = useState(null);

    const fetchData = async () => {
        if (!user?.id) return;
        setLoading(true);
        try {
            // 1. Fetch Assigned Course for this Teacher
            const coursesRef = collection(db, "Courses");
            const courseQuery = query(coursesRef, where("TeacherId", "==", user.id));
            const courseSnapshot = await getDocs(courseQuery);

            if (!courseSnapshot.empty) {
                const courseData = courseSnapshot.docs[0].data();
                setAssignedCourse({ id: courseSnapshot.docs[0].id, ...courseData });
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

            const usersSnapshot = await getDocs(collection(db, "Users"));
            const users = [];
            usersSnapshot.forEach((doc) => {
                const data = doc.data();
                if ((data.role === 'student' || !data.role) && enrolledStudentIds.has(doc.id)) {
                    users.push({ id: doc.id, ...data });
                }
            });
            setStudents(users);

        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();

        // 3. REAL-TIME LISTENER for Results
        const resultsRef = collection(db, "ExamResults");
        const unsubscribe = onSnapshot(resultsRef, (snapshot) => {
            const resultsData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                date: doc.data().timestamp?.toDate().toLocaleDateString() || 'N/A'
            }));
            // If teacher, maybe filter results to only show those published by them or relevant to their subject
            // For now, show all but we can filter by teacher UID if we store it in ExamResults
            setResults(resultsData);
        }, (error) => {
            console.error("Results listener error:", error);
        });

        return () => unsubscribe();
    }, [user]);

    const handleMarkChange = (studentId, subject, value) => {
        setMarksData(prev => ({
            ...prev,
            [studentId]: {
                ...prev[studentId],
                [subject]: value
            }
        }));
    };

    const submitMarks = async () => {
        if (Object.keys(marksData).length === 0) return alert("No marks entered");
        setLoading(true);
        try {
            if (editingResultId) {
                await updateDoc(doc(db, "ExamResults", editingResultId), {
                    results: marksData,
                    timestamp: Timestamp.now(),
                    teacherId: user.id,
                    subject: assignedCourse.CourseTitle
                });
                alert("Results updated successfully!");
                setEditingResultId(null);
            } else {
                await addDoc(collection(db, "ExamResults"), {
                    examName,
                    results: marksData,
                    timestamp: Timestamp.now(),
                    teacherId: user.id,
                    subject: assignedCourse.CourseTitle
                });
                alert("Results published successfully!");
            }
            setMarksData({});
            setActiveTab('reports');
            // fetchData(); // Not strictly needed due to onSnapshot, but fine
        } catch (error) {
            console.error(error);
            alert("Failed to save results");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteResult = async (id) => {
        if (!window.confirm("Delete this result record?")) return;
        try {
            await deleteDoc(doc(db, "ExamResults", id));
            setResults(prev => prev.filter(r => r.id !== id));
            alert("Result deleted");
        } catch (error) {
            console.error(error);
        }
    };

    const startEditing = (record) => {
        setEditingResultId(record.id);
        setExamName(record.examName);
        setMarksData(record.results || {});
        setActiveTab('entry');
    };

    const filteredResults = results.filter(r =>
        r.examName?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-2 md:p-4">
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Exam & Result Management</h2>
                    <p className="text-gray-500 text-sm mt-1">Manage student marks and generate reports</p>
                </div>

                <div className="flex bg-gray-100 p-1 rounded-xl">
                    <button
                        onClick={() => setActiveTab('entry')}
                        className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'entry' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Mark Entry
                    </button>
                    <button
                        onClick={() => setActiveTab('reports')}
                        className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'reports' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        History & Reports
                    </button>
                </div>
            </div>

            {activeTab === 'entry' ? (
                <div className="animate-fadeIn">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
                        <div className="flex flex-col md:flex-row items-center gap-6">
                            <div className="w-full md:w-1/3">
                                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">Select Examination</label>
                                <select
                                    disabled={editingResultId}
                                    value={examName}
                                    onChange={(e) => setExamName(e.target.value)}
                                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-gray-700 focus:ring-2 focus:ring-indigo-500 outline-none bg-gray-50 font-medium cursor-pointer"
                                >
                                    <option>Mid-Term Exam</option>
                                    <option>Final Exam</option>
                                    <option>Quiz 1</option>
                                    <option>Quiz 2</option>
                                    <option>Assignment 1</option>
                                </select>
                            </div>
                            <div className="flex-1">
                                <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 flex items-center gap-3">
                                    <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
                                        <Save size={20} />
                                    </div>
                                    <div>
                                        <p className="text-indigo-800 font-bold text-sm">{editingResultId ? 'Updating Record' : 'Create New Record'}</p>
                                        <p className="text-indigo-600/70 text-xs">Enter marks for all enrolled students below.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 border-b border-gray-100">
                                    <tr>
                                        <th className="px-6 py-4 font-bold text-gray-900 uppercase tracking-widest text-xs">Student</th>
                                        <th className="px-6 py-4 font-bold text-gray-900 uppercase tracking-widest text-xs">
                                            {assignedCourse ? assignedCourse.CourseTitle : 'Unassigned'}
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {!assignedCourse && !loading && (
                                        <tr><td colSpan="2" className="px-6 py-12 text-center text-red-500 font-bold italic">You are not assigned to any course. Please contact Admin.</td></tr>
                                    )}
                                    {loading ? (
                                        <tr><td colSpan="2" className="px-6 py-12"><Loader type="dots" /></td></tr>
                                    ) : (assignedCourse && students.length === 0) ? (
                                        <tr><td colSpan="2" className="px-6 py-12 text-center text-gray-400 font-medium italic">No students found associated with any course.</td></tr>
                                    ) : assignedCourse && students.map(student => (
                                        <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs capitalize">{student.firstname?.charAt(0)}</div>
                                                    <div>
                                                        <p className="font-bold text-gray-900 text-sm">{student.firstname} {student.lastname}</p>
                                                        <p className="text-xs text-gray-400 font-mono italic">ID: {student.id}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <input
                                                    type="number"
                                                    value={marksData[student.id]?.[assignedCourse.CourseTitle] || ''}
                                                    className="w-full max-w-[200px] border border-gray-200 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-shadow"
                                                    placeholder="0-100"
                                                    onChange={(e) => handleMarkChange(student.id, assignedCourse.CourseTitle, e.target.value)}
                                                />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="mt-8 flex justify-between items-center">
                        {editingResultId && (
                            <button
                                onClick={() => { setEditingResultId(null); setMarksData({}); }}
                                className="text-gray-500 hover:text-gray-700 font-bold text-sm"
                            >
                                Cancel Edit
                            </button>
                        )}
                        <div className="flex-1"></div>
                        <button
                            onClick={submitMarks}
                            disabled={loading || !assignedCourse}
                            className={`
                                flex items-center justify-center gap-3 px-10 py-4 rounded-2xl font-black text-white shadow-xl transition-all active:scale-95 min-w-[280px]
                                ${loading ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-100'}
                            `}
                        >
                            {loading ? (
                                <>
                                    <Loader variant="button" size={20} />
                                    <span>Publishing...</span>
                                </>
                            ) : (
                                <>
                                    <Save size={20} />
                                    <span>{editingResultId ? "Update Published Result" : "Publish Final Results"}</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            ) : (
                <div className="animate-fadeIn">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 mb-6">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search by Exam Name..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full md:w-96 pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                            />
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 border-b border-gray-100">
                                    <tr>
                                        <th className="px-6 py-4 font-bold text-gray-900 text-xs uppercase tracking-widest">Exam Name</th>
                                        <th className="px-6 py-4 font-bold text-gray-900 text-xs uppercase tracking-widest">Published On</th>
                                        <th className="px-6 py-4 font-bold text-gray-900 text-xs uppercase tracking-widest text-center">Students</th>
                                        <th className="px-6 py-4 font-bold text-gray-900 text-xs uppercase tracking-widest text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {loading ? (
                                        <tr><td colSpan="4" className="px-6 py-12"><Loader type="dots" /></td></tr>
                                    ) : filteredResults.length === 0 ? (
                                        <tr><td colSpan="4" className="px-6 py-12 text-center text-gray-400 font-medium">No results found match your search.</td></tr>
                                    ) : filteredResults.map(record => (
                                        <tr key={record.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 font-black text-gray-800">{record.examName}</td>
                                            <td className="px-6 py-4 text-sm text-gray-500 font-medium">{record.date}</td>
                                            <td className="px-6 py-4 text-center">
                                                <span className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold ring-1 ring-indigo-200">
                                                    {record.subject || 'Unknown'} • {Object.keys(record.results || {}).length} Students
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        onClick={() => startEditing(record)}
                                                        className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                                                        title="Edit Marks"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteResult(record.id)}
                                                        className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                                                        title="Delete Final Record"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MarksEntry;
