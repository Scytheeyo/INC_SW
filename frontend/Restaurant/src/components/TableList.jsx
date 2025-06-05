import React, { useState, useEffect } from 'react';
import { getTables } from '../api';

function TableList({ date, meal, onSelectTable }) {
  const [tables, setTables] = useState([]);

  useEffect(() => {
    const fetchTables = async () => {
      if (!date) {
        setTables([]);
        return;
      }
      const result = await getTables(date, meal);
      if (Array.isArray(result)) {
        setTables(result);
      } else {
        alert(result.message);
      }
    };
    fetchTables();
  }, [date, meal]);

  if (!date) {
    return <p>날짜를 선택하고 조회 버튼을 눌러주세요.</p>;
  }

  return (
    <div>
      <h3>
        {date} {meal === 'lunch' ? '점심' : '저녁'} 예약 가능한 테이블
      </h3>
      <table border="1" cellPadding="5" cellSpacing="0">
        <thead>
          <tr>
            <th>테이블 ID</th>
            <th>위치</th>
            <th>수용 인원</th>
            <th>예약 상태</th>
            <th>예약하기</th>
          </tr>
        </thead>
        <tbody>
          {tables.map((t) => (
            <tr key={t.id}>
              <td>{t.id}</td>
              <td>{t.location}</td>
              <td>{t.capacity}</td>
              <td>
                {t.status === 'available' ? '가능' : '예약됨'}
              </td>
              <td>
                {t.status === 'available' ? (
                  <button onClick={() => onSelectTable(t)}>
                    예약하기
                  </button>
                ) : (
                  <button disabled>불가능</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default TableList;
