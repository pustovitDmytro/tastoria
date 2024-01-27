export interface Receipt {
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
}

export interface ReceipFilter {
    value: string,
    items: Array<string>
}
