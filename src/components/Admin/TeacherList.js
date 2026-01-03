import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Search, UserPlus, X } from 'lucide-react';
import { db } from '../../firebase-setup/firebase';
import { getDocs, collection, setDoc, doc, deleteDoc } from 'firebase/firestore';
import Loader from '../Loader';

const Modal = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-slideUp">
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-gray-800">{title}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
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

const TeacherList = () => {
    const [teachers, setTeachers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({ firstname: '', lastname: '', email: '', id: '', password: '' });

    const fetchTeachers = async () => {
        setLoading(true);
        try {
            const querySnapshot = await getDocs(collection(db, "Users"));
            const data = [];
            querySnapshot.forEach((doc) => {
                const userData = doc.data();
                if (userData.role === 'teacher') {
                    data.push({ key: doc.id, ...userData });
                }
            });
            setTeachers(data);
        } catch (error) {
            console.error("Error fetching teachers", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTeachers();
    }, []);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const [isAdding, setIsAdding] = useState(false);

    const handleAddTeacher = async (e) => {
        e.preventDefault();
        setIsAdding(true);
        try {
            // Note: In real app, create user in Auth. using setDoc with custom ID here based on input ID
            await setDoc(doc(db, "Users", formData.id), {
                ...formData,
                role: 'teacher'
            });
            setIsModalOpen(false);
            fetchTeachers();
            setFormData({ firstname: '', lastname: '', email: '', id: '', password: '' });
            alert("Teacher added successfully");
        } catch (error) {
            console.error("Error adding teacher", error);
            alert("Failed to add teacher");
        } finally {
            setIsAdding(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this teacher?")) return;
        try {
            await deleteDoc(doc(db, "Users", id));
            setTeachers(prev => prev.filter(t => t.key !== id));
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-800">Teacher Management</h3>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl font-medium transition-colors flex items-center gap-2 shadow-sm"
                >
                    <UserPlus size={18} />
                    <span>Add Teacher</span>
                </button>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-sm text-gray-600">
                    <thead className="bg-gray-50 text-gray-900 font-semibold border-b border-gray-100">
                        <tr>
                            <th className="px-6 py-4">Name</th>
                            <th className="px-6 py-4">Email</th>
                            <th className="px-6 py-4">ID</th>
                            <th className="px-6 py-4 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {loading ? (
                            <tr><td colSpan="4" className="px-6 py-8"><Loader type="dots" /></td></tr>
                        ) : teachers.length === 0 ? (
                            <tr><td colSpan="4" className="px-6 py-8 text-center text-gray-500">No teachers found.</td></tr>
                        ) : (
                            teachers.map((t) => (
                                <tr key={t.key} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 font-medium text-gray-900">{t.firstname} {t.lastname}</td>
                                    <td className="px-6 py-4">{t.email}</td>
                                    <td className="px-6 py-4">{t.id}</td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => handleDelete(t.key)}
                                            className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add New Teacher">
                <form onSubmit={handleAddTeacher} className="space-y-4">
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
                        <label className="block text-sm font-medium mb-1">Teacher ID</label>
                        <input name="id" value={formData.id} onChange={handleChange} className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Password</label>
                        <input name="password" value={formData.password} onChange={handleChange} className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500" required placeholder="Assign Password" />
                    </div>
                    <button
                        type="submit"
                        disabled={isAdding}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-bold transition-all active:translate-y-0.5 flex justify-center items-center gap-2 shadow-lg shadow-indigo-100 disabled:opacity-70"
                    >
                        {isAdding ? <Loader type="dots" /> : "Add Teacher"}
                    </button>
                </form>
            </Modal>
        </div>
    );
};

export default TeacherList;
