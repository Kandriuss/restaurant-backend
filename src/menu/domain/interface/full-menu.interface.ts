export interface IFullMenu {
    id: string;
    plate: [{
        id: string;
        name: string;
        description: string;
        price: number;
        image: string;
    }];
    date: Date;
    isCurrent: boolean;
}