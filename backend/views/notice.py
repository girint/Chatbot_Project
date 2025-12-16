from flask import Blueprint, jsonify,request

from backend.models import db, Notice

notice_bp = Blueprint("notice_api", __name__, url_prefix="/api")


@notice_bp.route("/notices", methods=["GET"])
def get_notices():
    notices = Notice.query.all()
    return jsonify([n.to_dict() for n in notices])


@notice_bp.route("/notices", methods=["POST"])
def add_notice():
    data = request.json or {}

    notice = Notice(
        user_id=data["user_id"],
        notice_title=data["notice_title"],
        notice_write=data["notice_write"],
        notice_image=data.get("notice_image"),
    )
    db.session.add(notice)
    db.session.commit()
    return jsonify(notice.to_dict()), 201
