from flask import Flask, request
import subprocess

app = Flask(__name__)
@app.route('/', methods=['POST'])
def listen():
    print("Received Webhook!")
    subprocess.run(["git", "pull"])
    return "", 200;
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=3000)