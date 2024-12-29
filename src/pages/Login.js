import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function Login({ setAuth, setRole }) {
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

      const { access_token } = response.data;
      localStorage.setItem('token', access_token);
      
      // JWT 디코딩하여 role 확인
      const payload = JSON.parse(atob(access_token.split('.')[1]));
      setRole(payload.role);
      setAuth(true);
      
      navigate(payload.role === 'ROLE_ADMIN' ? '/admin' : '/dashboard');
    } catch (error) {
      alert('로그인 실패');
    }
  };

  return (
    <div className="login-container">
      <h2>로그인</h2>
      <form onSubmit={handleLogin}>
        <input
          type="text"
          placeholder="사용자명"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="비밀번호"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">로그인</button>
      </form>
    </div>
  );
}

export default Login; 