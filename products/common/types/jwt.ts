export interface Jwt {
    refreshKey: Buffer;
    userId: string;
    permissionFlags: string;
}
