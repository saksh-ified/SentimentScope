
from flask import Flask, request, jsonify, render_template
import joblib

app = Flask(__name__)

# Load your trained model and TF-IDF vectorizer
model = joblib.load("sentiment_model.pkl")
tfidf = joblib.load("tfidf_vectorizer.pkl")


@app.route("/")
def home():
    return render_template("index.html")


@app.route("/predict", methods=["POST"])
def predict():
    data = request.get_json(silent=True) or {}
    review = data.get("review", "")

    if not isinstance(review, str) or not review.strip():
        return jsonify({"error": "Please enter a movie review."}), 400

    # Convert the review into TF-IDF features
    review_tfidf = tfidf.transform([review])

    # Predict sentiment
    prediction = model.predict(review_tfidf)[0]

    # Calculate prediction probabilities
    probabilities = model.predict_proba(review_tfidf)[0]

    probability_scores = {
        str(label): round(float(prob) * 100, 2)
        for label, prob in zip(model.classes_, probabilities)
    }

    return jsonify({
        "sentiment": str(prediction),
        "probabilities": probability_scores
    })


if __name__ == "__main__":
    app.run(debug=False, port=5000)
