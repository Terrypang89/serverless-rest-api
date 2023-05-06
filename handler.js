'use strict';
const DynamoDB = require("aws-sdk/clients/dynamodb");
const documentClient = new DynamoDB.DocumentClient({region: "us-east-1"})

module.exports.createNote = async (event, context, cb) => {
  let data = JSON.parse(event.body);
  try {
    const param = {
      TableName: "notes",
      Item: {
        notesId: data.id,
        title: data.title,
        body: data.body
      },
      ConditionExpression: "attribute_not_exists(notesId)"
    }
    await documentClient.put(param).promise();
    cb(null, {
      statusCode: 201,
      body: JSON.stringify(data) 
    })
  } catch(err) {
    cb(null, {
      statusCode: 500,
      body: JSON.stringify(err.message)
    })
  }
  return {
    statusCode: 201,
    body: JSON.stringify("A new note created!")
  };
  // Use this code if you don't use the http event with the LAMBDA-PROXY integration
  // return { message: 'Go Serverless v1.0! Your function executed successfully!', event };
};

module.exports.updateNote = async (event) => {
  let noteId = event.pathParameters.id;
  return {
    statusCode: 200,
    body: JSON.stringify("The note with id: " + noteId + "has been updated!")
  };
};

module.exports.deleteNote = async (event) => {
  let noteId = event.pathParameters.id;
  return {
    statusCode: 200,
    body: JSON.stringify("The note with id: " + noteId + "has been deteletd!")
  };
};

module.exports.getAllNotes = async (event) => {
  return {
    statusCode: 200,
    body: JSON.stringify("All notes are returned!")
  };
};