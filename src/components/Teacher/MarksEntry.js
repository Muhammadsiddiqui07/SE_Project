import React, { useState, useEffect } from 'react';
import { db } from '../../firebase-setup/firebase';
import { collection, getDocs, addDoc, Timestamp } from 'firebase/firestore';
import Loader from '../Loader';
import { Save, Search } from 'lucide-react';

const MarksEntry = () => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [marksData, setMarksData] = useState({});
    const [examName, setExamName] = useState("Mid-Term Exam");

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
                    if ((data.role === 'student' || !data.role) && enrolledStudentIds.has(doc.id)) {
                        users.push({ id: doc.id, ...data });
                    }
                });
                setStudents(users);
            } catch (error) {
                console.error("Error fetching students:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStudents();
    }, []);

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
        try {
            await addDoc(collection(db, "ExamResults"), {
                examName,
                results: marksData,
                timestamp: Timestamp.now()
            });
            alert("Marks uploaded successfully!");
        } catch (error) {
            console.error(error);
            alert("Failed to upload marks");
        }
    };

    return (
        <div className="p-4">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Result Management</h2>
                <select
                    value={examName}
                    onChange={(e) => setExamName(e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 text-gray-700 focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                >
                    <option>Mid-Term Exam</option>
                    <option>Final Exam</option>
                    <option>Quiz 1</option>
                </select>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th className="px-6 py-4 font-semibold text-gray-900">Student Name</th>
                            <th className="px-6 py-4 font-semibold text-gray-900">Math</th>
                            <th className="px-6 py-4 font-semibold text-gray-900">Science</th>
                            <th className="px-6 py-4 font-semibold text-gray-900">English</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {loading ? (
                            <tr><td colSpan="4" className="px-6 py-8"><Loader type="dots" /></td></tr>
                        ) : students.map(student => (
                            <tr key={student.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 font-medium">{student.firstname} {student.lastname}</td>
                                <td className="px-6 py-4">
                                    <input
                                        type="number"
                                        className="w-20 border border-gray-200 rounded px-2 py-1 text-sm focus:border-indigo-500 outline-none"
                                        placeholder="0-100"
                                        onChange={(e) => handleMarkChange(student.id, 'Math', e.target.value)}
                                    />
                                </td>
                                <td className="px-6 py-4">
                                    <input
                                        type="number"
                                        className="w-20 border border-gray-200 rounded px-2 py-1 text-sm focus:border-indigo-500 outline-none"
                                        placeholder="0-100"
                                        onChange={(e) => handleMarkChange(student.id, 'Science', e.target.value)}
                                    />
                                </td>
                                <td className="px-6 py-4">
                                    <input
                                        type="number"
                                        className="w-20 border border-gray-200 rounded px-2 py-1 text-sm focus:border-indigo-500 outline-none"
                                        placeholder="0-100"
                                        onChange={(e) => handleMarkChange(student.id, 'English', e.target.value)}
                                    />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="mt-6 flex justify-end">
                <button
                    onClick={submitMarks}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-indigo-100 transition-all active:translate-y-0.5 flex items-center gap-2"
                >
                    <Save size={20} />
                    Publish Results
                </button>
            </div>
        </div>
    );
};

export default MarksEntry;
