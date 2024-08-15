// TODO: Use correct type in Promise (e.g. DeleteResult, etc.)
export interface CRUD {
    list: (limit: number, page: number) => Promise<any>;
    create: (resource: any) => Promise<any>;
    putById?: (id: string, resource: any) => Promise<any>;
    readById: (id: string | number) => Promise<any>;
    deleteById: (id: string | number) => Promise<any>;
    patchById: (id: string | number, resource: any) => Promise<any>;
}
