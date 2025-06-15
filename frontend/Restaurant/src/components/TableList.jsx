import React, { useState, useEffect } from 'react';
import { getTables } from '../api';

function Spinner() {
  return (
    <div className="spinner-container">
      <div className="spinner"></div>
    </div>
  );
}

function TableList({ date, meal, onSelectTable, onSearch }) {
    const [tables, setTables] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const fetchTables = async () => {
            if (!date || !onSearch) {
                setTables([]);
                return;
            }
            setIsLoading(true);
            const result = await getTables(date, meal);
            setIsLoading(false);
            if (Array.isArray(result)) {
                setTables(result);
            } else {
                alert(result.message);
            }
        };
        fetchTables();
    }, [date, meal, onSearch]);

    if (!date || !onSearch) {
        return <p className="empty-state">날짜를 선택하고 조회 버튼을 눌러주세요.</p>;
    }

    if (isLoading) {
        return <Spinner />;
    }

    return (
        <div className="table-view-container">
            <h3 className="table-title">
                {date} <span className="brand-highlight">{meal === 'lunch' ? '점심' : '저녁'}</span> 예약 가능 테이블
            </h3>
            <div className="table-wrapper">
                <table className="styled-table">
                    <thead>
                        <tr>
                            <th>테이블 ID</th>
                            <th>위치</th>
                            <th>수용 인원</th>
                            <th>예약 상태</th>
                            <th style={{textAlign: 'center'}}>작업</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tables.length > 0 ? tables.map((t) => (
                            <tr key={t.id}>
                                <td style={{fontWeight: '500'}}>{t.id}</td>
                                <td>{t.location}</td>
                                <td>{t.capacity}인</td>
                                <td>
                                    <span className={`status-badge ${
                                        t.status === 'available' ? 'status-available' : 'status-reserved'
                                    }`}>
                                        {t.status === 'available' ? '가능' : '예약됨'}
                                    </span>
                                </td>
                                <td style={{textAlign: 'center'}}>
                                    {t.status === 'available' ? (
                                        <button onClick={() => onSelectTable(t)} className="action-link">
                                            예약하기
                                        </button>
                                    ) : (
                                        <span className="action-disabled">불가능</span>
                                    )}
                                </td>
                            </tr>
                        )) : (
                           <tr><td colSpan="5" style={{textAlign: 'center', padding: '1rem'}}>예약 가능한 테이블이 없습니다.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default TableList;