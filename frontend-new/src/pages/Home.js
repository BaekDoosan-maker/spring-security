import React, { useState, useEffect } from 'react';
import axios from '../utils/axios';
import '../styles/Home.css';

function Home() {
    const [securityProcess, setSecurityProcess] = useState({
        formLogin: {
            status: 'pending',
            details: null
        },
        authenticationFilter: {
            status: 'pending',
            token: null
        },
        authenticationManager: {
            status: 'pending',
            provider: null
        },
        userDetailsService: {
            status: 'pending',
            userDetails: null
        },
        securityContext: {
            status: 'pending',
            authentication: null
        },
        finalAccess: {
            status: 'pending',
            message: null
        },
        requestPreProcess: {
            status: 'pending',
            details: null
        },
        tokenCreation: {
            status: 'pending',
            details: null
        },
        serverResponse: {
            status: 'pending',
            response: null
        }
    });

    useEffect(() => {
        simulateSecurityProcess();
    }, []);

    const simulateSecurityProcess = async () => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                // 1. Form Login 요청 시뮬레이션
                setSecurityProcess(prev => ({
                    ...prev,
                    formLogin: {
                        status: 'success',
                        details: {
                            requestType: 'POST',
                            endpoint: '/api/auth/login',
                            timestamp: new Date().toLocaleString(),
                            requestBody: {
                                username: '입력된 사용자명',
                                password: '********'
                            }
                        }
                    }
                }));

                // 1-1. 요청 전처리
                await new Promise(resolve => setTimeout(resolve, 2000));
                setSecurityProcess(prev => ({
                    ...prev,
                    requestPreProcess: {
                        status: 'success',
                        details: {
                            filterChain: [
                                'SecurityContextPersistenceFilter',
                                'LogoutFilter',
                                'UsernamePasswordAuthenticationFilter'
                            ],
                            currentFilter: 'UsernamePasswordAuthenticationFilter'
                        }
                    }
                }));

                // 2. AuthenticationFilter 처리
                await new Promise(resolve => setTimeout(resolve, 2000));
                const tokenParts = token.split('.');
                const tokenPayload = JSON.parse(atob(tokenParts[1]));
                setSecurityProcess(prev => ({
                    ...prev,
                    authenticationFilter: {
                        status: 'success',
                        token: {
                            type: 'UsernamePasswordAuthenticationToken',
                            credentials: '******',
                            principal: tokenPayload.sub,
                            raw: {
                                header: tokenParts[0],
                                payload: tokenParts[1],
                                signature: tokenParts[2].substring(0, 10) + '...'
                            }
                        }
                    }
                }));

                // 2-1. 토큰 생성 과정
                await new Promise(resolve => setTimeout(resolve, 2000));
                setSecurityProcess(prev => ({
                    ...prev,
                    tokenCreation: {
                        status: 'success',
                        details: {
                            tokenType: 'JWT',
                            algorithm: 'HS256',
                            headerInfo: {
                                alg: 'HS256',
                                typ: 'JWT'
                            },
                            payloadInfo: {
                                sub: tokenPayload.sub,
                                iat: new Date(tokenPayload.iat * 1000).toLocaleString(),
                                exp: new Date(tokenPayload.exp * 1000).toLocaleString()
                            }
                        }
                    }
                }));

                // 2-2. 서버 응답 표시
                await new Promise(resolve => setTimeout(resolve, 2000));
                setSecurityProcess(prev => ({
                    ...prev,
                    serverResponse: {
                        status: 'success',
                        response: {
                            success: true,
                            access_token: token,
                            refresh_token: "eyJhbGciOiJIUzI1NiJ9...", // 실제 refresh 토큰
                            expires_in: 7200
                        }
                    }
                }));

                // 2-2. 서버 응답 수신
                await new Promise(resolve => setTimeout(resolve, 2000));
                setSecurityProcess(prev => ({
                    ...prev,
                    serverResponse: {
                        status: 'success',
                        response: {
                            success: true,
                            access_token: token,
                            refresh_token: "eyJhbGciOiJIUzI1NiJ9...", // 실제 refresh 토큰
                            expires_in: 7200
                        }
                    }
                }));

                // 3. AuthenticationManager 처리
                await new Promise(resolve => setTimeout(resolve, 2000));
                setSecurityProcess(prev => ({
                    ...prev,
                    authenticationManager: {
                        status: 'success',
                        provider: {
                            type: 'DaoAuthenticationProvider',
                            supports: 'UsernamePasswordAuthenticationToken',
                            providerChain: [
                                'JwtAuthenticationProvider',
                                'DaoAuthenticationProvider',
                                'AnonymousAuthenticationProvider'
                            ]
                        }
                    }
                }));

                // 4. UserDetailsService 처리
                await new Promise(resolve => setTimeout(resolve, 2000));
                setSecurityProcess(prev => ({
                    ...prev,
                    userDetailsService: {
                        status: 'success',
                        userDetails: {
                            username: tokenPayload.sub,
                            authorities: tokenPayload.authorities || ['ROLE_USER'],
                            accountNonExpired: true,
                            accountNonLocked: true,
                            credentialsNonExpired: true,
                            enabled: true
                        }
                    }
                }));

                // 5. SecurityContext 저장
                await new Promise(resolve => setTimeout(resolve, 2000));
                setSecurityProcess(prev => ({
                    ...prev,
                    securityContext: {
                        status: 'success',
                        authentication: {
                            authenticated: true,
                            principal: tokenPayload.sub,
                            authorities: tokenPayload.authorities || ['ROLE_USER']
                        }
                    }
                }));

                // 6. 최종 접근 확인
                await new Promise(resolve => setTimeout(resolve, 2000));
                try {
                    const response = await axios.get('/api/auth/protected');
                    setSecurityProcess(prev => ({
                        ...prev,
                        finalAccess: {
                            status: 'success',
                            message: response.data
                        }
                    }));
                } catch (error) {
                    setSecurityProcess(prev => ({
                        ...prev,
                        finalAccess: {
                            status: 'error',
                            message: '접근 권한이 없습니다.'
                        }
                    }));
                }

            } catch (error) {
                console.error('Security process simulation error:', error);
            }
        }
    };

    const SecurityStep = ({ title, status, details, description }) => (
        <div className={`security-step ${status}`}>
            <div className="step-header">
                <div className="step-title">
                    <h3>{title}</h3>
                    <p className="step-description">{description}</p>
                </div>
                <span className={`status-badge ${status}`}>
                    {status === 'pending' ? '진행 중...' :
                     status === 'success' ? '성공' : '실패'}
                </span>
            </div>
            <div className="step-details">
                {details}
            </div>
        </div>
    );

    return (
        <div className="home-container">
            <h1>스프링 시큐리티 인증 프로세스</h1>
            
            <div className="security-process">
                <SecurityStep
                    title="1. Form Login 요청"
                    status={securityProcess.formLogin.status}
                    description="사용자가 로그인 폼을 통해 인증 요청을 전송합니다."
                    details={
                        securityProcess.formLogin.details ? (
                            <div className="process-info">
                                <p>요청 유형: {securityProcess.formLogin.details.requestType}</p>
                                <p>엔드포인트: {securityProcess.formLogin.details.endpoint}</p>
                                <p>요청 시간: {securityProcess.formLogin.details.timestamp}</p>
                                <p>요청 본문:</p>
                                <pre className="code-block">
                                    {JSON.stringify(securityProcess.formLogin.details.requestBody, null, 2)}
                                </pre>
                            </div>
                        ) : (
                            <p>로그인 요청 대기 중...</p>
                        )
                    }
                />

                <div className="process-arrow">↓</div>

                <SecurityStep
                    title="1-1. 요청 전처리"
                    status={securityProcess.requestPreProcess?.status || 'pending'}
                    description="Spring Security Filter Chain을 통한 요청 처리"
                    details={
                        securityProcess.requestPreProcess?.details ? (
                            <div className="process-info">
                                <p>필터 체인 순서:</p>
                                <ol>
                                    {securityProcess.requestPreProcess.details.filterChain.map((filter, index) => (
                                        <li key={index} className={filter === securityProcess.requestPreProcess.details.currentFilter ? 'current-filter' : ''}>
                                            {filter}
                                        </li>
                                    ))}
                                </ol>
                                <p>현재 필터: {securityProcess.requestPreProcess.details.currentFilter}</p>
                            </div>
                        ) : (
                            <p>필터 체인 처리 중...</p>
                        )
                    }
                />

                <div className="process-arrow">↓</div>

                <SecurityStep
                    title="2-1. JWT 토큰 생성"
                    status={securityProcess.tokenCreation?.status || 'pending'}
                    description="인증 정보를 기반으로 JWT 토큰 생성"
                    details={
                        securityProcess.tokenCreation?.details ? (
                            <div className="process-info">
                                <p>토큰 유형: {securityProcess.tokenCreation.details.tokenType}</p>
                                <p>사용 알고리즘: {securityProcess.tokenCreation.details.algorithm}</p>
                                <div className="token-structure">
                                    <h4>토큰 구조:</h4>
                                    <div className="token-part header">
                                        <h5>Header</h5>
                                        <pre className="code-block">
                                            {JSON.stringify(securityProcess.tokenCreation.details.headerInfo, null, 2)}
                                        </pre>
                                    </div>
                                    <div className="token-part payload">
                                        <h5>Payload</h5>
                                        <pre className="code-block">
                                            {JSON.stringify(securityProcess.tokenCreation.details.payloadInfo, null, 2)}
                                        </pre>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <p>토큰 생성 중...</p>
                        )
                    }
                />

                <div className="process-arrow">↓</div>

                <SecurityStep
                    title="2-2. 서버 응답 수신"
                    status={securityProcess.serverResponse?.status || 'pending'}
                    description="서버로부터 JWT 토큰이 포함된 인증 응답을 받습니다."
                    details={
                        securityProcess.serverResponse?.response ? (
                            <div className="process-info">
                                <p>서버 응답:</p>
                                <div className="server-response">
                                    <pre className="code-block">
                                        {JSON.stringify(securityProcess.serverResponse.response, null, 2)}
                                    </pre>
                                    <div className="token-breakdown">
                                        <h4>Access Token 구조 분석</h4>
                                        <div className="token-parts">
                                            {securityProcess.serverResponse.response.access_token.split('.').map((part, index) => (
                                                <div key={index} className={`token-segment part-${index}`}>
                                                    <h5>{index === 0 ? 'Header' : index === 1 ? 'Payload' : 'Signature'}</h5>
                                                    <div className="token-content">
                                                        <code>{part}</code>
                                                    </div>
                                                    {index !== 2 && (
                                                        <div className="decoded-content">
                                                            <h6>디코딩된 내용:</h6>
                                                            <pre>
                                                                {JSON.stringify(
                                                                    JSON.parse(atob(part)), 
                                                                    null, 
                                                                    2
                                                                )}
                                                            </pre>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <p>서버 응답 대기 중...</p>
                        )
                    }
                />

                <div className="process-arrow">↓</div>

                <SecurityStep
                    title="2. AuthenticationFilter 처리"
                    status={securityProcess.authenticationFilter.status}
                    description="UsernamePasswordAuthenticationFilter가 인증 토큰을 생성합니다."
                    details={
                        securityProcess.authenticationFilter.token ? (
                            <div className="process-info">
                                <p>토큰 타입: {securityProcess.authenticationFilter.token.type}</p>
                                <p>사용자명: {securityProcess.authenticationFilter.token.principal}</p>
                                <p>자격증명: {securityProcess.authenticationFilter.token.credentials}</p>
                            </div>
                        ) : (
                            <p>인증 토큰 생성 중...</p>
                        )
                    }
                />

                <div className="process-arrow">↓</div>

                <SecurityStep
                    title="3. AuthenticationManager 위임"
                    status={securityProcess.authenticationManager.status}
                    description="적절한 AuthenticationProvider를 선택하여 인증을 위임합니다."
                    details={
                        securityProcess.authenticationManager.provider ? (
                            <div className="process-info">
                                <p>제공자 유형: {securityProcess.authenticationManager.provider.type}</p>
                                <p>지원 토큰: {securityProcess.authenticationManager.provider.supports}</p>
                            </div>
                        ) : (
                            <p>인증 제공자 선택 중...</p>
                        )
                    }
                />

                <div className="process-arrow">↓</div>

                <SecurityStep
                    title="4. UserDetailsService 조회"
                    status={securityProcess.userDetailsService.status}
                    description="DB에서 사용자 정보를 조회하고 UserDetails 객체를 생성합니다."
                    details={
                        securityProcess.userDetailsService.userDetails ? (
                            <div className="process-info">
                                <p>사용자명: {securityProcess.userDetailsService.userDetails.username}</p>
                                <p>권한: {securityProcess.userDetailsService.userDetails.authorities.join(', ')}</p>
                                <p>계정 상태:</p>
                                <ul>
                                    <li>활성화: {securityProcess.userDetailsService.userDetails.enabled ? '예' : '아니오'}</li>
                                    <li>잠금: {securityProcess.userDetailsService.userDetails.accountNonLocked ? '없음' : '있음'}</li>
                                    <li>만료: {securityProcess.userDetailsService.userDetails.accountNonExpired ? '없음' : '있음'}</li>
                                </ul>
                            </div>
                        ) : (
                            <p>사용자 정보 조회 중...</p>
                        )
                    }
                />

                <div className="process-arrow">↓</div>

                <SecurityStep
                    title="5. SecurityContext 저장"
                    status={securityProcess.securityContext.status}
                    description="인증된 사용자 정보를 SecurityContext에 저장합니다."
                    details={
                        securityProcess.securityContext.authentication ? (
                            <div className="process-info">
                                <p>인증 상태: {securityProcess.securityContext.authentication.authenticated ? '인증됨' : '미인증'}</p>
                                <p>사용자: {securityProcess.securityContext.authentication.principal}</p>
                                <p>부여된 권한: {securityProcess.securityContext.authentication.authorities.join(', ')}</p>
                            </div>
                        ) : (
                            <p>보안 컨텍스트 설정 중...</p>
                        )
                    }
                />

                <div className="process-arrow">↓</div>

                <SecurityStep
                    title="6. 최종 접근 확인"
                    status={securityProcess.finalAccess.status}
                    description="보호된 리소스에 대한 접근을 확인합니다."
                    details={
                        securityProcess.finalAccess.message ? (
                            <div className="process-info">
                                <p>{securityProcess.finalAccess.message}</p>
                            </div>
                        ) : (
                            <p>접근 권한 확인 중...</p>
                        )
                    }
                />
            </div>
        </div>
    );
}

export default Home; 