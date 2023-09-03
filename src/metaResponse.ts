import {Object, Property} from 'fabric-contract-api';

@Object()
export class MetaResponse {
    @Property()
    public Message: string;
}
