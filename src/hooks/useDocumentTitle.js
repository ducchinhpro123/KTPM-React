import { useEffect } from 'react';

/**
 * Custom hook for changing the document title
 * @param {string} title - The new title for the page
 * @param {boolean} [resetOnUnmount=false] - Whether to reset to default title when component unmounts
 */
const useDocumentTitle = (title, resetOnUnmount = false) => {
  const defaultTitle = 'E-Commerce Shop';
  
  useEffect(() => {
    // Set the page title when component mounts
    document.title = title ? `${title} | ${defaultTitle}` : defaultTitle;
    
    // Reset the page title when component unmounts (if specified)
    return () => {
      if (resetOnUnmount) {
        document.title = defaultTitle;
      }
    };
  }, [title, resetOnUnmount]);
};

export default useDocumentTitle;