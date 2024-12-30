import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import axios from '../utils/axios';
import '../styles/Register.css';
import 'react-toastify/dist/ReactToastify.css';

function Register() {
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        confirmPassword: '',
        email: ''
    });
    const navigate = useNavigate();

    const validateForm = () => {
        console.group('폼 유효성 검사');
        
        if (!formData.username || !formData.password || !formData.confirmPassword || !formData.email) {
            console.warn('필수 필드 누락');
            toast.error('모든 필드를 입력해주세요.');
            console.groupEnd();
            return false;
        }

        if (formData.username.length < 2 || formData.username.length > 30) {
            console.warn('사용자명 길이 부적절:', formData.username.length);
            toast.error('사용자명은 2-30자 사이여야 합니다.');
            console.groupEnd();
            return false;
        }

        if (formData.password.length < 4) {
            console.warn('비밀번호 길이 부족:', formData.password.length);
            toast.error('비밀번호는 4자 이상이어야 합니다.');
            console.groupEnd();
            return false;
        }

        if (!/[A-Za-z]/.test(formData.password) || !/[0-9]/.test(formData.password)) {
            console.warn('비밀번호 복잡도 부족');
            toast.error('비밀번호는 영문, 숫자를 모두 포함해야 합니다.');
            console.groupEnd();
            return false;
        }

        if (formData.password !== formData.confirmPassword) {
            console.warn('비밀번호 불일치');
            toast.error('비밀번호가 일치하지 않습니다.');
            console.groupEnd();
            return false;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            console.warn('잘못된 이메일 형식:', formData.email);
            toast.error('유효한 이메일 주소를 입력해주세요.');
            console.groupEnd();
            return false;
        }

        console.log('모든 유효성 검사 통과');
        console.groupEnd();
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        console.group('회원가입 프로세스 시작');
        console.log('폼 데이터:', { 
            username: formData.username, 
            email: formData.email,
            passwordLength: formData.password.length 
        });
        
        if (!validateForm()) {
            console.warn('폼 유효성 검사 실패');
            console.groupEnd();
            return;
        }
        console.log('폼 유효성 검사 통과');

        try {
            console.log('회원가입 API 요청 시작');
            toast.info('회원가입 처리 중...', {
                autoClose: 2000
            });

            console.time('회원가입 API 요청 시간');
            const response = await axios.post('/api/auth/register', {
                username: formData.username,
                password: formData.password,
                email: formData.email
            });
            console.timeEnd('회원가입 API 요청 시간');

            console.log('서버 응답:', response.data);
            
            toast.success('회원가입이 완료되었습니다!', {
                onClose: () => {
                    console.log('로그인 페이지로 리다이렉트');
                    navigate('/login');
                }
            });

        } catch (error) {
            console.group('회원가입 오류 발생');
            console.error('오류 타입:', error.name);
            console.error('오류 메시지:', error.message);
            
            if (error.response) {
                console.error('서버 응답 상태:', error.response.status);
                console.error('서버 응답 데이터:', error.response.data);
                
                switch (error.response.status) {
                    case 400:
                        if (error.response.data.includes('exists')) {
                            console.warn('중복된 사용자명');
                            toast.error('이미 존재하는 사용자명입니다.');
                        } else if (error.response.data.includes('email')) {
                            console.warn('중복된 이메일');
                            toast.error('이미 사용 중인 이메일입니다.');
                        } else {
                            console.warn('잘못된 입력값');
                            toast.error('입력값이 유효하지 않습니다.');
                        }
                        break;
                    case 500:
                        console.error('서버 내부 오류');
                        toast.error('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
                        break;
                    default:
                        console.error('예상치 못한 오류');
                        toast.error('회원가입 처리 중 오류가 발생했습니다.');
                }
            } else if (error.request) {
                console.error('서버 응답 없음');
                toast.error('서버에 연결할 수 없습니다. 네트워크 연결을 확인해주세요.');
            } else {
                console.error('요청 설정 오류');
                toast.error('알 수 없는 오류가 발생했습니다.');
            }
            console.groupEnd();
        } finally {
            console.groupEnd();
        }
    };

    return (
        <div className="register-page">
            <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="colored"
            />
            <div className="register-container">
                <div className="security-logo">
                    <div className="shield-icon">
                        <i className="fas fa-shield-alt"></i>
                    </div>
                    <h1>Spring Security</h1>
                    <p>안전한 회원가입</p>
                </div>

                <form onSubmit={handleSubmit} className="register-form">
                    <div className="form-group">
                        <label>
                            <i className="fas fa-user"></i>
                            사용자명
                        </label>
                        <input
                            type="text"
                            value={formData.username}
                            onChange={(e) => setFormData({...formData, username: e.target.value})}
                            placeholder="사용자명을 입력하세요"
                            required
                            minLength="2"
                            maxLength="30"
                        />
                        <small>2-30자 사이로 입력해주세요</small>
                    </div>

                    <div className="form-group">
                        <label>
                            <i className="fas fa-envelope"></i>
                            이메일
                        </label>
                        <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
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
                            value={formData.password}
                            onChange={(e) => setFormData({...formData, password: e.target.value})}
                            placeholder="비밀번호를 입력하세요"
                            required
                            minLength="4"
                        />
                        <small>영문, 숫자 조합 4자 이상</small>
                    </div>

                    <div className="form-group">
                        <label>
                            <i className="fas fa-lock"></i>
                            비밀번호 확인
                        </label>
                        <input
                            type="password"
                            value={formData.confirmPassword}
                            onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                            placeholder="비밀번호를 다시 입력하세요"
                            required
                        />
                    </div>

                    <button type="submit" className="register-button">
                        <i className="fas fa-user-plus"></i>
                        회원가입
                    </button>

                    <div className="security-features">
                        <div className="feature">
                            <i className="fas fa-lock"></i>
                            <span>암호화 저장</span>
                        </div>
                        <div className="feature">
                            <i className="fas fa-shield-alt"></i>
                            <span>보안 인증</span>
                        </div>
                        <div className="feature">
                            <i className="fas fa-user-shield"></i>
                            <span>권한 관리</span>
                        </div>
                    </div>
                </form>

                <div className="register-footer">
                    <p>이미 계정이 있으신가요? <a href="/login">로그인</a></p>
                </div>
            </div>
        </div>
    );
}

export default Register;