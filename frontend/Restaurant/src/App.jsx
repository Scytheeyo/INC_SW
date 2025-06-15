import React, { useState } from 'react';
import Signup from './components/Signup';
import Login from './components/Login';
import TableList from './components/TableList';
import ReservationForm from './components/ReservationForm';
import MyReservations from './components/MyReservations';
import { logout } from './api';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState('login');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedMeal, setSelectedMeal] = useState('lunch');
  const [selectedTable, setSelectedTable] = useState(null);
  const [searchTrigger, setSearchTrigger] = useState(0);
  
  // ✨ 1. 날짜 유효성 에러 메시지를 저장할 상태 추가
  const [dateError, setDateError] = useState('');

  const handleLogout = async () => {
    await logout();
    setUser(null);
    setView('login');
  };

  const isDateValid = (dateStr) => {
    if (!dateStr) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const chosen = new Date(dateStr + 'T00:00:00');
    if (isNaN(chosen.getTime())) return false;
    const diff = (chosen.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
    return diff >= 0 && diff <= 30;
  };

  // ✨ 2. 날짜가 변경될 때마다 유효성을 검사하는 핸들러 추가
  const handleDateChange = (e) => {
    const newDate = e.target.value;
    setSelectedDate(newDate);
    // 날짜가 선택되었고, 유효하지 않은 경우 에러 메시지 설정
    if (newDate && !isDateValid(newDate)) {
      setDateError('예약 날짜는 오늘 이후, 최대 30일 이내여야 합니다.');
    } else {
      // 유효한 경우 에러 메시지 초기화
      setDateError('');
    }
  };

  const handleSearch = () => {
    // 버튼을 누를 때 한번 더 확실하게 검사 (필수는 아님)
    if (dateError || !selectedDate) {
        alert('유효한 날짜를 선택해주세요.');
        return;
    }
    setSearchTrigger(prev => prev + 1);
  };

  const renderView = () => {
    switch(view) {
      case 'signup':
        return <Signup onSignup={() => setView('login')} onSwitchToLogin={() => setView('login')} />;
      case 'tables':
        return (
          <div className="table-view-container">
            <div className="search-container">
              <div className="search-grid">
                  <div>
                      <label className="form-label">예약 날짜</label>
                      {/* ✨ 3. onChange 핸들러를 새로 만든 함수로 교체 */}
                      <input type="date" value={selectedDate} onChange={handleDateChange} className="form-input"/>
                      {/* ✨ 4. 에러 메시지가 있을 경우 화면에 표시 */}
                      {dateError && <p className="error-message">{dateError}</p>}
                  </div>
                  <div>
                      <label className="form-label">식사 종류</label>
                      <select value={selectedMeal} onChange={(e) => setSelectedMeal(e.target.value)} className="form-input">
                          <option value="lunch">점심</option>
                          <option value="dinner">저녁</option>
                      </select>
                  </div>
                  {/* ✨ 5. 에러가 있거나 날짜가 선택되지 않으면 조회 버튼 비활성화 */}
                  <button onClick={handleSearch} className="button button-primary" style={{height: '46px'}} disabled={!!dateError || !selectedDate}>
                      조회
                  </button>
              </div>
            </div>
            <TableList
              date={selectedDate}
              meal={selectedMeal}
              onSelectTable={(table) => { setSelectedTable(table); setView('reserve'); }}
              onSearch={searchTrigger > 0}
            />
          </div>
        );
      case 'reserve':
        return selectedTable && <ReservationForm date={selectedDate} meal={selectedMeal} table={selectedTable} onSuccess={() => { alert('예약이 성공적으로 완료되었습니다.'); setSelectedTable(null); setView('tables'); }} onCancel={() => { setSelectedTable(null); setView('tables'); }} />;
      case 'myreservations':
        return <MyReservations onBack={() => setView('tables')} />;
      case 'login':
      default:
        return <Login onLogin={() => { setUser({}); setView('tables'); }} onSwitchToSignup={() => setView('signup')} />;
    }
  }

  return (
    <div className="app-container">
      <div className="container-wrapper">
        <header className="app-header">
          <h1>
            <span className="brand-highlight">Taste</span>Book
          </h1>
          {user && (
            <nav>
              <button onClick={() => setView('tables')} className={`button button-nav ${view === 'tables' || view === 'reserve' ? 'active' : ''}`}>예약하기</button>
              <button onClick={() => setView('myreservations')} className={`button button-nav ${view === 'myreservations' ? 'active' : ''}`}>나의 예약</button>
              <button onClick={handleLogout} className="button button-logout">
                로그아웃
              </button>
            </nav>
          )}
        </header>

        <main className="main-content">
            {renderView()}
        </main>
      </div>
    </div>
  );
}

export default App;