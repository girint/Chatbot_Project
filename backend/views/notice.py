# backend/views/notice.py
from flask import Blueprint, request, jsonify, current_app, session, g
from werkzeug.utils import secure_filename
import os
import time
import datetime
from urllib.parse import unquote
from backend.models import User, Notice, Comment, db

notice_bp = Blueprint('notice', __name__, url_prefix="/api")


def get_current_user_info():
    """로그인 사용자 정보 반환"""
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return None

    try:
        decoded_nickname = unquote(auth_header.split(' ')[1])
        user = User.query.filter_by(user_nickname=decoded_nickname, user_delete=False).first()
        if user:
            return {'user': user, 'user_id': user.user_id}
    except:
        pass
    return None


def handle_auth():
    """인증 처리 + 에러 응답 통합"""
    user_info = get_current_user_info()
    if not user_info:
        return jsonify({"success": False, "error": "로그인 필요"}), 401
    return user_info


# 게시판 작성 API
@notice_bp.route("/notices", methods=["POST"])
def add_notice():
    user_info = handle_auth()
    if isinstance(user_info, dict) is False:
        return user_info

    try:
        title = request.form.get('title', '').strip()
        content = request.form.get('content', '').strip()

        if not title or not content:
            return jsonify({"success": False, "error": "제목/내용 필수"}), 400

        # 이미지 업로드
        image_paths = []
        for i, image in enumerate(request.files.getlist('images')):
            if image and image.filename:
                timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
                filename = secure_filename(f"{title[:30]}_{timestamp}_{i}_{image.filename}")
                filepath = os.path.join(current_app.root_path, "static", "notice_images", filename)
                os.makedirs(os.path.dirname(filepath), exist_ok=True)
                image.save(filepath)
                image_paths.append(f"/static/notice_images/{filename}")

        # DB 저장
        notice = Notice(
            user_id=user_info['user_id'],
            notice_title=title,
            notice_write=content,
            notice_image=",".join(image_paths) or None
        )
        db.session.add(notice)
        db.session.flush()
        db.session.commit()

        return jsonify({"success": True, 'notice_id': notice.notice_id, "notice": notice.to_dict()}), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({"success": False, "error": str(e)}), 500


#게시판 상세페이지 API 코멘트까지 같이 가져오기
@notice_bp.route("/notice/<int:notice_id>", methods=["GET"])
def get_notice_detail(notice_id):
    notice = db.session.get(Notice, notice_id)
    if not notice or notice.notice_delete:
        return jsonify({'success': False, 'message': '공지 없음'}), 404

    # 조회수
    if not session.get(f"notice_view_{notice_id}") or (time.time() - session.get(f"notice_view_{notice_id}")) > 30:
        notice.notice_view_count += 1
        db.session.commit()
        session[f"notice_view_{notice_id}"] = time.time()

    # 데이터 준비
    notice_data = notice.to_dict()
    notice_data["author_name"] = notice.user.user_nickname if notice.user else "Unknown"

    # 댓글 조회
    comments = Comment.query.filter_by(notice_id=notice_id, comment_delete=False) \
        .order_by(Comment.comment_new.desc()).all()

    comments_data = [{
        **c.to_dict(),
        "author_name": c.user.user_nickname if c.user else "Unknown",
        "comment_new": c.comment_new.strftime("%Y-%m-%d %H:%M:%S")
    } for c in comments]

    return jsonify({"success": True, "notice": notice_data, "comments": comments_data})

#좋아요 보내기 API
@notice_bp.route("/notice/<int:notice_id>/like", methods=["POST"])
def like_notice(notice_id):
    user_info = handle_auth()
    if isinstance(user_info, dict) is False:
        return user_info

    notice = db.session.get(Notice, notice_id)
    if not notice or notice.notice_delete:
        return jsonify({'success': False, 'message': '공지 없음'}), 404

    notice.notice_like += 1
    db.session.commit()
    return jsonify({'success': True, 'notice_like': notice.notice_like})

# 코멘트 보내기 API
@notice_bp.route("/notice/<int:notice_id>/comments", methods=["POST"])
def create_comment(notice_id):
    user_info = handle_auth()
    if isinstance(user_info, dict) is False:
        return user_info

    notice = db.session.get(Notice, notice_id)
    if not notice or notice.notice_delete:
        return jsonify({'success': False, 'message': '공지 없음'}), 404

    text = request.get_json().get("comment_write", "").strip()
    if not text:
        return jsonify({'success': False, 'message': '댓글 내용 필수'}), 400

    comment = Comment(user_id=user_info['user_id'], notice_id=notice_id, comment_write=text)
    db.session.add(comment)
    db.session.commit()

    return jsonify({
        'success': True,
        'comment': comment.to_dict()
    }), 201

# 게시물 삭제 API
@notice_bp.route("/notice/<int:notice_id>", methods=["DELETE"])
def delete_notice(notice_id):
    notice = db.session.get(Notice, notice_id)
    if not notice:
        return jsonify({'success': False, 'message': '공지 없음'}), 404

    notice.notice_delete = True
    db.session.commit()
    return jsonify({'success': True, 'message': '삭제 완료'})

# 댓글 삭제 API
@notice_bp.route("/notice/<int:notice_id>/comments/<int:comment_id>", methods=["DELETE"])
def delete_comment(notice_id, comment_id):
    comment = Comment.query.get(comment_id)
    comment.comment_delete = True
    db.session.commit()
    return jsonify(success=True)