import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../utils/axios';
import '../styles/Login.css';

function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('/api/auth/login', {
                username,
                password
            });
            
            if (!response.data.success) {
                throw new Error('로그인 실패');
            }
            
            localStorage.setItem('token', response.data.access_token);
            alert('로그인 성공!');
            navigate('/');
        } catch (error) {
            console.error('Error:', error);
            const errorMessage = error.response?.data || '알 수 없는 오류가 발생했습니다.';
            alert('로그인 실패: ' + errorMessage);
        }
    };

    return (
        <div className="login-container">
            <div className="login-box">
                <div className="login-header">
                    <div className="security-icon">
                        <div className="shield">
                            <div className="lock"></div>
                        </div>
                    </div>
                    <h2>Spring Security</h2>
                    <p>안전한 인증 시스템</p>
                </div>
                <form onSubmit={handleLogin} className="login-form">
                    <div className="form-group">
                        <label>
                            <i className="fas fa-user"></i>
                            사용자명
                        </label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="이메일을 입력하세요"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>
                            <i className="fas fa-lock"></i>
                            비밀번호
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="비밀번호를 입력하세요"
                            required
                        />
                    </div>
                    <button type="submit" className="login-button">
                        로그인
                    </button>
                </form>
                <div className="login-footer">
                    <p>계정이 없으신가요? <a href="/register">회원가입</a></p>
                    <div className="security-features">
                        <div className="feature">
                            <i className="fas fa-shield-alt"></i>
                            <span>JWT 인증</span>
                        </div>
                        <div className="feature">
                            <i className="fas fa-lock"></i>
                            <span>암호화</span>
                        </div>
                        <div className="feature">
                            <i className="fas fa-user-shield"></i>
                            <span>권한 관리</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Login; 