from flask import Blueprint, jsonify,request

from backend.models import db, CustomAI

custom_ai_bp = Blueprint("custom_ai_api", __name__, url_prefix="/api")


@custom_ai_bp.route("/custom-ais", methods=["GET"])
def get_custom_ais():
    customs = CustomAI.query.all()
    return jsonify([c.to_dict() for c in customs])


@custom_ai_bp.route("/custom-ais", methods=["POST"])
def add_custom_ai():
    data = request.json or {}

    custom = CustomAI(
        user_id=data["user_id"],
        ai_id=data["ai_id"],
        custom_sell=data.get("custom_sell", False),
        custom_sell_count=data.get("custom_sell_count", 0),
        custom_delete=data.get("custom_delete", False),
    )
    db.session.add(custom)
    db.session.commit()
    return jsonify(custom.to_dict()), 201
