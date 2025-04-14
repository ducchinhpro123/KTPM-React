import React from 'react';

const LoadingSpinner = ({ size = 'medium', fullScreen = false }) => {
  // Size variants
  const sizes = {
    small: 'h-6 w-6 border-2',
    medium: 'h-10 w-10 border-4',
    large: 'h-16 w-16 border-4',
  };

  const spinnerClasses = `animate-spin rounded-full border-t-blue-500 border-solid ${sizes[size] || sizes.medium}`;
  
  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-75 flex justify-center items-center z-50">
        <div className={spinnerClasses}></div>
      </div>
    );
  }
  
  return <div className={`flex justify-center ${fullScreen ? '' : 'py-8'}`}>
    <div className={spinnerClasses}></div>
  </div>;
};

export default LoadingSpinner;