

import sys
import os
import json
import pytest

sys.path.insert(0, 'server')
sys.path.insert(0, '..')
sys.path.insert(0, '.')

from server import app

# import the Flask module

# indicate tests are running
app.testing = True

# generate a test client
app = app.test_client()

print("HOLA")
print("APP!!", app)


@pytest.fixture
def app():
    return app.test_client()

def test_api(client):
    return "hola"