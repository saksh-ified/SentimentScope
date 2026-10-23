
const reviewInput = document.getElementById("review");
const charCount = document.getElementById("charCount");
const analyzeBtn = document.getElementById("analyzeBtn");
const result = document.getElementById("result");

reviewInput.addEventListener("input", () => {
    charCount.textContent =
        `${reviewInput.value.length} / 10000 characters`;
});

function setReview(text) {
    reviewInput.value = text;
    reviewInput.dispatchEvent(new Event("input"));
    reviewInput.focus();
}

async function analyzeReview() {
    const review = reviewInput.value.trim();

    if (!review) {
        showError("Please enter a movie review first.");
        return;
    }

    analyzeBtn.disabled = true;
    analyzeBtn.textContent = "Analyzing...";
    result.className = "result hidden";

    try {
        const response = await fetch("/predict", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ review })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Unable to analyze review.");
        }

        const sentiment = data.sentiment.toLowerCase();

        result.className = "result";

        if (sentiment === "positive" || sentiment === "negative") {
            result.classList.add(sentiment);
        }

        document.getElementById("sentiment").textContent =
            sentiment.toUpperCase();

        const scores = Object.entries(data.probabilities)
            .map(([label, value]) => `${label}: ${value}%`)
            .join(" | ");

        document.getElementById("probabilities").textContent =
            `Model probability estimates — ${scores}`;

    } catch (error) {
        showError(error.message);
    } finally {
        analyzeBtn.disabled = false;
        analyzeBtn.textContent = "Analyze sentiment →";
    }
}

function showError(message) {
    result.className = "result error";

    document.getElementById("sentiment").textContent = "Unable to analyze";

    document.getElementById("probabilities").textContent = message;
}
