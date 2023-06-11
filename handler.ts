'use strict';
//const DynamoDB = require("aws-sdk/clients/dynamodb");
import { DynamoDB } from 'aws-sdk';
import { APIGatewayEvent, Context, APIGatewayAuthorizerCallback } from 'aws-lambda';
const documentClient = new DynamoDB.DocumentClient({
  region: "us-east-1",
  maxRetries: 3,
  httpOptions: {
    timeout: 5000
  }
})
const NOTES_TABLE_NAME = process.env.NOTES_TABLE_NAME;

const send = (statusCode, data) => {
  return {
    statusCode,
    body: JSON.stringify(data)
  }
}

export const createNote = async (event: APIGatewayEvent, context: Context, cb: APIGatewayAuthorizerCallback) => {
  context.callbackWaitsForEmptyEventLoop = false;
  let data = JSON.parse(event.body as string);
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
    // const send: (statusCode: any, body: string) => {
    //   statusCode: any;
    //   body: string;
    // }
    cb(null, send(200, data));
  } catch(err) {
    cb(null, send(500, err.message));
  }
  // Use this code if you don't use the http event with the LAMBDA-PROXY integration
  // return { message: 'Go Serverless v1.0! Your function executed successfully!', event };
};

export const updateNote = async (event: APIGatewayEvent, context: Context, cb: APIGatewayAuthorizerCallback) => {
  context.callbackWaitsForEmptyEventLoop = false;
  let notesId = event.pathParameters?.id;
  let data = JSON.parse(event.body as string);
  try {
    console.log("notesId = " + JSON.stringify(notesId))
    const params = {
      TableName: NOTES_TABLE_NAME,
      Key: {notesId},
      updateExpression: "set #title = :title, #body = :body",
      ExpressionAttributeNames: {
        '#title': 'title',
        '#body': 'body'
      },
      ExpressionAttributeValues: {
        ':title': data.title,
        ':body': data.body
      },
      ConditionExpression: "attribute_exists(notesId)"
    }
    await documentClient.update(params).promise();
    cb(null, send(200, data));
  } catch(err) {
    cb(null, send(500, err.message));
  }
};

export const deleteNote = async (event: APIGatewayEvent, context: Context, cb: APIGatewayAuthorizerCallback) => {
  context.callbackWaitsForEmptyEventLoop = false;
  let notesId = event.pathParameters?.id;
  try {
    const params = {
      TableName: NOTES_TABLE_NAME as string,
      Key: { notesId },
      ConditionExpression: "attribute_exists(notesId)"
    }
    await documentClient.delete(params).promise();
    cb(null, send(201, notesId));
  } catch (err) {
    cb(null, send(500, err.message));
  }
};

export const getAllNotes = async (event: APIGatewayEvent, context: Context, cb: APIGatewayAuthorizerCallback) => {
  context.callbackWaitsForEmptyEventLoop = false;
  try {
    const params = {
      TableName: NOTES_TABLE_NAME as string
    }
    const notes = await documentClient.scan(params).promise();
    cb(null, send(201, notes));
  } catch (err) {
    cb(null, send(500, err.message));
  }
  return {
    statusCode: 200,
    body: JSON.stringify("All notes are returned!")
  };
};