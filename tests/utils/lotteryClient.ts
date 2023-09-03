import { HyperledgerFireFlyClient } from './hyperledgerFireFlyClient';
import { Participant } from './../../src/participant';

const hyperledgerFireFlyClient: HyperledgerFireFlyClient = new HyperledgerFireFlyClient();
require('dotenv').config()

export class LotteryClient {

    public async ParticipateTransaction(signer: string, participant: Participant): Promise<any> {
        const args = [participant.Id, participant.Name, participant.Lot.toString()];
        console.log(`Siger ${signer} sends participate transaction for participant with ID: ${participant.Id}`);
        return hyperledgerFireFlyClient.SendTransaction(signer, process.env.CHANNEL as string, process.env.CHAIN_CODE as string, "Participate", args);
    }

    public async PickTheWinnerTransaction(signer: string): Promise<any> {
        console.log(`Siger ${signer} sends PickTheWinner transaction`);
        return hyperledgerFireFlyClient.SendTransaction(signer, process.env.CHANNEL as string, process.env.CHAIN_CODE as string, "PickTheWinner", []);
    }

    public async GetOrCreateDefaultLotteryQuery(signer: string): Promise<any> {
        console.log(`Siger ${signer} sends GetOrCreateDefaultLottery query`);
        return hyperledgerFireFlyClient.Query(signer, process.env.CHANNEL as string, process.env.CHAIN_CODE as string, "GetOrCreateDefaultLottery", []);
    }

    public async GetParticipantsQuery(signer: string): Promise<any> {
        console.log(`Siger ${signer} sends GetParticipants query`);
        return hyperledgerFireFlyClient.Query(signer, process.env.CHANNEL as string, process.env.CHAIN_CODE as string, "GetParticipants", []);
    }

    public async GetWinnersQuery(signer: string): Promise<any> {
        console.log(`Siger ${signer} sends GetWinners query`);
        return hyperledgerFireFlyClient.Query(signer, process.env.CHANNEL as string, process.env.CHAIN_CODE as string, "GetWinners", []);
    }
}