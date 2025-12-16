from flask import Blueprint, jsonify,request

from backend.models import db, BasicAI

ai_bp = Blueprint("ai_api", __name__, url_prefix="/api")


@ai_bp.route("/basic-ais", methods=["GET"])
def get_basic_ais():
    ais = BasicAI.query.all()
    return jsonify([ai.to_dict() for ai in ais])


@ai_bp.route("/basic-ais", methods=["POST"])
def add_basic_ai():
    data = request.json or {}

    ai = BasicAI(
        ai_name=data["ai_name"],
        ai_type=data.get("ai_type", False),
        ai_content=data.get("ai_content"),
        ai_hashtag=data.get("ai_hashtag"),
        ai_price=data.get("ai_price", 0),
        ai_image=data.get("ai_image"),
        ai_prompt=data.get("ai_prompt"),
    )
    db.session.add(ai)
    db.session.commit()
    return jsonify(ai.to_dict()), 201
