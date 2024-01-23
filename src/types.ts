export interface Receipt {
    id: string;
    title: string;
    image?:string;
    categories: Array<string>;
    tags: Array<string>;
    description : string,
    url?: string,

    ingredients : Array<string>,
    steps       : Array<string>,

    time        : {
        total   : string,
        prepare :string,
        cook    : string
    },

    quantity  : string,
    comment   : string,
    language  : string,
    version   : string,
    createdAt : string,
}

export interface ReceipFilter {
    value: string,
    items: Array<string>
}
