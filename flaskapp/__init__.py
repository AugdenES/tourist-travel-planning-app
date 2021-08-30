### THIS FILE: INITIALIZE FLASK FACTORY MAIN FILE '__init__.py'
## 


import os
from flask import Flask

def create_app(config_test=None):
    app = Flask(__name__)
    
    return app