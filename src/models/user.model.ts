import { Document, Schema, Model, model } from "mongoose";

export interface IUser extends Document {
    email: string,
    password: string,
    auth: boolean,
    admin: boolean
}

let userSchema = new Schema({
    email: { type: String, index: true },
    password: { type: String, index: true },
    auth: { type: Boolean, index: true },
    admin: { type: Boolean, index: true }
}, { collection: 'User' });

let User: Model<IUser> = model<IUser>('User', userSchema);
export { User };