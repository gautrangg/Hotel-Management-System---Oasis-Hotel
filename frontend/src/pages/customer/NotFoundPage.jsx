import React from 'react';
import { useNavigate } from 'react-router-dom';
import '@assets/404/NotFoundPage.css';

const orangeColor = '#E97425';

const Svg0 = () => (
  <svg width="130" height="130" viewBox="0 0 130 130" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="65" cy="65" r="60" stroke={orangeColor} strokeWidth="9" />
    <circle cx="65" cy="65" r="48" stroke={orangeColor} strokeWidth="9" />
    <circle cx="65" cy="65" r="36" stroke={orangeColor} strokeWidth="9" />
    <circle cx="65" cy="65" r="24" stroke={orangeColor} strokeWidth="9" />
    <circle cx="65" cy="65" r="12" stroke={orangeColor} strokeWidth="9" />
  </svg>
);

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    // 2. Thay thế các class Tailwind bằng class CSS đã định nghĩa
    <div className="notfound-container">

      <h1 className="notfound-title">
        Oops! Where are we?
      </h1>

      <div className="notfound-svg-wrapper">
        4
        <Svg0 />
        4
      </div>

      <p className="notfound-description">
        Page not Found! The page you are looking for was moved, removed, or is temporarily unavailable.
      </p>

      <button onClick={() => navigate(-1, { replace: true })} className="notfound-button">
        Back to Previous
      </button>

    </div>
  );
};

export default NotFoundPage;