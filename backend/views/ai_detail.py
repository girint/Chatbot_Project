# ai_detail.py (token_required + 원래 리턴값 유지 - 완전체)

from flask import Blueprint, jsonify, request
from functools import wraps
from urllib.parse import unquote
from backend.models import db, BasicAI, Review, UseBox, User
from sqlalchemy import desc
from datetime import datetime

ai_detail_bp = Blueprint('ai_detail', __name__)


def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get('Authorization') or request.headers.get('authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'error': '토큰 필요'}), 401

        token = auth_header.split('Bearer ')[1].strip()
        token = unquote(token)

        user = User.query.filter_by(user_nickname=token, user_delete=False).first()
        if not user:
            return jsonify({'error': '유저 없음'}), 401

        return f(user=user, *args, **kwargs)

    return decorated


@ai_detail_bp.route('/ai/<int:ai_id>', methods=['GET'])
@token_required
def get_ai_detail(ai_id, user):
    ai = BasicAI.query.get_or_404(ai_id)

    current_user_id = user.user_id

    # 리뷰 목록
    reviews = db.session.query(Review).filter(
        Review.ai_id == ai_id,
        Review.review_delete == False
    ).order_by(desc(Review.review_new)).limit(10).all()

    # 사용자별 리뷰 존재 여부
    has_review = db.session.query(Review).filter(
        Review.user_id == current_user_id,
        Review.ai_id == ai_id,
        Review.review_delete == False
    ).first() is not None

    # AI 사용 여부
    is_user_used_ai = db.session.query(UseBox).filter(
        UseBox.user_id == current_user_id,
        UseBox.ai_id == ai_id
    ).first() is not None

    # UseBox 개수 (무료 사용 체크)
    used_count = db.session.query(UseBox).filter(
        UseBox.user_id == current_user_id
    ).count()
    has_free_usage = used_count < 3

    response = {
        'ai': ai.to_dict(),
        'reviews': [r.to_dict() for r in reviews],
        'can_write_review': bool(is_user_used_ai and not has_review),
        'is_logged_in': True,
        'has_review': has_review,
        'has_used_ai': is_user_used_ai,
        'usage_info': {
            'user_id': current_user_id,
            'used_count': used_count,
            'max_free': 3,
            'has_free_usage': has_free_usage
        },
        'nickname': user.user_nickname,
        'pay': user.user_money
    }

    return jsonify(response)


@ai_detail_bp.route('/ai/<int:ai_id>/review', methods=['POST'])
@token_required
def create_review(ai_id, user):
    data = request.get_json()
    if not data or not data.get('review_write'):
        return jsonify({'error': '리뷰 내용이 필요합니다.'}), 400

    user_id = user.user_id

    # AI 사용 여부 확인
    use_record = db.session.query(UseBox).filter(
        UseBox.user_id == user_id,
        UseBox.ai_id == ai_id
    ).first()
    if not use_record:
        return jsonify({'error': '이 AI를 사용한 기록이 없습니다.'}), 403

    # 기존 리뷰 확인
    existing_review = db.session.query(Review).filter(
        Review.user_id == user_id,
        Review.ai_id == ai_id
    ).first()

    if existing_review:
        if existing_review.review_delete:
            # 삭제된 리뷰 복구
            existing_review.review_write = data['review_write']
            existing_review.review_delete = False
            existing_review.review_new = datetime.now()
            db.session.commit()
            return jsonify(existing_review.to_dict()), 200
        else:
            return jsonify({'error': '이미 리뷰를 작성하셨습니다.'}), 400

    # 신규 리뷰 생성
    review = Review(
        user_id=user_id,
        ai_id=ai_id,
        review_write=data['review_write'],
        review_good=0
    )
    db.session.add(review)
    db.session.commit()

    return jsonify(review.to_dict()), 201


@ai_detail_bp.route('/ai/<int:ai_id>/review/<int:review_id>', methods=['DELETE'])
@token_required
def delete_review(ai_id, review_id, user):
    review = Review.query.get_or_404(review_id)
    if review.user_id != user.user_id:
        return jsonify({'error': '권한 없음'}), 403

    review.review_delete = True
    db.session.commit()

    return jsonify({'success': True})
