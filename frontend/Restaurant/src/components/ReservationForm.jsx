import React, { useState } from 'react';
import { reserve } from '../api';

function ReservationForm({ date, meal, table, onSuccess, onCancel }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [creditCard, setCreditCard] = useState('');
  const [guests, setGuests] = useState(table.capacity);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = {
      table_id: table.id,
      date: date,
      meal: meal,
      name,
      phone,
      credit_card: creditCard,
      guests,
    };
    const result = await reserve(data);
    if (result.message === '예약이 성공적으로 완료되었습니다.') {
      onSuccess();
    } else {
      alert(result.message);
    }
  };

  return (
    <div>
      <h3>
        테이블 {table.id} ({table.location}, {table.capacity}인용) 예약하기
      </h3>
      <form onSubmit={handleSubmit}>
        <div>
          <label>예약자 이름: </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div>
          <label>전화번호: </label>
          <input
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />
        </div>
        <div>
          <label>신용카드 번호: </label>
          <input
            type="text"
            value={creditCard}
            onChange={(e) => setCreditCard(e.target.value)}
            required
          />
        </div>
        <div>
          <label>인원 수: </label>
          <input
            type="number"
            min="1"
            max={table.capacity}
            value={guests}
            onChange={(e) => setGuests(parseInt(e.target.value, 10))}
            required
          />
        </div>
        <button type="submit">예약 확정</button>{' '}
        <button type="button" onClick={onCancel}>
          취소
        </button>
      </form>
    </div>
  );
}

export default ReservationForm;
