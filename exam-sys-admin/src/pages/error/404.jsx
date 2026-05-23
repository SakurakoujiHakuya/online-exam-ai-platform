import React from 'react';
import { useNavigate } from 'react-router-dom';
import './ErrorPage.scss';

const NotFound = () => {
  const navigate = useNavigate();

  const handleReturnHome = () => {
    navigate('/');
  };

  return (
    <div className="not-found-container">
      <div className="not-found-content">
        <h1 className="not-found-title">404</h1>
        <p className="not-found-message">页面未找到...</p>
        <p className="not-found-info">请检查您输入的网址是否正确，或点击下方按钮返回首页。</p>
        <button onClick={handleReturnHome} className="return-home-btn">
          返回首页
        </button>
      </div>
    </div>
  );
};

export default NotFound;
