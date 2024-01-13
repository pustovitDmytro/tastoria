export interface Receipt {
    id: string;
    title: string;
    image?:string;
    categories: Array<string>;
    tags: Array<string>;
}

export interface ReceipFilter {
    value: string,
    items: Array<string>
}
