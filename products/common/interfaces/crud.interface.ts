/* eslint-disable */
// TODO: fix eslint-disable later
// TODO: Use correct type in Promise (e.g. DeleteResult, etc.)
// TODO: The optional properties could be omitted and each service could implement its own CRUD interface
// TODO: string | number looks like not a good practice
export interface CRUD {
    list?: (limit: number, page: number, id?: string | undefined) => Promise<any>;
    create: (resource: any) => Promise<any>;
    putById?: (id: string, resource: any) => Promise<any>;
    readById: (id: string) => Promise<any>;
    deleteById: (id: string) => Promise<any>;
    patchById: (id: string, resource: any) => Promise<any>;
}
