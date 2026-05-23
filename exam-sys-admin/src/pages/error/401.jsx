import React from 'react';
import { useNavigate } from 'react-router-dom';
import './ErrorPage.scss';

const Unauthorized = () => {
  const navigate = useNavigate();

  const handleReturnHome = () => {
    navigate('/');
  };

  return (
    <div className="not-found-container">
      <div className="not-found-content">
        <h1 className="not-found-title">401</h1>
        <p className="not-found-message">未授权访问...</p>
        <p className="not-found-info">您没有权限访问此页面，请联系管理员或点击下方按钮返回首页。</p>
        <button onClick={handleReturnHome} className="return-home-btn">
          返回首页
        </button>
      </div>
    </div>
  );
};

export default Unauthorized;
