import React, { useState } from 'react';
import { signup } from '../api';

function Signup({ onSignup, onSwitchToLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await signup(username, password);
    if (result.message === '회원가입이 성공적으로 완료되었습니다.') {
      alert('회원가입 성공! 로그인 페이지로 이동합니다.');
      onSignup();
    } else {
      alert(result.message);
    }
  };

  return (
    <div>
      <h2>회원가입</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>아이디: </label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div>
          <label>비밀번호: </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">가입하기</button>
      </form>
      <p>
        이미 계정이 있으신가요?{' '}
        <button onClick={onSwitchToLogin}>로그인</button>
      </p>
    </div>
  );
}

export default Signup;
