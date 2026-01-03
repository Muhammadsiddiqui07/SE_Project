import React, { useState, useEffect } from 'react';
import { db } from '../../firebase-setup/firebase';
import { collection, getDocs, addDoc, query, where, Timestamp } from 'firebase/firestore';
import Loader from '../Loader';
import { useAuth } from '../../context/AuthContext';
import { FileText, Link as LinkIcon, Save, Video, Youtube } from 'lucide-react';

const CourseContent = () => {
    const { user } = useAuth();
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);

    // Form state
    const [selectedCourseId, setSelectedCourseId] = useState('');
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [link, setLink] = useState('');
    const [contentType, setContentType] = useState('video'); // video, note, assignment

    useEffect(() => {
        const fetchTeacherCourses = async () => {
            setLoading(true);
            try {
                // Fetch courses where TeacherName matches current user name
                // Note: This relies on name matching, which is fragile but fits current data model
                // Ideally we should match by User UID stored in course

                // Get all courses first
                const coursesSnapshot = await getDocs(collection(db, "Courses"));
                const teacherCourses = [];

                // Construct current teacher's full name to match
                // We should ideally store teacherId in Course, but for now matching legacy name field
                const teacherFullName = `${user.firstname} ${user.lastname}`;

                coursesSnapshot.forEach(doc => {
                    const data = doc.data();
                    // Check if Teacher Name matches (or loosely matches)
                    if (data.TeacherName === teacherFullName || data.teacherName === teacherFullName) {
                        teacherCourses.push({ id: doc.id, ...data });
                    }
                });

                setCourses(teacherCourses);
                if (teacherCourses.length > 0) {
                    setSelectedCourseId(teacherCourses[0].id);
                }
            } catch (error) {
                console.error("Error fetching courses", error);
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchTeacherCourses();
        }
    }, [user]);

    const handleUpload = async (e) => {
        e.preventDefault();
        setUploading(true);
        try {
            await addDoc(collection(db, "CourseContent"), {
                courseId: selectedCourseId,
                title,
                description,
                link,
                type: contentType,
                teacherId: user.uid,
                createdAt: Timestamp.now()
            });
            alert("Content added successfully!");
            setTitle('');
            setDescription('');
            setLink('');
        } catch (error) {
            console.error("Error adding content", error);
            alert("Failed to add content");
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="p-4">
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Upload Course Content</h2>
                <p className="text-gray-500">Share videos, notes, and assignments with your students.</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden p-6 max-w-2xl">
                {loading ? (
                    <div className="p-10 flex justify-center"><Loader type="spinner" /></div>
                ) : courses.length === 0 ? (
                    <div className="text-center py-10 text-gray-500">
                        <p>No courses assigned to you found.</p>
                        <p className="text-xs mt-2">Ensure the Admin has assigned you to a course using your name: {user?.firstname} {user?.lastname}</p>
                    </div>
                ) : (
                    <form onSubmit={handleUpload} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Select Course</label>
                            <select
                                value={selectedCourseId}
                                onChange={(e) => setSelectedCourseId(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                            >
                                {courses.map(course => (
                                    <option key={course.id} value={course.id}>{course.CourseTitle} ({course.CourseId})</option>
                                ))}
                            </select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Content Type</label>
                                <div className="flex bg-gray-50 p-1 rounded-lg">
                                    {['video', 'note'].map(type => (
                                        <button
                                            key={type}
                                            type="button"
                                            onClick={() => setContentType(type)}
                                            className={`flex-1 py-2 text-sm font-medium rounded-md capitalize flex items-center justify-center gap-2 transition-all ${contentType === type ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                                        >
                                            {type === 'video' ? <Video size={16} /> : <FileText size={16} />}
                                            {type}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Content Title</label>
                            <input
                                type="text"
                                required
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
                                placeholder="e.g. Introduction to Algebra"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Description / Instructions</label>
                            <textarea
                                rows="3"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                                placeholder="Brief description of the content..."
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">{contentType === 'video' ? "Video URL (YouTube/Zoom)" : "Document Link"}</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                    <LinkIcon size={18} />
                                </div>
                                <input
                                    type="url"
                                    required
                                    value={link}
                                    onChange={(e) => setLink(e.target.value)}
                                    className="pl-10 w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
                                    placeholder="https://..."
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={uploading}
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2 shadow-lg shadow-indigo-100 disabled:opacity-70 disabled:cursor-not-allowed min-h-[56px]"
                        >
                            {uploading ? (
                                <>
                                    <Loader variant="button" type="dots" size={24} />
                                    <span>Publishing Content...</span>
                                </>
                            ) : (
                                <>
                                    <Save size={20} />
                                    <span>Publish Content</span>
                                </>
                            )}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default CourseContent;
