"use strict";

let init = require("./steps/init");
let {an_authenticated_user} = require("./steps/given");
let {we_invoke_createNote} = require("./steps/when");
let idToken;

describe("Given an authenticated user", () => {
    beforeAll(async () => {
        init();
        let user = await an_authenticated_user();
        idToken = user.AuthenticationResult.IdToken;
        console.log(idToken);
    });


    describe("When we invole POST /notes endpoint", () => {
        it("should create a new rote", async () => {
            const body = {
                id: "1000",
                title: "My test note",
                body: "Hello this is the updated note body"
            };
            let result = await we_invoke_createNote({ idToken, body});
            // expect(true).toBe(true);
            expect(result.statusCode).toEqual(201);
            expect(result.body).not.toBeNull();
        });
    });
});