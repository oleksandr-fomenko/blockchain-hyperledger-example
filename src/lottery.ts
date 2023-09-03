import {Object, Property} from 'fabric-contract-api';
import {Participant} from './participant';
import {Winner} from './winner';

@Object()
export class Lottery {

    @Property()
    public Id: string;

    @Property()
    public Participants: Participant[];

    @Property()
    public Winners: Winner[];
}
