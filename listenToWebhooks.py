from flask import Flask, request
import git
require("dotenv").config();
app = Flask(__name__)
g = git.cmd.Git(process.env.GIT_DIR)
@app.route('/', methods=['POST'])
def listen():
    print("Received Webhook!")
    g.pull()
    return "", 200;
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=3000)