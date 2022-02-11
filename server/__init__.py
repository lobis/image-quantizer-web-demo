from flask import Flask
from flask import request

import image_quantizer


app = Flask(__name__)


@app.route("/quantize", methods=["POST", "GET"])
def quantize():
    #data = request.form
    # print(data)
    return {"hola": "adios"}
