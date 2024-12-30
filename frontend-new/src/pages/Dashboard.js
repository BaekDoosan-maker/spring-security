import React, { useState } from 'react';
import axios from '../utils/axios';
import '../styles/Dashboard.css';

function Dashboard() {
    const [activeScenario, setActiveScenario] = useState(null);
    const [registerForm, setRegisterForm] = useState({
        username: '',
        password: ''
    });
    const [loginForm, setLoginForm] = useState({
        username: '',
        password: ''
    });
    const [processLog, setProcessLog] = useState([]);

    // 로그 추가 함수
    const addLog = async (step, status, message, delay = 800) => {
        await new Promise(resolve => setTimeout(resolve, delay));
        const newLog = {
            id: Date.now(),
            timestamp: new Date().toLocaleTimeString(),
            step,
            status,
            message,
            isNew: true
        };
        setProcessLog(prev => [newLog, ...prev].slice(0, 50));
        
        setTimeout(() => {
            setProcessLog(prev => 
                prev.map(log => 
                    log.id === newLog.id ? { ...log, isNew: false } : log
                )
            );
        }, 500);
    };

    // 회원가입 처리
    const handleRegister = async (e) => {
        e.preventDefault();
        setProcessLog([]); // 로그 초기화
        
        try {
            await addLog('Filter', 'process', 'UsernamePasswordAuthenticationFilter 진입');
            await addLog('검증', 'process', '@Valid 어노테이션으로 입력값 검증 중...');
            
            if (!registerForm.username || !registerForm.password) {
                await addLog('검증', 'error', 'MethodArgumentNotValidException: 필수 필드 누락');
                return;
            }

            if (registerForm.password.length < 8) {
                await addLog('검증', 'error', 'ValidationException: 비밀번호는 8자 이상이어야 합니다.');
                return;
            }

            await addLog('Filter', 'process', 'SecurityContextPersistenceFilter 처리 중');
            await addLog('암호화', 'process', 'BCryptPasswordEncoder.encode() 호출');
            
            const mockEncodedPassword = `$2a$10$${registerForm.password.repeat(2)}...`;
            await addLog('암호화', 'success', `암호화 완료: ${mockEncodedPassword}`);
            await addLog('DB', 'process', 'UserRepository.findByUsername() 호출 - 중복 검사');
            
            const response = await axios.post('/api/auth/register', {
                username: registerForm.username,
                password: registerForm.password
            });

            await addLog('DB', 'success', 'UserRepository.save() 완료');
            await addLog('Entity', 'success', `MemberEntity 생성됨 - ID: ${Math.floor(Math.random() * 1000)}`);
            await addLog('Transaction', 'success', '@Transactional 커밋 완료');
            
            setRegisterForm({ username: '', password: '' });

        } catch (error) {
            if (error.response?.data?.includes('exists')) {
                await addLog('DB', 'error', 'DataIntegrityViolationException: 중복된 username');
                await addLog('Exception', 'error', 'UserAlreadyExistsException 발생');
            } else {
                await addLog('Exception', 'error', `${error.name}: ${error.message}`);
            }
        }
    };

    // 로그인 처리
    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            await addLog('Filter', 'process', 'DispatcherServlet - 요청 접수', 300);
            await addLog('Handler', 'process', 'HandlerMapping - /api/auth/login 요청 매핑', 300);
            await addLog('Handler', 'process', 'AuthController.login() 메소드로 요청 위임', 300);
            
            await addLog('Security', 'process', 'UsernamePasswordAuthenticationFilter 진입', 300);
            await addLog('Security', 'process', 'AuthenticationManager.authenticate() 호출', 300);
            
            await addLog('Validation', 'process', '@Valid 어노테이션 처리 - 요청 데이터 검증', 300);
            await addLog('Handler', 'process', 'LoginRequest DTO로 요청 바인딩', 300);
            
            await addLog('Service', 'process', 'UserDetailsService.loadUserByUsername() 호출', 300);
            await addLog('Repository', 'process', 'JPA - findByUsername 쿼리 실행', 300);
            
            const response = await axios.post('/api/auth/login', {
                username: loginForm.username,
                password: loginForm.password
            });

            if (response.data.access_token) {
                const token = response.data.access_token;
                const tokenParts = token.split('.');
                
                await addLog('DB', 'success', 'UserRepository - 사용자 정보 조회 완료', 300);
                await addLog('Security', 'process', 'PasswordEncoder.matches() - 비밀번호 검증', 300);
                await addLog('Security', 'success', '비밀번호 검증 완료', 300);
                
                // JWT 헤더 정보
                const header = JSON.parse(atob(tokenParts[0]));
                await addLog('JWT', 'info', '토큰 생성 시작 - JwtUtil.generateToken()', 300);
                await addLog('JWT', 'info', `알고리즘: ${header.alg}`, 200);
                await addLog('JWT', 'info', `토큰 타입: ${header.typ}`, 200);

                // JWT 페이로드 정보
                const payload = JSON.parse(atob(tokenParts[1]));
                await addLog('JWT', 'info', '토큰 페이로드 구성', 300);
                await addLog('JWT', 'info', `사용자: ${payload.sub}`, 200);
                await addLog('JWT', 'info', `클라이언트 IP: ${payload.ip}`, 200);
                await addLog('JWT', 'info', `발급시간: ${new Date(payload.iat * 1000).toLocaleString()}`, 200);
                await addLog('JWT', 'info', `만료시간: ${new Date(payload.exp * 1000).toLocaleString()}`, 200);

                await addLog('Handler', 'process', 'ResponseEntity 객체 생성', 300);
                await addLog('Response', 'process', 'HTTP 200 OK 응답 준비', 300);
                await addLog('Response', 'success', '로그인 성공 응답 전송', 300);
                
                localStorage.setItem('token', token);
                setLoginForm({ username: '', password: '' });
            }

        } catch (error) {
            if (error.response?.status === 401) {
                await addLog('Security', 'error', 'AuthenticationException 발생', 300);
                await addLog('Handler', 'process', 'ExceptionHandler - @ControllerAdvice 처리', 300);
                await addLog('Response', 'error', 'HTTP 401 Unauthorized 응답 전송', 300);
            } else {
                await addLog('System', 'error', `예외 발생: ${error.message}`, 300);
                await addLog('Handler', 'process', 'GlobalExceptionHandler 처리', 300);
            }
        } finally {
            await addLog('Handler', 'info', 'HandlerInterceptor.afterCompletion() 실행', 300);
            await addLog('Filter', 'info', 'ServletFilter.doFilter() 완료', 300);
        }
    };

    const securityScenarios = [
        {
            id: 'invalid-token',
            title: '토큰 인증 실패',
            cases: [
                { type: 'expired', desc: '만료된 토큰', handler: 'JwtAuthenticationFilter → TokenExpiredException' },
                { type: 'invalid', desc: '유효하지 않은 토큰', handler: 'JwtAuthenticationFilter → InvalidTokenException' },
                { type: 'missing', desc: '토큰 누락', handler: 'SecurityContext → AuthenticationException' }
            ]
        },
        {
            id: 'auth-fail',
            title: '인증 실패',
            cases: [
                { type: 'wrong-password', desc: '잘못된 비밀번호', handler: 'DaoAuthenticationProvider → BadCredentialsException' },
                { type: 'user-not-found', desc: '사용자 없음', handler: 'UserDetailsService → UsernameNotFoundException' },
                { type: 'locked', desc: '계정 잠금', handler: 'UserDetails → LockedException' }
            ]
        },
        {
            id: 'authorization',
            title: '권한 부족',
            cases: [
                { type: 'forbidden', desc: '접근 권한 없음', handler: 'AccessDecisionManager → AccessDeniedException' },
                { type: 'role-missing', desc: '필요 역할 없음', handler: '@PreAuthorize → InsufficientAuthenticationException' },
                { type: 'method-denied', desc: '메소드 접근 거부', handler: '@Secured → MethodSecurityException' }
            ]
        }
    ];

    return (
        <div className="dashboard-container">
            <div className="security-header">
                <h1><i className="fas fa-shield-alt"></i> Spring Security 예외 처리 대시보드</h1>
            </div>
            
            <div className="scenarios-grid">
                {securityScenarios.map(scenario => (
                    <div key={scenario.id} className="scenario-card">
                        <div className="scenario-header">
                            <h3>{scenario.title}</h3>
                        </div>
                        <div className="cases-list">
                            {scenario.cases.map(caseItem => (
                                <div key={caseItem.type} 
                                     className="case-item"
                                     onMouseEnter={() => setActiveScenario(caseItem.type)}
                                     onMouseLeave={() => setActiveScenario(null)}>
                                    <div className="case-icon">
                                        <i className={`fas ${
                                            caseItem.type.includes('token') ? 'fa-key' :
                                            caseItem.type.includes('password') ? 'fa-lock' :
                                            caseItem.type.includes('user') ? 'fa-user-slash' :
                                            'fa-ban'
                                        }`}></i>
                                    </div>
                                    <div className="case-content">
                                        <h4>{caseItem.desc}</h4>
                                        <div className="handler-chain">
                                            {caseItem.handler.split('→').map((step, idx) => (
                                                <span key={idx}>
                                                    {step.trim()}
                                                    {idx < caseItem.handler.split('→').length - 1 && 
                                                        <i className="fas fa-arrow-right"></i>}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <div className="security-stats">
                <div className="stat-item">
                    <i className="fas fa-shield-alt"></i>
                    <span>인증 필터</span>
                    <strong>활성</strong>
                </div>
                <div className="stat-item">
                    <i className="fas fa-lock"></i>
                    <span>JWT 검증</span>
                    <strong>정상</strong>
                </div>
                <div className="stat-item">
                    <i className="fas fa-user-shield"></i>
                    <span>권한 관리</span>
                    <strong>동작중</strong>
                </div>
            </div>

            <div className="realtime-section">
                <div className="auth-forms">
                    <div className="auth-form">
                        <h3>회원가입</h3>
                        <form onSubmit={handleRegister}>
                            <input
                                type="text"
                                placeholder="사용자명"
                                value={registerForm.username}
                                onChange={(e) => setRegisterForm({
                                    ...registerForm,
                                    username: e.target.value
                                })}
                            />
                            <input
                                type="password"
                                placeholder="비밀번호"
                                value={registerForm.password}
                                onChange={(e) => setRegisterForm({
                                    ...registerForm,
                                    password: e.target.value
                                })}
                            />
                            <button type="submit">회원가입</button>
                        </form>
                    </div>
                    <div className="auth-form">
                        <h3>로그인</h3>
                        <form onSubmit={handleLogin}>
                            <input
                                type="text"
                                placeholder="사용자명"
                                value={loginForm.username}
                                onChange={(e) => setLoginForm({
                                    ...loginForm,
                                    username: e.target.value
                                })}
                            />
                            <input
                                type="password"
                                placeholder="비밀번호"
                                value={loginForm.password}
                                onChange={(e) => setLoginForm({
                                    ...loginForm,
                                    password: e.target.value
                                })}
                            />
                            <button type="submit">로그인</button>
                        </form>
                    </div>
                </div>

                <div className="process-log">
                    <h3>처리 과정 로그</h3>
                    <div className="log-container">
                        {processLog.map(log => (
                            <div key={log.id} className={`log-item ${log.status} ${log.isNew ? 'new' : ''}`}>
                                <span className="log-time">{log.timestamp}</span>
                                <span className="log-step">{log.step}</span>
                                <span className="log-message">{log.message}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Dashboard; 