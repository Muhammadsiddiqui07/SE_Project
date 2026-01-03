import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Search, X } from 'lucide-react';
import AddCourse from './AddCourseForm';
// import UpdateCourse from './UpdateCourse'; // Temporarily disabled until refactored
import { db } from '../../firebase-setup/firebase';
import { getDocs, collection, setDoc, doc, deleteDoc } from 'firebase/firestore';
import Loader from '../Loader';

// Simple Modal Component
const Modal = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-slideUp">
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-gray-800">{title}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <X size={20} />
                    </button>
                </div>
                <div className="p-6 max-h-[80vh] overflow-y-auto">
                    {children}
                </div>
            </div>
        </div>
    );
};

const AdminCourseView = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoadingId, setActionLoadingId] = useState(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isAddLoading, setIsAddLoading] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editCourse, setEditCourse] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [teachers, setTeachers] = useState([]);

    const [editFormData, setEditFormData] = useState({
        Category: '',
        title: '',
        id: '',
        teacherName: '',
        teacherId: '',
        Seats: ''
    });

    // Fetch courses and teachers
    const fetchData = async () => {
        setLoading(true);
        try {
            // Fetch Courses
            const coursesSnapshot = await getDocs(collection(db, "Courses"));
            const coursesData = coursesSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setCourses(coursesData);

            // Fetch Teachers
            const teachersSnapshot = await getDocs(collection(db, "Users"));
            const teachersList = [];
            teachersSnapshot.forEach(doc => {
                if (doc.data().role === 'teacher') {
                    teachersList.push({ id: doc.id, ...doc.data() });
                }
            });
            setTeachers(teachersList);

        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Add Course
    const handleAddCourseSubmit = async (values) => {
        setIsAddLoading(true);
        try {
            const assignedTeacher = teachers.find(t => t.id === values.teacherName); // values.teacherName now contains the ID
            await setDoc(doc(db, "Courses", values.id), {
                CourseCategory: values.Category,
                CourseTitle: values.title,
                CourseId: values.id,
                TeacherName: assignedTeacher ? `${assignedTeacher.firstname} ${assignedTeacher.lastname}` : 'Unassigned',
                TeacherId: values.teacherName, // Store UID properly
                AvailableSeats: values.Seats
            });
            setIsAddModalOpen(false);
            fetchData();
            alert("Course added successfully!");
        } catch (error) {
            console.error("Error adding course:", error);
            alert("Failed to add course. " + error.message);
        } finally {
            setIsAddLoading(false);
        }
    };

    const handleUpdateCourse = async (e) => {
        e.preventDefault();
        setIsAddLoading(true);
        try {
            const assignedTeacher = teachers.find(t => t.id === editFormData.teacherId);
            await setDoc(doc(db, "Courses", editCourse.id), {
                CourseCategory: editFormData.Category,
                CourseTitle: editFormData.title,
                TeacherName: assignedTeacher ? `${assignedTeacher.firstname} ${assignedTeacher.lastname}` : 'Unassigned',
                TeacherId: editFormData.teacherId,
                AvailableSeats: editFormData.Seats
            }, { merge: true });
            setIsEditModalOpen(false);
            fetchData();
            alert("Course updated successfully!");
        } catch (error) {
            console.error("Error updating course:", error);
            alert("Failed to update course");
        } finally {
            setIsAddLoading(false);
        }
    };

    const openEditModal = (course) => {
        setEditCourse(course);
        setEditFormData({
            Category: course.CourseCategory || '',
            title: course.CourseTitle || '',
            id: course.id,
            teacherName: course.TeacherName || '',
            teacherId: course.TeacherId || '',
            Seats: course.AvailableSeats || ''
        });
        setIsEditModalOpen(true);
    };

    // Delete Course
    const handleDeleteCourse = async (id) => {
        if (!window.confirm("Are you sure you want to delete this course?")) return;

        setActionLoadingId(id);
        try {
            await deleteDoc(doc(db, "Courses", id));
            setCourses(prev => prev.filter(course => course.id !== id));
        } catch (error) {
            console.error("Error deleting course:", error);
            alert("Failed to delete course");
        } finally {
            setActionLoadingId(null);
        }
    };

    const filteredCourses = courses.filter(course =>
        course.CourseTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.TeacherName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.CourseId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.id?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const inputClasses = "w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none";
    const labelClasses = "block text-sm font-medium text-gray-700 mb-1";

    return (
        <div>
            {/* Header Actions */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
                <div className="relative w-full sm:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search courses..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                </div>
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl font-medium transition-all active:translate-y-0.5 flex items-center justify-center gap-2 shadow-lg shadow-indigo-100"
                >
                    <Plus size={18} />
                    <span>Add New Course</span>
                </button>
            </div>

            {/* Table */}
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-600">
                        <thead className="bg-gray-50 text-gray-900 font-semibold border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4">Course Info</th>
                                <th className="px-6 py-4">Category</th>
                                <th className="px-6 py-4">Teacher</th>
                                <th className="px-6 py-4 text-center">Seats</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-8">
                                        <Loader type="dots" />
                                    </td>
                                </tr>
                            ) : filteredCourses.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-8 text-center text-gray-500">No courses found.</td>
                                </tr>
                            ) : (
                                filteredCourses.map((course) => (
                                    <tr key={course.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div>
                                                <div className="font-bold text-gray-900">{course.CourseTitle}</div>
                                                <div className="text-xs text-gray-400 font-mono mt-0.5">ID: {course.id}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                                                {course.CourseCategory}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold">
                                                    {course.TeacherName?.charAt(0)}
                                                </div>
                                                {course.TeacherName}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="font-medium bg-gray-100 px-2 py-1 rounded text-xs">
                                                {course.AvailableSeats}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => openEditModal(course)}
                                                    className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                                >
                                                    <Edit2 size={16} />
                                                </button>

                                                <button
                                                    onClick={() => handleDeleteCourse(course.id)}
                                                    disabled={actionLoadingId === course.id}
                                                    className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add Modal */}
            <Modal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                title="Add New Course"
            >
                <AddCourse handleSubmit={handleAddCourseSubmit} isLoading={isAddLoading} teachers={teachers} />
            </Modal>

            {/* Edit Modal */}
            <Modal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                title="Edit Course"
            >
                <form onSubmit={handleUpdateCourse} className="space-y-4">
                    <div>
                        <label className={labelClasses}>Course ID</label>
                        <input type="text" value={editFormData.id} disabled className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-400" />
                    </div>
                    <div>
                        <label className={labelClasses}>Course Title</label>
                        <input
                            type="text"
                            required
                            value={editFormData.title}
                            onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                            className={inputClasses}
                        />
                    </div>
                    <div>
                        <label className={labelClasses}>Category</label>
                        <input
                            type="text"
                            required
                            value={editFormData.Category}
                            onChange={(e) => setEditFormData({ ...editFormData, Category: e.target.value })}
                            className={inputClasses}
                        />
                    </div>
                    <div>
                        <label className={labelClasses}>Teacher</label>
                        <select
                            required
                            value={editFormData.teacherId}
                            onChange={(e) => setEditFormData({ ...editFormData, teacherId: e.target.value })}
                            className={inputClasses}
                        >
                            <option value="">Select a Teacher</option>
                            {teachers.map(t => (
                                <option key={t.id} value={t.id}>
                                    {t.firstname} {t.lastname} ({t.id})
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className={labelClasses}>Available Seats</label>
                        <input
                            type="number"
                            required
                            value={editFormData.Seats}
                            onChange={(e) => setEditFormData({ ...editFormData, Seats: e.target.value })}
                            className={inputClasses}
                        />
                    </div>
                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={isAddLoading}
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-bold transition-all active:translate-y-0.5 shadow-lg"
                        >
                            {isAddLoading ? "Updating..." : "Update Course"}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default AdminCourseView;
