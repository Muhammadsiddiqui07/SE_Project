import React, { useState, useEffect } from 'react';
import { Trash2, UserPlus, X } from 'lucide-react';
import Loader from './Loader';
import { db } from '../firebase-setup/firebase';
import { collection, getDocs, deleteDoc, doc, query, where, setDoc } from 'firebase/firestore';

const Modal = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-slideUp">
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-gray-800">{title}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <X size={20} />
                    </button>
                </div>
                <div className="p-6">
                    {children}
                </div>
            </div>
        </div>
    );
};

const StdTableView = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingId, setLoadingId] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [formData, setFormData] = useState({ firstname: '', lastname: '', email: '', id: '', password: '' });
    const [editId, setEditId] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");

    // Fetch users and their courses once on mount
    const fetchData = async () => {
        setLoading(true);
        try {
            const usersSnapshot = await getDocs(collection(db, "Users"));
            const usersData = [];
            usersSnapshot.forEach(doc => {
                const u = doc.data();
                if (u.role === 'student') {
                    usersData.push({ key: doc.id, ...u });
                }
            });

            const coursesSnapshot = await getDocs(collection(db, "Registered-Course"));
            const coursesData = coursesSnapshot.docs.map(doc => ({ key: doc.id, ...doc.data() }));

            const mergedData = usersData.map(user => {
                const userCourses = coursesData.filter(course => course.uid === user.key);
                return { ...user, courses: userCourses };
            });

            setData(mergedData);
        } catch (error) {
            console.error('Failed to fetch data', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleDeleteUser = async (id) => {
        if (!window.confirm("Are you sure you want to delete this student?")) return;
        setLoadingId(id);
        try {
            await deleteDoc(doc(db, "Users", id));
            const coursesQuery = query(collection(db, "Registered-Course"), where("uid", "==", id));
            const coursesSnapshot = await getDocs(coursesQuery);
            const deletePromises = coursesSnapshot.docs.map(docSnapshot =>
                deleteDoc(doc(db, "Registered-Course", docSnapshot.id))
            );
            await Promise.all(deletePromises);
            setData(prev => prev.filter(user => user.key !== id));
            alert('User and their courses deleted successfully');
        } catch (error) {
            console.error('Failed to delete user', error);
            alert('Failed to delete user');
        } finally {
            setLoadingId(null);
        }
    };

    const [isAdding, setIsAdding] = useState(false);

    const handleAddStudent = async (e) => {
        e.preventDefault();
        setIsAdding(true);
        try {
            await setDoc(doc(db, "Users", formData.id), {
                ...formData,
                role: 'student'
            });
            setIsModalOpen(false);
            fetchData();
            setFormData({ firstname: '', lastname: '', email: '', id: '', password: '' });
            alert("Student added successfully");
        } catch (error) {
            console.error("Error adding student", error);
            alert("Failed to add student");
        } finally {
            setIsAdding(false);
        }
    };

    const handleUpdateStudent = async (e) => {
        e.preventDefault();
        setIsAdding(true);
        try {
            await setDoc(doc(db, "Users", editId), {
                ...formData,
                role: 'student'
            }, { merge: true });
            setIsEditModalOpen(false);
            fetchData();
            setFormData({ firstname: '', lastname: '', email: '', id: '', password: '' });
            alert("Student updated successfully");
        } catch (error) {
            console.error("Error updating student", error);
            alert("Failed to update student");
        } finally {
            setIsAdding(false);
        }
    };

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const openEditModal = (student) => {
        setFormData({
            firstname: student.firstname,
            lastname: student.lastname,
            email: student.email,
            id: student.id,
            password: student.password
        });
        setEditId(student.key);
        setIsEditModalOpen(true);
    };

    const filteredData = data.filter(student =>
        student.firstname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.lastname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.id?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div>
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
                <h3 className="text-xl font-bold text-gray-800">Student Management</h3>
                <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <input
                            type="text"
                            placeholder="Search by name or ID..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                        </div>
                    </div>
                    <button
                        onClick={() => {
                            setFormData({ firstname: '', lastname: '', email: '', id: '', password: '' });
                            setIsModalOpen(true);
                        }}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl font-medium transition-colors flex items-center gap-2 shadow-sm whitespace-nowrap"
                    >
                        <UserPlus size={18} />
                        <span>Add Student</span>
                    </button>
                </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-600">
                        <thead className="bg-gray-50 text-gray-900 font-semibold border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4">First Name</th>
                                <th className="px-6 py-4">Email</th>
                                <th className="px-6 py-4">Courses</th>
                                <th className="px-6 py-4 text-center">ID</th>
                                <th className="px-6 py-4 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-8"><Loader type="dots" /></td>
                                </tr>
                            ) : filteredData.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-8 text-center text-gray-500">No students found.</td>
                                </tr>
                            ) : (
                                filteredData.map((record) => (
                                    <tr key={record.key} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-gray-900">{record.firstname}</td>
                                        <td className="px-6 py-4">{record.email}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-wrap gap-1">
                                                {record.courses && record.courses.map(course => (
                                                    <span key={course.key} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700">
                                                        {course.courseTitle}
                                                    </span>
                                                ))}
                                                {(!record.courses || record.courses.length === 0) && <span className="text-gray-400 text-xs italic">No courses</span>}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center font-mono text-xs text-gray-500">
                                            {record.id || 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => openEditModal(record)}
                                                    className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                                    title="Edit Student"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteUser(record.key)}
                                                    disabled={loadingId === record.key}
                                                    className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                                                    title="Delete Student"
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
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add New Student">
                <form onSubmit={handleAddStudent} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">First Name</label>
                            <input name="firstname" value={formData.firstname} onChange={handleChange} className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Last Name</label>
                            <input name="lastname" value={formData.lastname} onChange={handleChange} className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500" required />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Email</label>
                        <input name="email" type="email" value={formData.email} onChange={handleChange} className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Student ID</label>
                        <input name="id" value={formData.id} onChange={handleChange} className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Password</label>
                        <input name="password" value={formData.password} onChange={handleChange} className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500" required />
                    </div>
                    <button
                        type="submit"
                        disabled={isAdding}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-bold transition-all active:translate-y-0.5 shadow-lg"
                    >
                        {isAdding ? "Processing..." : "Create Student"}
                    </button>
                </form>
            </Modal>

            {/* Edit Modal */}
            <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Student">
                <form onSubmit={handleUpdateStudent} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">First Name</label>
                            <input name="firstname" value={formData.firstname} onChange={handleChange} className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Last Name</label>
                            <input name="lastname" value={formData.lastname} onChange={handleChange} className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500" required />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Email</label>
                        <input name="email" type="email" value={formData.email} onChange={handleChange} className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Student ID</label>
                        <input name="id" value={formData.id} onChange={handleChange} disabled className="w-full border rounded-lg px-3 py-2 bg-gray-50 text-gray-400" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Password</label>
                        <input name="password" value={formData.password} onChange={handleChange} className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500" required />
                    </div>
                    <button
                        type="submit"
                        disabled={isAdding}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-bold transition-all active:translate-y-0.5 shadow-lg"
                    >
                        {isAdding ? "Processing..." : "Update Student"}
                    </button>
                </form>
            </Modal>
        </div>
    );
};

export default StdTableView;
