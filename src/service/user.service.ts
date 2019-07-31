import { User, IUser } from '../models/user.model';
import { config } from '../config';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { logger } from '../libs/utils/logger';

export class UserService {
    public static async verify(inputEmail: string, inputPassword: string) {
        try {
            let user = await User.findOne({ email: inputEmail }).exec();
            if (!user) {
                return {
                    Message: "invalid",
                }
            } else {
                let isValid = await UserService.comparePassword(user.password, inputPassword);
                if (!isValid) {
                    return {
                        Message: "invalid",
                    }
                }
                else if (isValid && user.auth) {
                    // trans mongoose doc to normal object
                    let token = await this.signJWT(user);
                    return {
                        Message: "login success",
                        Token: token
                    }
                }
                else if (isValid && !user.auth) {
                    // trans mongoose doc to normal object
                    let token = await this.signJWT(user);
                    return {
                        Message: "account has not been authorized",
                        Token: token
                    }
                }
            }
        } catch (error) {
            logger.error(error);
            return {
                Message: "internal server error",
            }
        }
    }

    private static comparePassword(existPassword: string, inputPassword: string): Promise<boolean> {
        return new Promise((resolve, reject) => {
            bcrypt.compare('' + inputPassword, '' + existPassword, function (err, isValidPassword) {
                if (err) reject(err);
                resolve(isValidPassword)
            });
        })
    }

    private static signJWT(user: IUser): Promise<string> {
        return new Promise((resolve, reject) => {
            user = user.toObject();
            delete user['password'];
            delete user['_id'];
            delete user['__v'];
            jwt.sign({ user }, config.privateKey, { expiresIn: config.keepLoggedInDay, algorithm: 'RS256' }, function (err, token) {
                if (err) reject('Exception encountered when sign jwt: ' + err);
                resolve(token);
            });
        })
    }
}