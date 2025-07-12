import librosa
import numpy as np

def analyze_music(filepath):
    y, sr = librosa.load(filepath)
    tempo, _ = librosa.beat.beat_track(y=y, sr=sr)
    rms = librosa.feature.rms(y=y)[0]
    avg_volume = np.mean(rms)

    return {
        "tempo": float(tempo),
        "avg_volume": float(avg_volume)
    }
