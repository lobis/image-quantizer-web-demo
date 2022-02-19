import image_quantizer

import base64
import io
import os
import re

from PIL import Image
from flask import Flask
from flask import request, send_from_directory
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

static = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), "../dist"))


@app.route("/", defaults=dict(filename=None))
@app.route("/<path:filename>", methods=["GET"])
def index(filename):
    filename = filename or "index.html"
    return send_from_directory(static, filename)


@app.route("/quantize", methods=["POST"])
def quantize():
    try:
        data = request.json
        # data = {"name": "", "hash": "md5hash", "image": "data:image/png;base64,..."}
        assert "name" in data and "hash" in data and "image" in data

        image_name = data["name"]
        image_hash = data["hash"]
        image_data = data["image"]
        image_data = re.sub(r"^data:image/.+;base64,", "", image_data)

        print(f"Image data: {image_data[:50]}...")

        buffered = io.BytesIO(base64.b64decode(image_data, validate=True))
        image = Image.open(buffered).convert("RGB")
        image = image_quantizer.quantize_image(image, palette=image_quantizer.PALETTES["WAVESHARE-EPD-7COLOR"])

        # send back
        buffered = io.BytesIO()
        image.save(buffered, format="PNG")
        image_data_out = base64.b64encode(buffered.getvalue()).decode("utf-8")

        print(f"Image data out: {image_data_out[:50]}...")

        return {"name": image_name, "hash": image_hash, "quantized": f"data:image/png;base64,{image_data_out}"}

    except Exception as e:
        print(f"/quantize failed with '{e}'")
        return {"msg": "/quantize failed", "error": str(e)}


if __name__ == "__main__":
    app.run()
