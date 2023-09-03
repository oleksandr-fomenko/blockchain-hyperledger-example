import { assert } from "chai";
var randomstring = require("randomstring");
var request = require("supertest");

require('dotenv').config()

export class HyperledgerFireFlyClient {

    public async RegisterAndEnrollNewUser(): Promise<string> {
        let username = "aqa" + randomstring.generate(7);
        const regiserResponse = await request(process.env.BASE_URL)
            .post("/identities")
            .send(
                {
                    name: username,
                    type: "client",
                }
            ).set('Authorization', process.env.TOKEN);
        assert.equal(regiserResponse.statusCode, 200);

        const enrollResponse = await request(process.env.BASE_URL)
            .post(`/identities/${username}/enroll`)
            .send(
                {
                    secret: regiserResponse.body.secret
                }
            ).set('Authorization', process.env.TOKEN);
        assert.equal(enrollResponse.statusCode, 200);
        console.log(`Generated username: ${username}`);
        return username;
    }

    public async SendTransaction(signer: string, channel: string, chaincode: string, func: string, args: string[]): Promise<any> {
        var result = await request(process.env.BASE_URL)
            .post("/transactions")
            .send(
                {
                    headers: {
                        type: "SendTransaction",
                        signer: signer,
                        channel: channel,
                        chaincode: chaincode
                      },
                      func: func,
                      args: args,
                      "init": false
                }
            ).set('Authorization', process.env.TOKEN);
            console.log(result);
            return result;
    }

    public async Query(signer: string, channel: string, chaincode: string, func: string, args: string[]): Promise<any> {
        var result =  await request(process.env.BASE_URL)
            .post("/query")
            .send(
                {
                    headers: {
                        signer: signer,
                        channel: channel,
                        chaincode: chaincode
                      },
                      func: func,
                      args: args,
                      "strongread": true
                }
            ).set('Authorization', process.env.TOKEN);
            console.log(result);
            return result;
    }

}