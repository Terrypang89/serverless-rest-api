// token based lambda authorizer
import { CognitoJwtVerifier } from "aws-jwt-verify";
import { APIGatewayTokenAuthorizerEvent, Context, AuthResponse, PolicyDocument } from 'aws-lambda';
const COGNITO_USERPOOL_ID = process.env.COGNITO_USERPOOL_ID;
const COGNITO_WEB_CLIENT_ID = process.env.COGNITO_WEB_CLIENT_ID;

// export interface Request {
// const jwtVerifier = CognitoJwtVerifier.create({
const jwtVerifier = CognitoJwtVerifier.create({
    // userPoolId: "us-east-1_BstaKBOon",
    // tokenUse: "id",
    // clientId: "ob2t2ao2fnv1567p9u216q7sk"
    userPoolId: COGNITO_USERPOOL_ID,
    tokenUse: "id",
    clientId: COGNITO_WEB_CLIENT_ID
})

// for lambda authorizer to generate IAM policy
const generatePolicy = (principalId, effect, resource): AuthResponse => {
    let authReponse = {} as AuthResponse;
    var tmp = resource.split(':');
    var apiGatewayArnTmp = tmp[5].split('/');
    resource = tmp[0] + ":" + tmp[1] + ":" + tmp[2] + ":" + tmp[3] + ":" + tmp[4] + ":" + apiGatewayArnTmp[0] + "/*/*" ;
    // var authReponse = {};

    authReponse.principalId = principalId;

    if(effect && resource){
        let policyDocument = {
            Version: "2012-10-17",
            Statement: [
                {
                    Effect: effect,
                    Resource: resource,
                    Action: "execute-api:Invoke",
                },
            ],
        };
        authReponse.policyDocument = policyDocument;
    }
    authReponse.context = {
        foo: "bar"
    };
    console.log(JSON.stringify(authReponse));
    return authReponse;
}

export const handler = async (event: APIGatewayTokenAuthorizerEvent, context: Context, cb: APIGatewayAuthorizerCallback) => {
    // token get from lambda authorizer
    var token = event.authorizationToken;
    console.log(token);

    try {
        // verify token generated from cognito 
        const payload = await jwtVerifier.verify(token);
        console.log(JSON.stringify(payload));
        // lambda authorizer create IAM policy for event method 
        cb(null, generatePolicy("user", "Allow", event.methodArn));
    } catch(err) {
        cb("Error: invalid token")
    }
//     switch(token) {
//         case "allow":
//             callback(null, generatePolicy("user", "Allow", event.methodArn));
//             break;
//         case "deny":
//             callback(null, generatePolicy("user", "Deny", event.methodArn));
//             break;
//         default:
//             callback("Error: Invalid token");
//     }
};