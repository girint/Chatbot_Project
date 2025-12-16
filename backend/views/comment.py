from flask import Blueprint, jsonify, request

from backend.models import db, Comment

comment_bp = Blueprint("comment_api", __name__, url_prefix="/api")


@comment_bp.route("/comments", methods=["GET"])
def get_comments():
    comments = Comment.query.all()
    return jsonify([c.to_dict() for c in comments])


@comment_bp.route("/comments", methods=["POST"])
def add_comment():
    data = request.json or {}

    comment = Comment(
        user_id=data["user_id"],
        notice_id=data["notice_id"],
        comment_write=data["comment_write"],
    )
    db.session.add(comment)
    db.session.commit()
    return jsonify(comment.to_dict()), 201
