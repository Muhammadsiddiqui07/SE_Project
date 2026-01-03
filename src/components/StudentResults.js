import React, { useEffect, useState } from 'react';
import { db } from '../firebase-setup/firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { Award, TrendingUp, ChevronRight, FileText, BookOpen } from 'lucide-react';
import Loader from './Loader';

const StudentResults = ({ user }) => {
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const uid = user?.uid || localStorage.getItem("uid");

    useEffect(() => {
        if (!uid) return;
        setLoading(true);

        const resultsRef = collection(db, "ExamResults");
        const q = query(resultsRef, orderBy("timestamp", "desc"));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const studentResults = [];
            snapshot.forEach(doc => {
                const data = doc.data();
                if (data.results && data.results[uid]) {
                    studentResults.push({
                        id: doc.id,
                        examName: data.examName,
                        subject: data.subject || 'Academic Result',
                        marks: data.results[uid],
                        date: data.timestamp?.toDate().toLocaleDateString() || 'Recent'
                    });
                }
            });
            setResults(studentResults);
            setLoading(false);
        }, (error) => {
            console.error("Error with results listener:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [uid]);

    if (loading) return <div className="p-8"><Loader type="dots" /></div>;

    return (
        <div className="max-w-5xl mx-auto p-4 md:p-6 space-y-8 animate-fadeIn">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Academic Performance</h1>
                    <p className="text-gray-500 font-medium">View your latest exam results and grade reports</p>
                </div>
                <div className="bg-indigo-600 px-6 py-3 rounded-2xl shadow-lg shadow-indigo-100 flex items-center gap-3 text-white">
                    <Award size={20} />
                    <span className="font-bold text-sm">Official Transcript View</span>
                </div>
            </div>

            {results.length === 0 ? (
                <div className="bg-white rounded-3xl p-12 text-center border-2 border-dashed border-gray-100">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
                        <FileText size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800">No results found yet</h3>
                    <p className="text-gray-500 mt-2">Your marks will appear here once they are published by your teachers.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    {results.map((result) => (
                        <div key={result.id} className="group bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-indigo-50/50 transition-all duration-300 overflow-hidden">
                            <div className="p-6 md:p-8">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                    <div className="flex items-center gap-5">
                                        <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform">
                                            <TrendingUp size={28} />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-black text-gray-900 group-hover:text-indigo-600 transition-colors uppercase tracking-wide">{result.examName}</h3>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-lg text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-sm ring-1 ring-indigo-100">
                                                    <BookOpen size={12} />
                                                    {result.subject}
                                                </span>
                                                <p className="text-gray-400 text-xs font-semibold">
                                                    • Published on {result.date}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Stats Grid */}
                                    <div className="flex flex-wrap gap-4 md:gap-8 flex-1 max-w-lg justify-end">
                                        {Object.entries(result.marks).map(([sub, score]) => (
                                            <div key={sub} className="text-center group/sub min-w-[100px]">
                                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 transition-colors group-hover/sub:text-indigo-400">{sub}</p>
                                                <div className="text-2xl md:text-3xl font-black text-gray-900 bg-gray-50 rounded-2xl py-3 px-6 border border-transparent group-hover/sub:border-indigo-100 group-hover/sub:bg-white transition-all shadow-sm">
                                                    {score}
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="flex items-center justify-center">
                                        <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-300 group-hover:bg-indigo-600 group-hover:text-white transition-all cursor-pointer">
                                            <ChevronRight size={20} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default StudentResults;
