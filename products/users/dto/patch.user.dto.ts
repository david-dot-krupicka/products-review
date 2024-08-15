import { PutUserDto } from './put.user.dto';

// Partial is a utility type that makes all properties of an object optional.
export interface PatchUserDto extends Partial<PutUserDto> {}
