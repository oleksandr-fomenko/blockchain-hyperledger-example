import {Object, Property} from 'fabric-contract-api';

@Object()
export class Winner {
    @Property()
    public Id: string;

    @Property()
    public Name: string;

    @Property()
    public Prize: number;

    @Property()
    public WinDate: Date;
}
