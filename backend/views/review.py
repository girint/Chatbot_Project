from flask import Blueprint, jsonify,request

from backend.models import db, Review

review_bp = Blueprint("review_api", __name__, url_prefix="/api")


@review_bp.route("/reviews", methods=["GET"])
def get_reviews():
    reviews = Review.query.all()
    return jsonify([r.to_dict() for r in reviews])


@review_bp.route("/reviews", methods=["POST"])
def add_review():
    data = request.json or {}

    review = Review(
        user_id=data["user_id"],
        ai_id=data["ai_id"],
        review_write=data["review_write"],
        review_good=data.get("review_good", 0),
    )
    db.session.add(review)
    db.session.commit()
    return jsonify(review.to_dict()), 201
