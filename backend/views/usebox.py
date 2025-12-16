from flask import Blueprint, jsonify,request

from backend.models import db, UseBox

usebox_bp = Blueprint("usebox_api", __name__, url_prefix="/api")


@usebox_bp.route("/useboxes", methods=["GET"])
def get_useboxes():
    useboxes = UseBox.query.all()
    return jsonify([u.to_dict() for u in useboxes])


@usebox_bp.route("/useboxes", methods=["POST"])
def add_usebox():
    data = request.json or {}

    usebox = UseBox(
        user_id=data["user_id"],
        ai_id=data["ai_id"],
        # use_start는 default로 now, 필요하면 data에서 받기
        use_end=data.get("use_end"),
    )
    db.session.add(usebox)
    db.session.commit()
    return jsonify(usebox.to_dict()), 201
