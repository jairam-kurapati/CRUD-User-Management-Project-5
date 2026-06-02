from flask import Flask, jsonify, request, render_template, redirect, url_for, flash, abort
from model import predict_age_category

app = Flask(__name__)
app.secret_key = "a-very-secret-key-for-flask-flash"

users = []
next_id = 1


def find_user(user_id):
    return next((user for user in users if user["id"] == user_id), None)


def filter_users(search="", category="", sort="desc"):
    filtered = users
    if search:
        term = search.lower()
        filtered = [
            user
            for user in filtered
            if term in user["name"].lower()
            or term in user["prediction"].lower()
            or term in str(user["age"])
        ]

    if category:
        filtered = [user for user in filtered if user["prediction"] == category]

    reverse = sort != "asc"
    return sorted(filtered, key=lambda item: item["age"], reverse=reverse)


@app.route("/", methods=["GET"])
def index():
    search = request.args.get("search", "")
    category = request.args.get("category", "")
    sort = request.args.get("sort", "desc")
    mode = request.args.get("mode", "")
    user_id = request.args.get("id", type=int)
    selected_user = find_user(user_id) if user_id else None
    filtered_users = filter_users(search, category, sort)
    latest_prediction = users[-1]["prediction"] if users else "Pending"

    return render_template(
        "index.html",
        users=filtered_users,
        total=len(users),
        latest_prediction=latest_prediction,
        search=search,
        category=category,
        sort=sort,
        mode=mode,
        selected_user=selected_user,
    )


@app.route("/add", methods=["POST"])
def add_user():
    global next_id
    name = request.form.get("name", "").strip()
    age_value = request.form.get("age", "").strip()

    if not name or not age_value:
        flash("Name and age are required.", "warning")
        return redirect(url_for("index"))

    try:
        age = int(age_value)
    except ValueError:
        flash("Age must be a valid number.", "danger")
        return redirect(url_for("index"))

    prediction = predict_age_category(age)
    user = {"id": next_id, "name": name, "age": age, "prediction": prediction}
    users.append(user)
    next_id += 1
    flash(f"Added {name} with prediction '{prediction}'.", "success")
    return redirect(url_for("index"))


@app.route("/update/<int:user_id>", methods=["POST"])
def update_user(user_id):
    user = find_user(user_id)
    if user is None:
        abort(404)

    name = request.form.get("name", "").strip()
    age_value = request.form.get("age", "").strip()

    if not name or not age_value:
        flash("Name and age are required.", "warning")
        return redirect(url_for("index", mode="edit", id=user_id))

    try:
        age = int(age_value)
    except ValueError:
        flash("Age must be a valid number.", "danger")
        return redirect(url_for("index", mode="edit", id=user_id))

    user["name"] = name
    user["age"] = age
    user["prediction"] = predict_age_category(age)
    flash(f"Updated {name} successfully.", "success")
    return redirect(url_for("index"))


@app.route("/delete/<int:user_id>", methods=["POST"])
def delete_user(user_id):
    user = find_user(user_id)
    if user is None:
        abort(404)

    users.remove(user)
    flash(f"Deleted {user['name']} successfully.", "success")
    return redirect(url_for("index"))


@app.route("/api/users", methods=["GET"])
def get_users_api():
    return jsonify(users), 200


@app.route("/api/users", methods=["POST"])
def create_user_api():
    global next_id
    payload = request.get_json(force=True)
    name = payload.get("name", "").strip()
    age = payload.get("age")

    if not name or age is None:
        return jsonify({"error": "Name and age are required."}), 400

    try:
        age = int(age)
    except ValueError:
        return jsonify({"error": "Age must be a number."}), 400

    prediction = predict_age_category(age)
    user = {"id": next_id, "name": name, "age": age, "prediction": prediction}
    users.append(user)
    next_id += 1
    return jsonify(user), 201


@app.route("/api/users/<int:user_id>", methods=["PUT"])
def update_user_api(user_id):
    user = find_user(user_id)
    if user is None:
        return jsonify({"error": "User not found."}), 404

    payload = request.get_json(force=True)
    name = payload.get("name", "").strip()
    age = payload.get("age")

    if not name or age is None:
        return jsonify({"error": "Name and age are required."}), 400

    try:
        age = int(age)
    except ValueError:
        return jsonify({"error": "Age must be a number."}), 400

    user["name"] = name
    user["age"] = age
    user["prediction"] = predict_age_category(age)
    return jsonify(user), 200


@app.route("/api/users/<int:user_id>", methods=["DELETE"])
def delete_user_api(user_id):
    user = find_user(user_id)
    if user is None:
        return jsonify({"error": "User not found."}), 404

    users.remove(user)
    return jsonify({"message": "User deleted successfully."}), 200


@app.route("/api/predict/<int:age>", methods=["GET"])
def get_prediction(age):
    prediction = predict_age_category(age)
    return jsonify({"age": age, "prediction": prediction}), 200


@app.errorhandler(404)
def not_found(error):
    return jsonify({"error": "Not found."}), 404


@app.errorhandler(500)
def server_error(error):
    return jsonify({"error": "Server error."}), 500


if __name__ == "__main__":
    app.run(debug=True)
