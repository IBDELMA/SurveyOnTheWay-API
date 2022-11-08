require("dotenv").config();
const { v4: uuidv4 } = require("uuid");
const express = require("express");
const CognitoExpress = require("cognito-express");
const cors = require("cors");
const bodyParser = require("body-parser");
const AWS = require("aws-sdk");

const app = express();
app.use(cors());
app.use(bodyParser.json());

const cognitoExpress = new CognitoExpress({
  region: process.env.REGION,
  cognitoUserPoolId: process.env.COGNITO_ID,
  tokenUse: "access",
  tokenExpiration: 3600000,
});

AWS.config.update({
  region: process.env.REGION,
  endpoint: process.env.DYNAMODB_ENDPOINT,
  accessKeyId: process.env.EXPRESS_ROLE_ACCESSKEY,
  secretAccessKey: process.env.EXPRESS_ROLE_SECRETKEY,
});
var docClient = new AWS.DynamoDB.DocumentClient();

const authRoutes = express.Router();
const publicRoutes = express.Router();
app.use("/public", publicRoutes);
app.use("/auth", authRoutes);

authRoutes.use(function (req, res, next) {
  let accessTokenFromClient = req.headers.authorization;
  if (!accessTokenFromClient)
    return res.status(401).send("Authorization header is missing");

  cognitoExpress.validate(accessTokenFromClient, function (err, response) {
    if (err) return res.status(401).send(err);
    res.locals.user = response;
    next();
  });
});

authRoutes.post("/create-poll", (req, res) => {
  docClient.put(
    {
      Item: {
        name: req.body.name,
        description: req.body.description,
        redirectURL: req.body.redirectURL,
        author: req.body.author,
        prompts: req.body.prompts,
        userId: res.locals.user.sub,
        pollId: uuidv4(),
      },
      TableName: "surveyontheway-polls",
    },
    function (err, data) {
      if (err) {
        console.log(err, err.stack);
        res.sendStatus(500);
      } else {
        res.sendStatus(201);
      }
    }
  );
});

authRoutes.get("/get-user-polls", (req, res) => {
  docClient.scan(
    {
      FilterExpression: "userId = :value",
      ExpressionAttributeValues: {
        ":value": res.locals.user.sub,
      },
      TableName: "surveyontheway-polls",
    },
    function (err, data) {
      if (err) {
        console.log(err, err.stack);
        res.sendStatus(500);
      } else {
        res.status(200).send(data.Items);
      }
    }
  );
});

publicRoutes.get("/get-responses", (req, res) => {
  docClient.scan(
    {
      FilterExpression: "pollId = :value",
      ExpressionAttributeValues: {
        ":value": req.query.pollId,
      },
      TableName: "surveyontheway-responses",
    },
    function (err, data) {
      if (err) {
        console.log(err, err.stack);
        res.sendStatus(500);
      } else {
        res.status(200).send(data.Items);
      }
    }
  );
});

publicRoutes.get("/get-poll", (req, res) => {
  docClient.get(
    {
      Key: {
        pollId: req.query.pollId,
      },
      TableName: "surveyontheway-polls",
    },
    function (err, data) {
      if (err) {
        console.log(err, err.stack);
        res.sendStatus(404);
      } else {
        res.status(200).send(data.Item);
      }
    }
  );
});

publicRoutes.post("/respond", (req, res) => {
  docClient.put(
    {
      Item: {
        pollId: req.body.pollId,
        responseId: uuidv4(),
        values: req.body.values,
      },
      TableName: "surveyontheway-responses",
    },
    function (err, data) {
      if (err) {
        console.log(err, err.stack);
        res.sendStatus(500);
      } else {
        res.sendStatus(201);
      }
    }
  );
});

app.listen(proess.env.PORT, () => {
  console.log(`Listening on port ${process.env.PORT}...`);
});
