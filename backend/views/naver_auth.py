import urllib
from flask import Blueprint, request, redirect, jsonify, session
import requests
from functools import wraps
from backend.models import db, User
import os
from dotenv import load_dotenv

load_dotenv()


#------------------------------------------------
def token_required(f):

    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get('Authorization') or request.headers.get('authorization')

        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'error': '토큰 필요'}), 401

        token = auth_header.split('Bearer ')[1].strip()
        token = urllib.parse.unquote(token)

        user = User.query.filter_by(user_nickname=token).first()
        if not user:
            return jsonify({'error': '유저 없음'}), 401

        session['user_id'] = user.user_id
        session['user_name'] = user.user_nickname
        return f(user=user, *args, **kwargs)

    return decorated
#------------------------------------------------

naver_bp = Blueprint('naver_auth', __name__)


@naver_bp.route('/login/naver')
def naver_login_start():
    client_id = os.getenv('NAVER_CLIENT_ID'),
    state = "naver_login_state"
    naver_url = (
        f"https://nid.naver.com/oauth2.0/authorize?"
        f"response_type=code&"
        f"client_id={client_id}&"
        f"redirect_uri=http://localhost:5000/api/login/naver/callback&"
        f"state={state}"
    )
    return redirect(naver_url)


@naver_bp.route('/login/naver/callback')
def naver_callback():
    code = request.args.get('code')
    state = request.args.get('state')

    if not code:
        return jsonify({'error': '인가 코드 없음'}), 400

    # 1. 네이버 액세스 토큰 발급
    token_response = requests.post('https://nid.naver.com/oauth2.0/token', data={
        'client_id': os.getenv('NAVER_CLIENT_ID'),
        'client_secret': os.getenv('NAVER_CLIENT_SECRET'),
        'grant_type': 'authorization_code',
        'state': state,
        'code': code
    })

    token_data = token_response.json()
    access_token = token_data.get('access_token')

    if not access_token:
        return jsonify({'error': '토큰 발급 실패'}), 400

    # 2. 네이버 사용자 정보
    profile_response = requests.get(
        'https://openapi.naver.com/v1/nid/me',
        headers={'Authorization': f'Bearer {access_token}'}
    )
    profile = profile_response.json().get('response', {})

    naver_id = profile.get('id')
    nickname = profile.get('nickname', 'naver_user')
    email = profile.get('email', '')
    image = profile.get('profile_image', 'default.jpg')
    birthyear = profile.get('birthday', '').split('-')[0] if profile.get('birthday') else None

    if not naver_id:
        return jsonify({'error': '사용자 정보 없음'}), 400

    # 3. DB 사용자 조회/생성
    user = User.query.filter_by(user_nickname=f"N{naver_id}").first()

    if not user:
        # 닉네임 중복 체크 (N + naver_id)
        test_nickname = f"N{naver_id}"
        while User.query.filter_by(user_nickname=test_nickname).first():
            test_nickname += "N"

        user = User(
            user_email=email,
            user_nickname=test_nickname,
            user_image=image,
            user_birthdate=birthyear,
            user_is_social=True,
            user_delete=False
        )
        db.session.add(user)
        db.session.commit()


    # 5. 프론트로 리다이렉트 + 로그인 성공
    return jsonify({
        'success': True,
        'nickname': user.user_nickname,
        'message': '네이버 로그인 성공',
        'user': {
            'id': user.user_id,
            'nickname': user.user_nickname,
            'image': user.user_image,
            'is_social': True
        }
    })

@naver_bp.route('/login/naver/result')
@token_required
def naver_result(user):
    return jsonify({
        'success': True,
        'nickname': user.user_nickname,
    })