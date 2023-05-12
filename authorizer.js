const { CognitoJwtVerifier } = require("aws-jwt-verify");
const COGNITO_USERPOOL_ID = process.env.COGNITO_USERPOOL_ID;
const COGNITO_WEB_CLIENT_ID = process.env.COGNITO_WEB_CLIENT_ID;

const jwtVerifier = CognitoJwtVerifier.create({
    // userPoolId: "us-east-1_BstaKBOon",
    // tokenUse: "id",
    // clientId: "ob2t2ao2fnv1567p9u216q7sk"
    userPoolId: COGNITO_USERPOOL_ID,
    tokenUse: "id",
    clientId: COGNITO_WEB_CLIENT_ID
})

const generatePolicy = (principalId, effect, resource) => {
    var authReponse = {};

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

exports.handler = async (event, context, callback) => {
    // lambda authorizer code
    var token = event.authorizationToken;
    console.log(token);
    try {
        const payload = await jwtVerifier.verify(token);
        console.log(JSON.stringify(payload));
        callback(null, generatePolicy("user", "Allow", event.methodArn));
    } catch(err) {
        callback("Error: invalid token")
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
// }