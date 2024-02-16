
export interface Recipe {
    id: string;
    title: string;
    description : string,

    categories: Array<string>;
    tags: Array<string>;

    image?:string;
    url?: string,

    language  : string,
    quantity  : string,
    comment   : string,

    ingredients : Array<string>,
    steps       : Array<string>,

    time        : {
        total   : string,
        prepare : string,
        cook    : string
    },

    version   : string,

    favorite: boolean,
    visits: number,
    rating?: number,

    updatedAt : string,
    createdAt : string,
    deletedAt?: string
}

export interface ReceipFilter {
    value: string,
    items: Array<string>
}

declare global {
    const TASTORIA_BUILD: {
        VERSION: string;
        DATE: string;
    };
}

export interface FireBaseTokenPayload {
    uid : string
    exp: number
    authTime: number
}
