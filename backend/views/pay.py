from flask import Blueprint, jsonify,request

from backend.models import db, Pay

pay_bp = Blueprint("pay_api", __name__, url_prefix="/api")


@pay_bp.route("/pays", methods=["GET"])
def get_pays():
    pays = Pay.query.all()
    return jsonify([p.to_dict() for p in pays])


@pay_bp.route("/pays", methods=["POST"])
def add_pay():
    data = request.json or {}

    pay = Pay(
        user_id=data["user_id"],
        pay_is_pay=data.get("pay_is_pay", False),
        pay_money=data["pay_money"],
        pay_choice=data.get("pay_choice", 1),  # 기본 CARD
    )
    db.session.add(pay)
    db.session.commit()
    return jsonify(pay.to_dict()), 201
