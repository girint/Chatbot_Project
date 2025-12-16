from flask import Blueprint, jsonify, request
from backend.models import db, Social

social_bp = Blueprint("social_api", __name__, url_prefix="/api")


@social_bp.route("/socials", methods=["GET"])
def get_socials():
    socials = Social.query.all()
    return jsonify([s.to_dict() for s in socials])


@social_bp.route("/socials", methods=["POST"])
def add_social():
    data = request.json or {}

    social = Social(
        user_id=data["user_id"],
        social_provider=data["social_provider"],
        social_provider_id=data["social_provider_id"],
        social_email=data.get("social_email"),
        social_image=data.get("social_image"),
    )
    db.session.add(social)
    db.session.commit()
    return jsonify(social.to_dict()), 201
