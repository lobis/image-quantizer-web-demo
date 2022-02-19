import sys
import os
import json
import pytest

sys.path.insert(0, 'server')
sys.path.insert(0, '..')
sys.path.insert(0, '.')

from server import app


# import the Flask module


@pytest.fixture
def app():
    return app.test_client()


def test_api(client):
    return "hola"
