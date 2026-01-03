import React, { useState } from 'react';
import { Save } from 'lucide-react';

function AddCourse({ handleSubmit, isLoading, teachers }) {
    const [formData, setFormData] = useState({
        Category: '',
        title: '',
        id: '',
        teacherName: '',
        Seats: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const onSubmit = (e) => {
        e.preventDefault();
        handleSubmit(formData);
    };

    const inputClasses = "w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors";
    const labelClasses = "block text-sm font-medium text-gray-700 mb-1";

    return (
        <form onSubmit={onSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                    <label className={labelClasses}>Course Title</label>
                    <input
                        type="text"
                        name="title"
                        required
                        value={formData.title}
                        onChange={handleChange}
                        className={inputClasses}
                        placeholder="e.g. Advanced Mathematics"
                    />
                </div>

                <div>
                    <label className={labelClasses}>Course ID</label>
                    <input
                        type="text"
                        name="id"
                        required
                        value={formData.id}
                        onChange={handleChange}
                        className={inputClasses}
                        placeholder="e.g. MATH101"
                    />
                </div>

                <div>
                    <label className={labelClasses}>Category</label>
                    <input
                        type="text"
                        name="Category"
                        required
                        value={formData.Category}
                        onChange={handleChange}
                        className={inputClasses}
                        placeholder="e.g. Science"
                    />
                </div>

                <div>
                    <label className={labelClasses}>Teacher Name</label>
                    <select
                        name="teacherName"
                        required
                        value={formData.teacherName}
                        onChange={handleChange}
                        className={inputClasses}
                    >
                        <option value="">Select a Teacher</option>
                        {teachers && teachers.map(t => (
                            <option key={t.id} value={`${t.firstname} ${t.lastname}`}>
                                {t.firstname} {t.lastname} ({t.email})
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className={labelClasses}>Available Seats</label>
                    <input
                        type="number"
                        name="Seats"
                        required
                        value={formData.Seats}
                        onChange={handleChange}
                        className={inputClasses}
                        placeholder="e.g. 30"
                    />
                </div>
            </div>

            <div className="pt-4 flex justify-end">
                <button
                    type="submit"
                    disabled={isLoading}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 disabled:opacity-70"
                >
                    <Save size={18} />
                    <span>{isLoading ? 'Adding...' : 'Add Course'}</span>
                </button>
            </div>
        </form>
    );
}

export default AddCourse;
