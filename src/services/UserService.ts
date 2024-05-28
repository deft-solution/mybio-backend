import { injectable } from 'inversify';
import { FilterQuery } from 'mongoose';

import { BadRequestError, NotFoundError } from '../../packages';
import { ErrorCode } from '../enums/ErrorCode';
import { TokenType } from '../enums/TokenType';
import { UserStatus } from '../enums/UserStatus';
import { AccessToken } from '../models/Token';
import User, { IUser } from '../models/User';
import { hashPassword, validatePassword } from '../utils/bycryp';
import { generateAccessToken, getJWTLifeTime } from '../utils/jwt';

export interface UserService {
  signUp: (user: IUser) => Promise<AccessToken>;
  login: (username: string, password: string) => Promise<AccessToken>;
  findOne: (filter: FilterQuery<IUser>) => Promise<IUser | null>;
  findActiveOne: (filter: FilterQuery<IUser>) => Promise<IUser | null>;
  findByIdActive: (id: string) => Promise<IUser>;
  findByIdAndUpdate: (user: IUser) => Promise<IUser | null>;
}

@injectable()
export class UserServiceImpl implements UserService {

  async login(username: string, password: string) {
    let user = await this.findOne(({ username: username, status: UserStatus.Active }));
    if (!user) {
      throw new NotFoundError('This email does not exited!.')
    }
    const isValidPassword = validatePassword(password, user.password);
    if (!isValidPassword) {
      throw new BadRequestError('Invalid Password!.')
    }
    user.lastLoginAt = new Date();
    await User.updateOne({ username }, user);
    return this._generateToken(user.id);
  }

  async signUp(param: IUser) {
    const user = await this.findOneByEmail(param.email);
    if (user) {
      throw new BadRequestError('This emails has registered')
    }
    if (param.password) {
      param['password'] = hashPassword(param.password)
    }
    //
    const data = await new User(param).save();
    return this._generateToken(data.id);
  };

  findOneByEmail(email: string): Promise<IUser | null> {
    return User.findOne({ email });
  };

  async findByIdActive(id: string): Promise<IUser> {
    const user = await User.findOne({ _id: id, status: UserStatus.Active });
    if (!user) {
      throw new NotFoundError('User does not existed!. ', ErrorCode.UserDoesNotExist)
    }
    return user;
  };

  findActiveOne(filter: FilterQuery<IUser>): Promise<IUser | null> {
    return User.findOne({ ...filter, status: UserStatus.Active });
  };

  findOne(filter: FilterQuery<IUser>): Promise<IUser | null> {
    return User.findOne(filter);
  };

  findByIdAndUpdate(user: IUser): Promise<IUser | null> {
    return User.findByIdAndUpdate(user.id, user).exec();
  }

  private _generateToken(userId: string,) {
    const expiredIn = getJWTLifeTime()
    const token = generateAccessToken(userId, expiredIn);
    return new AccessToken(token, expiredIn, userId, TokenType.Bearer)
  }
}