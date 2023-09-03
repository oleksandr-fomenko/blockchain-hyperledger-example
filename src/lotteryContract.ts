import {Context, Contract, Info, Returns, Transaction} from 'fabric-contract-api';
import stringify from 'json-stringify-deterministic';
import sortKeysRecursive from 'sort-keys-recursive';
import {Participant} from './participant';
import {Winner} from './winner';
import {Lottery} from './lottery';
import {MetaResponse} from './metaResponse';


@Info({title: 'LotteryContract', description: 'Smart contract for lottery'})
export class LotteryContract extends Contract {

    @Transaction()
    public async InitLedger(ctx: Context): Promise<void> {
        const lottery: Lottery = {
            Id: await this.GetLotteryKey(ctx),
            Participants: [
                {
                    Id: 'participant_1',
                    Name: 'Ivan',
                    Lot: 100,
                },
                {
                    Id: 'participant_2',
                    Name: 'Alex',
                    Lot: 120,
                },
                {
                    Id: 'participant_3',
                    Name: 'John',
                    Lot: 100,
                }
            ],
            Winners: [],
          }

          await this.SaveLotteryContext(ctx, lottery);
    }

    @Transaction()
    public async Participate(ctx: Context, id:string, name:string, lot:number): Promise<string> {
        const isParticipantExist = await this.IsParticipantExist(ctx, id);
        if (isParticipantExist) {
            throw new Error(`The participant with ${id} already participating in the lottery!`);
        }

        const minTicketPrice = 100;
        if (lot < minTicketPrice) {
            throw new Error(`The minimum ticket price is ${minTicketPrice} points!`);
        }

        const participant: Participant = {
            Id: id,
            Name: name,
            Lot: lot
        };

        const lottery = await this.GetOrCreateDefaultLottery(ctx);
        lottery.Participants.push(participant);

        await this.SaveLotteryContext(ctx, lottery);

        const returnData: MetaResponse = {
            Message: `The participant with ${id} is successfully registered in the lottery!`
        };
        return JSON.stringify(returnData);
    }

    @Transaction()
    public async PickTheWinner(ctx: Context): Promise<string> {
        const lottery = await this.GetOrCreateDefaultLottery(ctx);
        const participants = lottery.Participants;
        if(participants.length < 3){
            throw new Error(`A minimum of 3 users is required to participate in the lottery!`);
        }

        const randomIndex = await this.GetRandomInt(participants.length);
        const participantWinner = participants[randomIndex];
        
        let prize = await this.GetPrize(participants);

        const winner: Winner = {
            Id: participantWinner.Id,
            Name: participantWinner.Name,
            Prize: prize,
            WinDate: new Date
        };
        
        lottery.Winners.push(winner);
        lottery.Participants = [];
        
        await this.SaveLotteryContext(ctx, lottery);

        const returnData: MetaResponse = {
            Message: `Lottery is completed! Congrats to participant ${winner.Id} for winning the prize ${prize}!`
        };
        return JSON.stringify(returnData);
    }

    @Transaction(false)
    public async IsParticipantExist(ctx: Context, id: string): Promise<boolean> {
        const participants = await this.GetParticipants(ctx);
        return participants.find((participant) => id === participant.Id) != undefined;
    }

    @Transaction(false)
    public async GetParticipants(ctx: Context): Promise<Participant[]> {
        const lottery = await this.GetOrCreateDefaultLottery(ctx);
        return lottery.Participants;
    }

    @Transaction(false)
    public async GetWinners(ctx: Context): Promise<Winner[]> {
        const lottery = await this.GetOrCreateDefaultLottery(ctx);
        return lottery.Winners;
    }

    @Transaction(false)
    public async GetOrCreateDefaultLottery(ctx: Context): Promise<Lottery> {
        const key = await this.GetLotteryKey(ctx);
        const lotteryBuffer = await ctx.stub.getState(key);
        if (!lotteryBuffer || lotteryBuffer.length === 0) {
            return {
                Id: key,
                Participants: [],
                Winners: [],
              };
        }
        return await this.UnWrap(lotteryBuffer);
    }

    private async GetLotteryKey(ctx: Context): Promise<string>{
        return ctx.clientIdentity.getID();
    }

    private async Wrap(value: Object): Promise<Buffer>{
        return Buffer.from(stringify(sortKeysRecursive(value)));
    }

    private async UnWrap(buffer: Uint8Array): Promise<any>{
        return JSON.parse(buffer.toString());
    }

    private async SaveLotteryContext(ctx: Context, lottery: Lottery): Promise<void>{
        const key = await this.GetLotteryKey(ctx);
        await ctx.stub.putState(key, await this.Wrap(lottery));
    }

    private async GetRandomInt(max: number) {
        return Math.floor(Math.random() * max);
    }

    private async GetPrize(participants: Participant[]): Promise<number>{
        let prize = 0;
        for (const participant of participants) {
            prize += participant.Lot;
        }
        return prize;
    }
}
