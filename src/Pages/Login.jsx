import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { User, Lock, MoveRight, School } from "lucide-react";
import Loader from "../components/Loader";

const Login = () => {
    const { login } = useAuth();
    const [activeTab, setActiveTab] = useState("admin"); // Default to admin
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const tabs = [
        { id: "admin", label: "Admin", icon: <School size={18} /> },
        { id: "teacher", label: "Teacher", icon: <User size={18} /> },
        { id: "student", label: "Student", icon: <User size={18} /> },
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            await login(email, password, activeTab);
            navigate('/');
        } catch (err) {
            setError("Failed to login: " + err.message);
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-teal-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl overflow-hidden flex flex-col md:flex-row">

                {/* Left Side - Image/Brand */}
                <div className="w-full md:w-1/2 bg-indigo-600 p-8 flex flex-col justify-center items-center text-white">
                    <div className="mb-6">
                        <School size={80} className="text-indigo-200" />
                    </div>
                    <h2 className="text-3xl font-bold mb-2">Eduspace</h2>
                    <p className="text-indigo-200 text-center">
                        Complete School Management System. <br /> Access your dashboard securely.
                    </p>
                </div>

                {/* Right Side - Form */}
                <div className="w-full md:w-1/2 p-8 md:p-12">
                    <div className="text-center mb-8">
                        <h3 className="text-2xl font-bold text-gray-800">Welcome Back</h3>
                        <p className="text-gray-500 text-sm mt-1">Please sign in to your account</p>
                    </div>

                    {/* Tabs */}
                    <div className="flex bg-gray-100 p-1 rounded-xl mb-8">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => {
                                    setActiveTab(tab.id);
                                    setEmail("");
                                    setPassword("");
                                    setError("");
                                }}
                                className={`flex-1 flex items-center justify-center space-x-2 py-2.5 text-sm font-medium rounded-lg transition-all ${activeTab === tab.id
                                        ? "bg-white text-indigo-600 shadow-sm"
                                        : "text-gray-500 hover:text-gray-700 hover:bg-gray-200"
                                    }`}
                            >
                                {tab.icon}
                                <span>{tab.label}</span>
                            </button>
                        ))}
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm text-center font-medium">
                                {error}
                            </div>
                        )}



                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    {activeTab === "admin" ? "Email Address" : `${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} ID`}
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <User size={18} className="text-gray-400" />
                                    </div>
                                    <input
                                        type="text"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="pl-10 w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
                                        placeholder={activeTab === "admin" ? "admin@school.com" : `Enter your ${activeTab} ID`}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Lock size={18} className="text-gray-400" />
                                    </div>
                                    <input
                                        type="password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="pl-10 w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
                                        placeholder="••••••••"
                                    />
                                </div>
                                <div className="text-right mt-1">
                                    <a href="#" className="text-xs text-indigo-600 hover:text-indigo-800 font-medium">Forgot Password?</a>
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 rounded-xl transition-all active:translate-y-0.2 flex items-center justify-center space-x-2 shadow-lg shadow-indigo-200 disabled:opacity-70 disabled:cursor-not-allowed border-none"
                        >
                            {loading ? (
                                <div className="flex">
                                    <span>Signing in...</span>
                                </div>
                            ) : (
                                <>
                                    <span className="tracking-wide">Sign In</span>
                                    <MoveRight size={18} />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-xs text-gray-400">
                            By logging in, you agree to our Terms of Service Policy.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
