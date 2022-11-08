from flask import Flask, request
import git
# import os
# from dotenv import load_dotenv

# load_dotenv()

app = Flask(__name__)
g = git.cmd.Git(".")
@app.route('/', methods=['POST'])
def listen():
    print("Received Webhook!")
    g.pull()
    return "", 200;
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=3000)