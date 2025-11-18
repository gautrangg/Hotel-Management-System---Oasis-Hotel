import React from 'react';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
    // Ensure totalPages is at least 1 to avoid errors
    const safeTotalPages = Math.max(1, totalPages || 1);

    const getPageNumbers = () => {
        if (safeTotalPages <= 7) { 
            return Array.from({ length: safeTotalPages }, (_, i) => i + 1);
        }
        if (currentPage <= 4) { 
            return [1, 2, 3, 4, 5, '...', safeTotalPages];
        }
        if (currentPage > safeTotalPages - 4) { 
            return [1, '...', safeTotalPages - 4, safeTotalPages - 3, safeTotalPages - 2, safeTotalPages - 1, safeTotalPages];
        }
        return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', safeTotalPages];
    };

    const pages = getPageNumbers();

    return (
        <div className="pagination">
            <button 
                className="pagination-btn pagination-nav"
                onClick={() => onPageChange(currentPage - 1)} 
                disabled={currentPage === 1}
                title="Previous page"
            >
                <i className="fas fa-chevron-left"></i>
            </button>
            
            {pages.map((page, index) =>
                page === '...' ? (
                    <span key={index} className="pagination-dots">...</span>
                ) : (
                    <button
                        key={index}
                        onClick={() => onPageChange(page)}
                        className={`pagination-btn ${currentPage === page ? 'active' : ''}`}
                        title={`Go to page ${page}`}
                    >
                        {page}
                    </button>
                )
            )}
            
            <button 
                className="pagination-btn pagination-nav"
                onClick={() => onPageChange(currentPage + 1)} 
                disabled={currentPage >= safeTotalPages}
                title="Next page"
            >
                <i className="fas fa-chevron-right"></i>
            </button>
        </div>
    );
};

export default Pagination;