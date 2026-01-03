import React from 'react';

const Loader = ({ type = "spinner", text = "Loading...", fullScreen = false, size = 48, variant = "default" }) => {

    const content = (
        <div className={`flex flex-col items-center justify-center ${variant === 'button' ? 'gap-0' : 'gap-4'}`}>
            {type === "spinner" && (
                <span
                    className="loader-spinner"
                    style={{ width: `${size}px`, height: `${size}px`, borderWidth: size > 24 ? '5px' : '2.5px' }}
                ></span>
            )}

            {type === "dots" && (
                <div className="loader-dots">
                    <div className="loader-dot" style={{ width: `${size / 4}px`, height: `${size / 4}px` }}></div>
                    <div className="loader-dot" style={{ width: `${size / 4}px`, height: `${size / 4}px` }}></div>
                    <div className="loader-dot" style={{ width: `${size / 4}px`, height: `${size / 4}px` }}></div>
                </div>
            )}

            {text && variant !== 'button' && <p className="text-gray-500 font-medium animate-pulse text-sm">{text}</p>}
        </div>
    );

    if (fullScreen) {
        return (
            <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center animate-fadeIn">
                {content}
            </div>
        );
    }

    if (variant === 'button') return content;

    return <div className="flex items-center justify-center">{content}</div>;
};

export default Loader;
