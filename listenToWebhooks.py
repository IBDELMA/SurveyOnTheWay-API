from flask import Flask, request
app = Flask(__name__)
@app.route('/', methods=['POST'])
def listen():
    console.log("Received Webhook!")
    return "", 200;
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=3000)