import React from 'react';
import { Link } from 'react-router-dom';

/**
 * 네비게이션
 * @returns {Element}
 * @constructor
 */
function Navigation() {
    return (
        <nav>
            <ul>
                <li><Link to="/">홈</Link></li>
                <li><Link to="/register">회원가입</Link></li>
                <li><Link to="/login">로그인</Link></li>
                <li><Link to="/dashboard">대시보드</Link></li>
            </ul>
        </nav>
    );
}

export default Navigation; 