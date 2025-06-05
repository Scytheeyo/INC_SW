import React, { useState, useEffect } from 'react';
import { getMyReservations, cancelReservation } from '../api';

function MyReservations({ onBack }) {
  const [reservations, setReservations] = useState([]);

  const fetchReservations = async () => {
    const result = await getMyReservations();
    if (Array.isArray(result)) {
      setReservations(result);
    } else {
      alert(result.message);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  const handleCancel = async (id) => {
    const confirmCancel = window.confirm(
      '정말로 이 예약을 취소하시겠습니까?'
    );
    if (!confirmCancel) return;
    const result = await cancelReservation(id);
    if (result.message === '예약이 성공적으로 취소되었습니다.') {
      alert('예약이 취소되었습니다.');
      fetchReservations();
    } else {
      alert(result.message);
    }
  };

  return (
    <div>
      <h2>나의 예약 내역</h2>
      <button onClick={onBack}>뒤로</button>
      {reservations.length === 0 ? (
        <p>예약 내역이 없습니다.</p>
      ) : (
        <table border="1" cellPadding="5" cellSpacing="0">
          <thead>
            <tr>
              <th>예약 ID</th>
              <th>테이블 ID</th>
              <th>위치</th>
              <th>수용 인원</th>
              <th>날짜</th>
              <th>식사</th>
              <th>예약자</th>
              <th>전화번호</th>
              <th>인원 수</th>
              <th>취소 가능</th>
            </tr>
          </thead>
          <tbody>
            {reservations.map((r) => (
              <tr key={r.id}>
                <td>{r.id}</td>
                <td>{r.table_id}</td>
                <td>{r.location}</td>
                <td>{r.capacity}</td>
                <td>{r.date}</td>
                <td>{r.meal === 'lunch' ? '점심' : '저녁'}</td>
                <td>{r.name}</td>
                <td>{r.phone}</td>
                <td>{r.guests}</td>
                <td>
                  {r.cancellable ? (
                    <button onClick={() => handleCancel(r.id)}>
                      취소
                    </button>
                  ) : (
                    '불가'
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default MyReservations;
