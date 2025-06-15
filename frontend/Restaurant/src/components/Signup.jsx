import React, { useState } from 'react';
import { signup } from '../api';

function Spinner() {
  return (
    <div className="spinner-container">
      <div className="spinner button-spinner"></div>
    </div>
  );
}

function Signup({ onSignup, onSwitchToLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    const result = await signup(username, password);
    setIsLoading(false);
    if (result.message === '회원가입이 성공적으로 완료되었습니다.') {
      alert('회원가입 성공! 로그인 페이지로 이동합니다.');
      onSignup();
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="form-container">
      <form onSubmit={handleSubmit}>
        <h2 className="form-title">회원가입</h2>
        {error && <p className="error-message">{error}</p>}
        <div className="form-group">
          <label className="form-label" htmlFor="username">
            아이디
          </label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="form-input"
            required
          />
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="password">
            비밀번호
          </label>
          <input
            id="password"
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
            {isLoading ? <Spinner /> : '가입하기'}
          </button>
        </div>
        <p className="form-footer-text">
          이미 계정이 있으신가요?{' '}
          <button type="button" onClick={onSwitchToLogin} className="button-link">
            로그인
          </button>
        </p>
      </form>
    </div>
  );
}

export default Signup;