import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import './BackToTop.scss';

const BackToTop = ({ 
  visibilityHeight = 400, 
  backPosition = 0,
  customStyle = {}
}) => {
  const [visible, setVisible] = useState(false);
  const [isMoving, setIsMoving] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.pageYOffset > visibilityHeight);
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [visibilityHeight]);

  const easeInOutQuad = (t, b, c, d) => {
    if ((t /= d / 2) < 1) return c / 2 * t * t + b;
    return -c / 2 * (--t * (t - 2) - 1) + b;
  };

  const backToTop = () => {
    if (isMoving) return;
    const start = window.pageYOffset;
    let i = 0;
    setIsMoving(true);
    
    const interval = setInterval(() => {
      const next = Math.floor(easeInOutQuad(10 * i, start, -start, 500));
      if (next <= backPosition) {
        window.scrollTo(0, backPosition);
        clearInterval(interval);
        setIsMoving(false);
      } else {
        window.scrollTo(0, next);
      }
      i++;
    }, 5);
  };

  return (
    <div
      className={`back-to-ceiling ${visible ? 'fade-enter' : 'fade-leave'}`}
      style={{
        display: visible ? 'flex' : 'none',
        ...customStyle
      }}
      onClick={backToTop}
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 17 17"
        xmlns="http://www.w3.org/2000/svg"
        className="Icon Icon--backToTopArrow"
        aria-hidden="true"
      >
        <path d="M12.036 15.59a1 1 0 0 1-.997.995H5.032a.996.996 0 0 1-.997-.996V8.584H1.03c-1.1 0-1.36-.633-.578-1.416L7.33.29a1.003 1.003 0 0 1 1.412 0l6.878 6.88c.782.78.523 1.415-.58 1.415h-3.004v7.004z" />
      </svg>
    </div>
  );
};

BackToTop.propTypes = {
  visibilityHeight: PropTypes.number,
  backPosition: PropTypes.number,
  customStyle: PropTypes.object
};

export default BackToTop;
