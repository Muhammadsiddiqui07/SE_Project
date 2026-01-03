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
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [formData, setFormData] = useState({ firstname: '', lastname: '', email: '', id: '', password: '' });
    const [editId, setEditId] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");

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

    const handleUpdateTeacher = async (e) => {
        e.preventDefault();
        setIsAdding(true);
        try {
            await setDoc(doc(db, "Users", editId), {
                ...formData,
                role: 'teacher'
            }, { merge: true });
            setIsEditModalOpen(false);
            fetchTeachers();
            setFormData({ firstname: '', lastname: '', email: '', id: '', password: '' });
            alert("Teacher updated successfully");
        } catch (error) {
            console.error("Error updating teacher", error);
            alert("Failed to update teacher");
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

    const openEditModal = (teacher) => {
        setFormData({
            firstname: teacher.firstname,
            lastname: teacher.lastname,
            email: teacher.email,
            id: teacher.id,
            password: teacher.password
        });
        setEditId(teacher.key);
        setIsEditModalOpen(true);
    };

    const filteredTeachers = teachers.filter(t =>
        t.firstname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.lastname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div>
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
                <h3 className="text-xl font-bold text-gray-800">Teacher Management</h3>
                <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <input
                            type="text"
                            placeholder="Search by name, ID or email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
                        />
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                            <Search size={18} />
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
                        <span>Add Teacher</span>
                    </button>
                </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
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
                        ) : filteredTeachers.length === 0 ? (
                            <tr><td colSpan="4" className="px-6 py-8 text-center text-gray-500">No teachers found.</td></tr>
                        ) : (
                            filteredTeachers.map((t) => (
                                <tr key={t.key} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-gray-900">{t.firstname} {t.lastname}</td>
                                    <td className="px-6 py-4">{t.email}</td>
                                    <td className="px-6 py-4">{t.id}</td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => openEditModal(t)}
                                                className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                            >
                                                <Plus size={16} className="rotate-45" /> {/* Using Plus rotated as placeholder for Edit if Edit2 not imported */}
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                                            </button>
                                            <button
                                                onClick={() => handleDelete(t.key)}
                                                className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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

            {/* Add Modal */}
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
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-bold transition-all active:translate-y-0.5 shadow-lg shadow-indigo-100 disabled:opacity-70"
                    >
                        {isAdding ? "Processing..." : "Add Teacher"}
                    </button>
                </form>
            </Modal>

            {/* Edit Modal */}
            <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Teacher">
                <form onSubmit={handleUpdateTeacher} className="space-y-4">
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
                        <input name="id" value={formData.id} onChange={handleChange} disabled className="w-full border rounded-lg px-3 py-2 bg-gray-50 text-gray-400" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Password</label>
                        <input name="password" value={formData.password} onChange={handleChange} className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500" required />
                    </div>
                    <button
                        type="submit"
                        disabled={isAdding}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-bold transition-all active:translate-y-0.5 shadow-lg shadow-indigo-100 disabled:opacity-70"
                    >
                        {isAdding ? "Processing..." : "Update Teacher"}
                    </button>
                </form>
            </Modal>
        </div>
    );
};

export default TeacherList;
