import React, { useEffect, useState } from 'react';
import { db } from '../firebase-setup/firebase';
import { collection, getDocs, query, where, addDoc } from 'firebase/firestore';
import { Plus, X, BookOpen } from 'lucide-react';
import Loader from './Loader';

const RegistrationForm = ({ user }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [categories, setCategories] = useState([]);
    const [courses, setCourses] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState("");
    const [selectedCourse, setSelectedCourse] = useState("");
    const [userData, setUserData] = useState(user);
    const [loading, setLoading] = useState(false);
    const [registeredCourses, setRegisteredCourses] = useState([]);
    const [tableLoading, setTableLoading] = useState(false);
    const uid = user?.uid || localStorage.getItem("uid");


    // Form inputs state
    const [formId, setFormId] = useState("");
    const [formEmail, setFormEmail] = useState("");

    const fetchRegisteredCourses = async () => {
        if (!uid) return;
        setTableLoading(true);
        try {
            const q = query(collection(db, "Registered-Course"), where("uid", "==", uid));
            const querySnapshot = await getDocs(q);
            const registeredCoursesData = [];

            querySnapshot.forEach((doc) => {
                const data = doc.data();
                registeredCoursesData.push({
                    key: doc.id,
                    Categories: data.CourseCategory,
                    Title: data.courseTitle,
                    Description: "Course Description"
                });
            });

            setRegisteredCourses(registeredCoursesData);
        } catch (e) {
            console.error(e);
        } finally {
            setTableLoading(false);
        }
    };

    const fetchUserData = async () => {
        if (uid) {
            const q = query(collection(db, "Users"), where("id", "==", uid)); // Note: checking 'id' field vs doc ID
            const querySnapshot = await getDocs(q);
            // If found by field 'id'
            if (!querySnapshot.empty) {
                querySnapshot.forEach((doc) => {
                    const data = doc.data();
                    setUserData(data);
                    setFormId(data.id || "");
                    setFormEmail(data.email || "");
                });
            } else {
                // Fallback: maybe uid IS the doc ID?
                // Not implementing complex fallback to keep original logic intent
            }
        }
    };

    const fetchCategories = async () => {
        const querySnapshot = await getDocs(collection(db, "Courses"));
        const uniqueCategories = new Set();
        querySnapshot.forEach((doc) => uniqueCategories.add(doc.data().CourseCategory));
        setCategories(Array.from(uniqueCategories));
    };

    const fetchCourses = async () => {
        if (!selectedCategory) {
            setCourses([]);
            setSelectedCourse("");
            return;
        }
        const q = query(collection(db, "Courses"), where("CourseCategory", "==", selectedCategory));
        const querySnapshot = await getDocs(q);
        const coursesData = [];
        querySnapshot.forEach((doc) => coursesData.push(doc.data().CourseTitle));
        setCourses(coursesData);
    };

    useEffect(() => {
        fetchUserData();
        fetchCategories();
        fetchRegisteredCourses();
    }, [uid]);

    useEffect(() => {
        fetchCourses();
    }, [selectedCategory]);

    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await addDoc(collection(db, "Registered-Course"), {
                CourseCategory: selectedCategory,
                courseTitle: selectedCourse,
                uid: uid,
                email: formEmail
            });
            setIsModalOpen(false);
            fetchRegisteredCourses();
            setSelectedCategory("");
            setSelectedCourse("");
            alert("Registered successfully!");
        } catch (e) {
            console.error(e);
            alert("Registration failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-indigo-700">Course Registration</h2>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors flex items-center gap-2 shadow-sm"
                >
                    <Plus size={20} />
                    Enroll New Course
                </button>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-slideUp">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h3 className="text-lg font-bold text-gray-800">Enroll in Course</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="p-6">
                            <form onSubmit={handleRegister} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Select Category</label>
                                    <select
                                        value={selectedCategory}
                                        onChange={(e) => setSelectedCategory(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                        required
                                    >
                                        <option value="">-- Choose Category --</option>
                                        {categories.map((cat, idx) => (
                                            <option key={idx} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Select Course</label>
                                    <select
                                        value={selectedCourse}
                                        onChange={(e) => setSelectedCourse(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                        required
                                        disabled={!selectedCategory}
                                    >
                                        <option value="">-- Choose Course --</option>
                                        {courses.map((c, idx) => (
                                            <option key={idx} value={c}>{c}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Your ID</label>
                                    <input
                                        type="text"
                                        value={formId}
                                        onChange={(e) => setFormId(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-gray-50"
                                        required
                                    // readOnly // Depending on requirement, ID might be editable
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                    <input
                                        type="email"
                                        value={formEmail}
                                        onChange={(e) => setFormEmail(e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-gray-50"
                                        required
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl transition-all active:translate-y-0.5 mt-4 flex justify-center items-center gap-2 shadow-lg shadow-indigo-100 disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    {loading ? (
                                        <>
                                            <Loader type="dots" />
                                            <span>Processing...</span>
                                        </>
                                    ) : (
                                        <span>Submit Registration</span>
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-800">Your Registered Courses</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-600">
                        <thead className="bg-gray-50 text-gray-900 font-semibold border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4">Title</th>
                                <th className="px-6 py-4">Category</th>
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
                                    <td colSpan="3" className="px-6 py-8 text-center text-gray-500">No courses found.</td>
                                </tr>
                            ) : (
                                registeredCourses.map((course) => (
                                    <tr key={course.key} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-gray-900 flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center">
                                                <BookOpen size={16} />
                                            </div>
                                            {course.Title}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                                                {course.Categories}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-500">{course.Description}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default RegistrationForm;
