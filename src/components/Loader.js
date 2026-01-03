import React from 'react';

const Loader = ({ type = "spinner", text = "Loading...", fullScreen = false }) => {

    const content = (
        <div className="flex flex-col items-center justify-center gap-4">
            {type === "spinner" && <span className="loader-spinner"></span>}

            {type === "dots" && (
                <div className="loader-dots">
                    <div className="loader-dot"></div>
                    <div className="loader-dot"></div>
                    <div className="loader-dot"></div>
                </div>
            )}

            {text && <p className="text-gray-500 font-medium animate-pulse">{text}</p>}
        </div>
    );

    if (fullScreen) {
        return (
            <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center animate-fadeIn">
                {content}
            </div>
        );
    }

    return <div className="p-8 flex items-center justify-center">{content}</div>;
};

export default Loader;
