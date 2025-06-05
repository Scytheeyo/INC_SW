import React, { useState, useEffect } from 'react';
import Signup from './components/Signup';
import Login from './components/Login';
import TableList from './components/TableList';
import ReservationForm from './components/ReservationForm';
import MyReservations from './components/MyReservations';
import { logout } from './api';

function App() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState('login'); 
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedMeal, setSelectedMeal] = useState('lunch');
  const [selectedTable, setSelectedTable] = useState(null);

  // 간단히 “로그인 성공 시”만 판단. 
  // (앱 초기 로드 때 백엔드에 자동 로그인 체크 API는 만들지 않음)
  const handleLogout = async () => {
    await logout();
    setUser(null);
    setView('login');
  };

  // 날짜 유효성 검사: 오늘 이후, 최대 30일 이내
  const isDateValid = (dateStr) => {
    if (!dateStr) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const chosen = new Date(dateStr + 'T00:00:00');
    if (isNaN(chosen.getTime())) return false;

    const diff = (chosen.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
    return diff >= 0 && diff <= 30;
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      {user && (
        <div>
          <button onClick={() => setView('tables')}>예약하기</button>{' '}
          <button onClick={() => setView('myreservations')}>나의 예약</button>{' '}
          <button onClick={handleLogout}>로그아웃</button>
        </div>
      )}

      {view === 'login' && (
        <Login
          onLogin={() => {
            setUser({}); 
            setView('tables');
          }}
          onSwitchToSignup={() => setView('signup')}
        />
      )}

      {view === 'signup' && (
        <Signup
          onSignup={() => setView('login')}
          onSwitchToLogin={() => setView('login')}
        />
      )}

      {view === 'tables' && (
        <>
          <h2>테이블 예약</h2>
          <div>
            <label>예약 날짜: </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
            <label style={{ marginLeft: '10px' }}>식사 종류: </label>
            <select
              value={selectedMeal}
              onChange={(e) => setSelectedMeal(e.target.value)}
            >
              <option value="lunch">점심</option>
              <option value="dinner">저녁</option>
            </select>
            <button
              style={{ marginLeft: '10px' }}
              onClick={() => {
                if (!isDateValid(selectedDate)) {
                  alert('예약 날짜는 오늘 이후, 최대 30일 이내이어야 합니다.');
                  return;
                }
                // TableList가 자동으로 fetchTables 호출
              }}
            >
              조회
            </button>
          </div>
          <TableList
            date={selectedDate}
            meal={selectedMeal}
            onSelectTable={(table) => {
              setSelectedTable(table);
              setView('reserve');
            }}
          />
        </>
      )}

      {view === 'reserve' && selectedTable && (
        <ReservationForm
          date={selectedDate}
          meal={selectedMeal}
          table={selectedTable}
          onSuccess={() => {
            alert('예약이 성공적으로 완료되었습니다.');
            setSelectedTable(null);
            setView('tables');
          }}
          onCancel={() => {
            setSelectedTable(null);
            setView('tables');
          }}
        />
      )}

      {view === 'myreservations' && (
        <MyReservations onBack={() => setView('tables')} />
      )}
    </div>
  );
}

export default App;
