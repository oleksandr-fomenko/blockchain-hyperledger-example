import { assert } from "chai";
import { Participant } from './../src/participant';
import { HyperledgerFireFlyClient } from './utils/hyperledgerFireFlyClient';
import { LotteryClient } from './utils/lotteryClient';

var chai = require("chai");
chai.should();
chai.use(require('chai-things'));
require('dotenv').config()

let fireFlyclient: HyperledgerFireFlyClient = new HyperledgerFireFlyClient();
let lotteryClient: LotteryClient = new LotteryClient();
let signer: string;

describe("Lottery automation API tests", (): void => {
  beforeEach("Create and enroll new identity", async (): Promise<void> => {
    signer = await fireFlyclient.RegisterAndEnrollNewUser();
  });

  it("Lottery positive test", async (): Promise<void> => {
    const participantOne: Participant = {
      Id: 'participant_1',
      Name: 'Ivan',
      Lot: 100,
    };
    const participantTwo: Participant = {
      Id: 'participant_2',
      Name: 'Ivan',
      Lot: 150,
    };
    const participantThree: Participant = {
      Id: 'participant_3',
      Name: 'Ivan',
      Lot: 250,
    };
    var expectedPrize = participantOne.Lot + participantTwo.Lot + participantThree.Lot;
    var participantIds = ['participant_1', 'participant_2', 'participant_3'];
    //register 3 users
    var participantOneResponse = await lotteryClient.ParticipateTransaction(signer, participantOne);
    assert.equal(participantOneResponse.statusCode, 200);
    var participantTwoResponse = await lotteryClient.ParticipateTransaction(signer, participantTwo);
    assert.equal(participantTwoResponse.statusCode, 200);
    var participantThreeResponse = await lotteryClient.ParticipateTransaction(signer, participantThree);
    assert.equal(participantThreeResponse.statusCode, 200);

    //pick the winner
    var pickTheWinnerResponse = await lotteryClient.PickTheWinnerTransaction(signer);
    assert.equal(pickTheWinnerResponse.statusCode, 200);
    
    //check the results
    var lotteryResponse = await lotteryClient.GetOrCreateDefaultLotteryQuery(signer);
    assert.equal(lotteryResponse.statusCode, 200);
    assert.equal(lotteryResponse.body.result.Participants.length, 0);
    assert.equal(lotteryResponse.body.result.Winners.length, 1);
    var winner = lotteryResponse.body.result.Winners[0];
    assert.equal(winner.Prize, expectedPrize);
    participantIds.should.include(winner.Id);
  });

  it("Lottery negative test: The minimum ticket price (lot) is 100 points.", async (): Promise<void> => {
    const participantOne: Participant = {
      Id: 'participant_1',
      Name: 'Ivan',
      Lot: 99,
    };

    var participantResponse = await lotteryClient.ParticipateTransaction(signer, participantOne);
    assert.equal(participantResponse.statusCode, 500);
    participantResponse.text.should.include('The minimum ticket price is 100 points!');
  });

  it("Lottery negative test: The minimum ticket price (lot) is 100 points.", async (): Promise<void> => {
    const participantOne: Participant = {
      Id: 'participant_1',
      Name: 'Ivan',
      Lot: 150,
    };

    var participantResponse = await lotteryClient.ParticipateTransaction(signer, participantOne);
    assert.equal(participantResponse.statusCode, 200);

    var participantResponseRepeated = await lotteryClient.ParticipateTransaction(signer, participantOne);
    assert.equal(participantResponseRepeated.statusCode, 500);
    participantResponseRepeated.text.should.include(`The participant with ${participantOne.Id} already participating in the lottery!`);
  });

  it("Lottery negative test: A minimum of 3 users is required to participate in the lottery", async (): Promise<void> => {
    const participantOne: Participant = {
      Id: 'participant_1',
      Name: 'Ivan',
      Lot: 100,
    };
    const participantTwo: Participant = {
      Id: 'participant_2',
      Name: 'Ivan',
      Lot: 150,
    };

    //register 2 users
    var participantOneResponse = await lotteryClient.ParticipateTransaction(signer, participantOne);
    assert.equal(participantOneResponse.statusCode, 200);
    var participantTwoResponse = await lotteryClient.ParticipateTransaction(signer, participantTwo);
    assert.equal(participantTwoResponse.statusCode, 200);

    var pickTheWinnerResponse = await lotteryClient.PickTheWinnerTransaction(signer);
    assert.equal(pickTheWinnerResponse.statusCode, 500);
    pickTheWinnerResponse.text.should.include('A minimum of 3 users is required to participate in the lottery!');
  });

});

