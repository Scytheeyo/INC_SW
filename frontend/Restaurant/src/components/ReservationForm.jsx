import React, { useState } from 'react';
import { reserve } from '../api';

function ReservationForm({ date, meal, table, onSuccess, onCancel }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [creditCard, setCreditCard] = useState('');
  const [guests, setGuests] = useState(table.capacity);
  const [isLoading, setIsLoading] = useState(false);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const data = { table_id: table.id, date, meal, name, phone, credit_card: creditCard, guests };
    const result = await reserve(data);
    setIsLoading(false);
    if (result.message === '예약이 성공적으로 완료되었습니다.') {
      onSuccess();
    } else {
      alert(result.message);
    }
  };

  return (
    <div className="form-container reservation-form-container">
        <h3 className="form-title">
          테이블 {table.id} <span className="brand-highlight">({table.location}, {table.capacity}인용)</span> 예약
        </h3>
        <form onSubmit={handleSubmit}>
          <div className="form-grid-2 form-group-half">
            <div>
              <label className="form-label">예약 날짜</label>
              <p className="form-static-text">{date}</p>
            </div>
            <div>
              <label className="form-label">식사 종류</label>
              <p className="form-static-text">{meal === 'lunch' ? '점심' : '저녁'}</p>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="res-name">예약자 이름</label>
            <input type="text" id="res-name" value={name} onChange={(e) => setName(e.target.value)} required className="form-input" />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="res-phone">전화번호</label>
            <input type="tel" id="res-phone" value={phone} onChange={(e) => setPhone(e.target.value)} required className="form-input" />
          </div>
           <div className="form-group">
            <label className="form-label" htmlFor="res-cc">신용카드 번호</label>
            <input type="text" id="res-cc" value={creditCard} onChange={(e) => setCreditCard(e.target.value)} required className="form-input" />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="res-guests">인원 수 (최대 {table.capacity}명)</label>
            <input type="number" id="res-guests" min="1" max={table.capacity} value={guests} onChange={(e) => setGuests(parseInt(e.target.value, 10))} required className="form-input" />
          </div>
          <div style={{display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '1rem'}}>
            <button type="button" onClick={onCancel} className="button button-secondary">
              취소
            </button>
            <button type="submit" disabled={isLoading} className="button button-primary">
              {isLoading ? '처리중...' : '예약 확정'}
            </button>
          </div>
        </form>
    </div>
  );
}

export default ReservationForm;