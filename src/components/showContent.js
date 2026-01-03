import React, { useEffect, useState } from 'react';
import { Search, FileText, Video, Youtube } from 'lucide-react';
import Loader from './Loader';
import { db } from '../firebase-setup/firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';

function DisplayContent({ user }) {
    const [courses, setCourses] = useState([]);
    const [contentList, setContentList] = useState([]);
    const [allContent, setAllContent] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState("");

    const uid = user?.uid || localStorage.getItem('uid');

    const fetchContent = async () => {
        setLoading(true);
        try {
            // Fetch registered courses
            const CourseTitle = [];
            // Assuming this is used by Student mostly, but if Admin uses it, maybe fetch ALL courses?
            // Prioritizing preservation of logic for now.
            if (uid) {
                const registeredCourseQuery = query(collection(db, "Registered-Course"), where("uid", "==", uid));
                const querySnapshot = await getDocs(registeredCourseQuery);
                querySnapshot.forEach((doc) => {
                    const data = doc.data();
                    CourseTitle.push(data.courseTitle);
                });
            } else {
                // Fallback: Fetch all courses if no UID (Admin mode maybe?)
                const allCoursesSnapshot = await getDocs(collection(db, "Courses"));
                allCoursesSnapshot.forEach((doc) => {
                    CourseTitle.push(doc.data().CourseTitle);
                });
            }
            setCourses(CourseTitle);

            // Fetch all content from the correct collection
            const contentSnapshot = await getDocs(collection(db, "CourseContent"));
            const content = [];
            contentSnapshot.forEach((doc) => {
                const data = doc.data();
                content.push({
                    key: doc.id,
                    Title: data.title || data.CourseTitle, // Support both for safety
                    Type: data.type || data.Type,
                    Content: data.link || data.YouTubeURL || data.VideoURL
                });
            });
            setAllContent(content);
        } catch (error) {
            console.error("Error fetching content:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchContent();
    }, [uid]);

    const handleSearch = (e) => {
        e.preventDefault();
        const selected = allContent.filter(item => item.Title === selectedCourse);
        setContentList(selected);
    };

    return (
        <div className="p-4 space-y-6">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-indigo-700">Course Content</h2>
            </div>

            {/* Selection Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Select Course</h3>
                <form onSubmit={handleSearch} className="flex gap-4 items-end">
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Course Title</label>
                        <select
                            value={selectedCourse}
                            onChange={(e) => setSelectedCourse(e.target.value)}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white font-medium"
                            required
                        >
                            <option value="">-- Select a Course --</option>
                            {courses.map((c, i) => (
                                <option key={i} value={c}>{c}</option>
                            ))}
                        </select>
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-2.5 rounded-xl font-bold transition-all active:translate-y-0.5 flex items-center justify-center gap-2 shadow-lg shadow-indigo-100 disabled:opacity-70 min-w-[160px] min-h-[46px]"
                    >
                        {loading ? (
                            <>
                                <Loader variant="button" type="dots" size={24} />
                                <span>Showing...</span>
                            </>
                        ) : (
                            <>
                                <Search size={18} />
                                <span>Show Content</span>
                            </>
                        )}
                    </button>
                </form>
            </div>

            {/* Results Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Content Details</h3>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-600">
                        <thead className="bg-gray-50 text-gray-900 font-semibold border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4">Title</th>
                                <th className="px-6 py-4">Type</th>
                                <th className="px-6 py-4">Link/Content</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {contentList.length === 0 ? (
                                <tr>
                                    <td colSpan="3" className="px-6 py-8 text-center text-gray-500">
                                        {loading ? <div className="flex justify-center"><Loader type="dots" /></div> : "No content selected or available."}
                                    </td>
                                </tr>
                            ) : (
                                contentList.map((item) => (
                                    <tr key={item.key} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-gray-900">{item.Title}</td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-50 text-purple-700 capitalize">
                                                {item.Type === 'video' ? <Video size={12} /> : <FileText size={12} />}
                                                {item.Type}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-blue-600 hover:underline truncate max-w-xs">
                                            <a href={item.Content} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                                                {item.Content.includes('youtube') && <Youtube size={16} className="text-red-600" />}
                                                Open Link
                                            </a>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default DisplayContent;
