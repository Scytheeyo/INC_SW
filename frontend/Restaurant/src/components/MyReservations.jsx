import React, { useState, useEffect } from 'react';
import { getMyReservations, cancelReservation } from '../api';

function Spinner() {
  return (
    <div className="spinner-container">
      <div className="spinner"></div>
    </div>
  );
}

function MyReservations({ onBack }) {
  const [reservations, setReservations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchReservations = async () => {
    setIsLoading(true);
    const result = await getMyReservations();
    if (Array.isArray(result)) {
      setReservations(result);
    } else {
      alert(result.message);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  const handleCancel = async (id) => {
    if (!window.confirm('정말로 이 예약을 취소하시겠습니까?')) return;
    
    const result = await cancelReservation(id);
    if (result.message === '예약이 성공적으로 완료되었습니다.') {
      alert('예약이 취소되었습니다.');
      fetchReservations();
    } else {
      alert(result.message);
    }
  };

  return (
    <div className="table-view-container">
       <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem'}}>
         <h2 className="table-title" style={{marginBottom: 0}}>나의 예약 내역</h2>
         <button onClick={onBack} className="button button-secondary">
            ← 뒤로가기
          </button>
      </div>
      {isLoading ? <Spinner /> : reservations.length === 0 ? (
        <p className="empty-state">예약 내역이 없습니다.</p>
      ) : (
        <div className="table-wrapper">
          <table className="styled-table">
            <thead>
              <tr>
                <th>예약일</th>
                <th>식사</th>
                <th>테이블</th>
                <th>예약자</th>
                <th>인원</th>
                <th style={{textAlign: 'center'}}>취소</th>
              </tr>
            </thead>
            <tbody>
              {reservations.map((r) => (
                <tr key={r.id}>
                  <td style={{fontWeight: 500}}>{r.date}</td>
                  <td>{r.meal === 'lunch' ? '점심' : '저녁'}</td>
                  <td>ID {r.table_id} ({r.location}, {r.capacity}인)</td>
                  <td>{r.name} ({r.phone})</td>
                  <td>{r.guests}명</td>
                  <td style={{textAlign: 'center'}}>
                    {r.cancellable ? (
                      <button onClick={() => handleCancel(r.id)} className="action-link cancel">
                        취소
                      </button>
                    ) : (
                      <span className="action-disabled">불가</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default MyReservations;