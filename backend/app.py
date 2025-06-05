# backend/app.py

from flask import Flask, request, jsonify, session, g
from flask_cors import CORS
import sqlite3
from datetime import datetime, date

app = Flask(__name__)
app.secret_key = 'your-secret-key'

# ---------------------------------------------------
# CORS 설정
# ---------------------------------------------------
CORS(
    app,
    supports_credentials=True,
    resources={r"/api/*": {"origins": ["http://localhost:3000"]}}
)

# ---------------------------------------------------
# SQLite DB 연결
# ---------------------------------------------------
DATABASE = 'database.db'

def get_db():
    if not hasattr(g, '_database'):
        conn = sqlite3.connect(DATABASE, check_same_thread=False)
        conn.row_factory = sqlite3.Row
        g._database = conn
    return g._database

@app.teardown_appcontext
def close_connection(exception):
    db = getattr(g, '_database', None)
    if db is not None:
        db.close()

# ---------------------------------------------------
# DB 초기화
# ---------------------------------------------------
def init_db():
    db = get_db()
    cursor = db.cursor()

    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL
        );
    ''')

    cursor.execute('''
        CREATE TABLE IF NOT EXISTS tables (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            location TEXT NOT NULL,
            capacity INTEGER NOT NULL
        );
    ''')

    cursor.execute('''
        CREATE TABLE IF NOT EXISTS reservations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            table_id INTEGER NOT NULL,
            date TEXT NOT NULL,
            meal TEXT NOT NULL,
            name TEXT NOT NULL,
            phone TEXT NOT NULL,
            credit_card TEXT NOT NULL,
            guests INTEGER NOT NULL,
            FOREIGN KEY(user_id) REFERENCES users(id),
            FOREIGN KEY(table_id) REFERENCES tables(id)
        );
    ''')

    cursor.execute('SELECT COUNT(*) AS cnt FROM tables;')
    row = cursor.fetchone()
    if row['cnt'] == 0:
        sample_tables = [
            ('window', 2),
            ('window', 4),
            ('inside', 6),
            ('inside', 8),
            ('room', 4),
            ('room', 6),
        ]
        cursor.executemany(
            'INSERT INTO tables (location, capacity) VALUES (?, ?);',
            sample_tables
        )

    db.commit()

with app.app_context():
    init_db()

# ---------------------------------------------------
# 로그인 상태 확인 데코레이터
# ---------------------------------------------------
def login_required(f):
    from functools import wraps
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            return jsonify({'message': '로그인이 필요합니다.'}), 401
        return f(*args, **kwargs)
    return decorated_function

# ---------------------------------------------------
# 회원가입 엔드포인트
# ---------------------------------------------------
@app.route('/api/signup', methods=['POST'])
def signup():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({'message': '아이디와 비밀번호를 입력하세요.'}), 400

    db = get_db()
    cursor = db.cursor()

    cursor.execute('SELECT id FROM users WHERE username = ?;', (username,))
    if cursor.fetchone() is not None:
        return jsonify({'message': '이미 사용 중인 아이디입니다.'}), 400

    cursor.execute(
        'INSERT INTO users (username, password) VALUES (?, ?);',
        (username, password)
    )
    db.commit()
    return jsonify({'message': '회원가입이 성공적으로 완료되었습니다.'}), 201

# ---------------------------------------------------
# 로그인 엔드포인트
# ---------------------------------------------------
@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({'message': '아이디와 비밀번호를 입력하세요.'}), 400

    db = get_db()
    cursor = db.cursor()
    cursor.execute(
        'SELECT id, password FROM users WHERE username = ?;',
        (username,)
    )
    row = cursor.fetchone()

    if row is None or row['password'] != password:
        return jsonify({'message': '아이디 또는 비밀번호가 잘못되었습니다.'}), 401

    session.clear()
    session['user_id'] = row['id']
    return jsonify({'message': '로그인 성공'}), 200

# ---------------------------------------------------
# 로그아웃 엔드포인트
# ---------------------------------------------------
@app.route('/api/logout', methods=['POST'])
def logout():
    session.clear()
    return jsonify({'message': '로그아웃 되었습니다.'}), 200

# ---------------------------------------------------
# 테이블 조회 엔드포인트
# ---------------------------------------------------
@app.route('/api/tables', methods=['GET'])
@login_required
def get_tables():
    date_str = request.args.get('date')
    meal = request.args.get('meal')

    if not date_str or meal not in ['lunch', 'dinner']:
        return jsonify({'message': '날짜와 식사 종류를 정확히 입력하세요.'}), 400

    db = get_db()
    cursor = db.cursor()

    cursor.execute('SELECT id, location, capacity FROM tables;')
    tables = cursor.fetchall()

    result = []
    for t in tables:
        table_id = t['id']
        cursor.execute(
            'SELECT id FROM reservations WHERE table_id = ? AND date = ? AND meal = ?;',
            (table_id, date_str, meal)
        )
        exists = cursor.fetchone() is not None
        status = 'reserved' if exists else 'available'
        result.append({
            'id': table_id,
            'location': t['location'],
            'capacity': t['capacity'],
            'status': status
        })

    return jsonify(result), 200

# ---------------------------------------------------
# 예약 생성 엔드포인트
# ---------------------------------------------------
@app.route('/api/reserve', methods=['POST'])
@login_required
def make_reservation():
    data = request.get_json()
    table_id    = data.get('table_id')
    date_str    = data.get('date')
    meal        = data.get('meal')
    name        = data.get('name')
    phone       = data.get('phone')
    credit_card = data.get('credit_card')
    guests      = data.get('guests')

    if not all([table_id, date_str, meal, name, phone, credit_card, guests]):
        return jsonify({'message': '모든 예약 정보를 입력해야 합니다.'}), 400
    if meal not in ['lunch', 'dinner']:
        return jsonify({'message': '잘못된 식사 종류입니다.'}), 400

    try:
        target_date = datetime.strptime(date_str, '%Y-%m-%d').date()
    except ValueError:
        return jsonify({'message': '날짜 형식이 올바르지 않습니다.'}), 400

    today = date.today()
    # 다음 달 같은 날짜 계산
    if today.month == 12:
        limit_year = today.year + 1
        limit_month = 1
    else:
        limit_year = today.year
        limit_month = today.month + 1
    limit_day = today.day
    try:
        allowed_date = date(limit_year, limit_month, limit_day)
    except ValueError:
        # 예: 1월 31일 → 2월 31일은 존재하지 않으므로, 2월 마지막 날을 사용
        if limit_month == 2:
            # 2월의 마지막 일자 계산
            if (limit_year % 4 == 0 and limit_year % 100 != 0) or (limit_year % 400 == 0):
                feb_last = 29
            else:
                feb_last = 28
            allowed_date = date(limit_year, limit_month, feb_last)
        else:
            # 4,6,9,11월은 30일까지, 1,3,5,7,8,10,12월은 31일까지
            if limit_month in [4, 6, 9, 11]:
                allowed_date = date(limit_year, limit_month, 30)
            else:
                allowed_date = date(limit_year, limit_month, 31)

    if target_date < today:
        return jsonify({'message': '예약일은 오늘 이후여야 합니다.'}), 400
    if target_date > allowed_date:
        return jsonify({'message': f'예약은 {today.strftime("%Y-%m-%d")}부터 {allowed_date.strftime("%Y-%m-%d")}까지 가능합니다.'}), 400

    db = get_db()
    cursor = db.cursor()

    cursor.execute('SELECT id FROM tables WHERE id = ?;', (table_id,))
    if cursor.fetchone() is None:
        return jsonify({'message': '존재하지 않는 테이블입니다.'}), 404

    cursor.execute(
        'SELECT id FROM reservations WHERE table_id = ? AND date = ? AND meal = ?;',
        (table_id, date_str, meal)
    )
    if cursor.fetchone() is not None:
        return jsonify({'message': '이미 예약된 테이블입니다.'}), 400

    cursor.execute(
        '''
        INSERT INTO reservations
          (user_id, table_id, date, meal, name, phone, credit_card, guests)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?);
        ''',
        (session['user_id'], table_id, date_str, meal, name, phone, credit_card, guests)
    )
    db.commit()
    return jsonify({'message': '예약이 성공적으로 완료되었습니다.'}), 201

# ---------------------------------------------------
# 내 예약 조회 엔드포인트
# ---------------------------------------------------
@app.route('/api/myreservations', methods=['GET'])
@login_required
def my_reservations():
    db = get_db()
    cursor = db.cursor()

    cursor.execute(
        '''
        SELECT
          r.id, r.table_id, t.location, t.capacity,
          r.date, r.meal, r.name, r.phone, r.guests
        FROM reservations r
        JOIN tables t ON r.table_id = t.id
        WHERE r.user_id = ?
        ORDER BY r.id ASC;
        ''',
        (session['user_id'],)
    )
    rows = cursor.fetchall()

    result = []
    for r in rows:
        try:
            res_date = datetime.strptime(r['date'], '%Y-%m-%d').date()
        except ValueError:
            cancellable = True
        else:
            today = date.today()
            diff_days = (res_date - today).days
            cancellable = (diff_days >= 1)

        result.append({
            'id': r['id'],
            'table_id': r['table_id'],
            'location': r['location'],
            'capacity': r['capacity'],
            'date': r['date'],
            'meal': r['meal'],
            'name': r['name'],
            'phone': r['phone'],
            'guests': r['guests'],
            'cancellable': cancellable
        })

    return jsonify(result), 200

# ---------------------------------------------------
# 예약 취소 엔드포인트
# ---------------------------------------------------
@app.route('/api/cancel', methods=['POST'])
@login_required
def cancel_reservation():
    data = request.get_json()
    reservation_id = data.get('reservation_id')
    if not reservation_id:
        return jsonify({'message': '취소할 예약 ID를 입력하세요.'}), 400

    db = get_db()
    cursor = db.cursor()

    cursor.execute(
        'SELECT user_id, date FROM reservations WHERE id = ?;',
        (reservation_id,)
    )
    row = cursor.fetchone()
    if row is None or row['user_id'] != session['user_id']:
        return jsonify({'message': '해당 예약이 존재하지 않거나 권한이 없습니다.'}), 404

    try:
        res_date = datetime.strptime(row['date'], '%Y-%m-%d').date()
    except ValueError:
        return jsonify({'message': '예약일 정보가 올바르지 않습니다.'}), 400

    today = date.today()
    diff_days = (res_date - today).days
    if diff_days >= 1:
        cursor.execute('DELETE FROM reservations WHERE id = ?;', (reservation_id,))
        db.commit()
        return jsonify({'message': '예약이 성공적으로 취소되었습니다.'}), 200
    else:
        return jsonify({'message': '예약 당일 또는 이미 지난 예약은 취소할 수 없습니다.'}), 400

# ---------------------------------------------------
# 메인 진입점
# ---------------------------------------------------
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
