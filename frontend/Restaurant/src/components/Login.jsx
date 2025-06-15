import React, { useState } from 'react';
import { login } from '../api';

function Spinner() {
  return (
    <div className="spinner-container">
      <div className="spinner button-spinner"></div>
    </div>
  );
}

function Login({ onLogin, onSwitchToSignup }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    const result = await login(username, password);
    setIsLoading(false);
    if (result.message === '로그인 성공') {
      onLogin();
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="form-container">
      <form onSubmit={handleSubmit}>
        <h2 className="form-title">로그인</h2>
        {error && <p className="error-message">{error}</p>}
        <div className="form-group">
          <label className="form-label" htmlFor="login-username">
            아이디
          </label>
          <input
            id="login-username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="form-input"
            required
          />
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="login-password">
            비밀번호
          </label>
          <input
            id="login-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="form-input"
            required
          />
        </div>
        <div className="form-group">
          <button
            type="submit"
            className="button button-primary"
            style={{ width: '100%' }}
            disabled={isLoading}
          >
            {isLoading ? <Spinner /> : '로그인'}
          </button>
        </div>
        <p className="form-footer-text">
          아직 계정이 없으신가요?{' '}
          <button type="button" onClick={onSwitchToSignup} className="button-link">
            회원가입
          </button>
        </p>
      </form>
    </div>
  );
}

export default Login;