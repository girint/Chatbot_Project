#backend/views/mypage.py

from flask import request, jsonify, Blueprint, current_app
from functools import wraps
from werkzeug.security import generate_password_hash
from werkzeug.utils import secure_filename
import os, uuid
from backend.models import db, User
from urllib.parse import unquote

mypage_bp = Blueprint("mypage", __name__)

def token_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        auth_header = request.headers.get("Authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            return jsonify({'success': False, 'message': '로그인 필요합니다.'}), 401

        raw_token = auth_header.replace("Bearer ", "")
        nickname_token = unquote(raw_token)

        user = User.query.filter_by(user_nickname=nickname_token,user_delete=False).first()
        if not user:
            return jsonify({'success': False, 'message': '유저를 찾을 수 없습니다.'}), 404

        return f(user=user, *args, **kwargs)  # user 객체를 함수에 전달

    return decorated_function


@mypage_bp.route("/users/mypage", methods=["PATCH"])
@token_required
def update_user_profile(user):
    """로그인한 사용자 프로필 수정 API"""
    data = request.form              # multipart/form-data 기준
    file = request.files.get("image")

    updated = False

    # 닉네임 수정
    if 'nickname' in data and data['nickname'] != user.user_nickname:
        if User.query.filter_by(user_nickname=data['nickname']).first():
            return jsonify({'success': False, 'message': '닉네임이 이미 사용중입니다.'}), 409
        user.user_nickname = data['nickname']
        updated = True

    # 비밀번호 수정
    if 'password' in data and data['password']:
        user.user_password = generate_password_hash(data['password'])
        updated = True

    # 이미지 수정 → backend/static/profile_images 저장
    if file and file.filename:
        upload_folder = os.path.join(current_app.root_path, "static", "profile_images")
        os.makedirs(upload_folder, exist_ok=True)

        ext = os.path.splitext(file.filename)[1]
        random_name = f"{uuid.uuid4().hex}{ext}"
        filename = secure_filename(random_name)

        save_path = os.path.join(upload_folder, filename)
        file.save(save_path)

        user.user_image = f"/static/profile_images/{filename}"
        updated = True

    # 아무 것도 안 바뀐 경우
    if not updated:
        return jsonify({'success': False, 'message': '수정할 필드가 없습니다.'}), 400

    try:
        db.session.commit()
        return jsonify({
            'success': True,
            'message': '프로필이 업데이트되었습니다.',
            'user': user.to_dict()
        }), 200
    except Exception:
        db.session.rollback()
        return jsonify({'success': False, 'message': '업데이트 중 오류가 발생했습니다.'}), 500

@mypage_bp.route("/users/mypage", methods=["GET"])
@token_required
def get_user_profile(user):
    return jsonify({
        "success": True,
        "user_id": user.user_id,
        "user_nickname": user.user_nickname,
        "user_money": user.user_money,
        "image": user.user_image,
        "user_image":user.user_email,
                }), 200


@mypage_bp.route('/users/delete', methods=['DELETE'])
@token_required
def delete_user(user):
    try:
        if user.user_delete:
            return jsonify({'success': False, 'error': '이미 탈퇴한 계정입니다.'}), 400

        #익명화 + Soft Delete!
        user.user_nickname = f"s{user.user_id}"  # s+id
        user.user_email = f"s{user.user_id}@deleted.com"
        user.user_delete = True  # 삭제 플래그!

        db.session.commit()

        return jsonify({
            'success': True,
            'message': '회원탈퇴가 완료되었습니다.',
            'deleted_user_id': user.user_id
        })

    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500