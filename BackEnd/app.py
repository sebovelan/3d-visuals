from flask import Flask, request, jsonify
import librosa
import os
from werkzeug.utils import secure_filename
from audio_tools import analyze_music

app = Flask(__name__)
UPLOAD_FOLDER = 'static/uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@app.route("/upload", methods=["POST"])
def upload_audio():
    if "file" not in request.files:
        return "No file uploaded", 400

    file = request.files["file"]
    filename = secure_filename(file.filename)
    filepath = os.path.join(UPLOAD_FOLDER, filename)
    file.save(filepath)

    # Run audio analysis
    result = analyze_music(filepath)
    return jsonify(result)

if __name__ == "__main__":
    app.run(debug=True)
