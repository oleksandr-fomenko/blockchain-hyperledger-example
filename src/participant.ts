import {Object, Property} from 'fabric-contract-api';

@Object()
export class Participant {
    @Property()
    public Id: string;

    @Property()
    public Name: string;

    @Property()
    public Lot: number;
}
