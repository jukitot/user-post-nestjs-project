import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { InjectRedisClient, RedisClient } from '@webeleon/nestjs-redis';
import { ForgotPassword, UserDto } from '../user/dto/user.dto';
import { User } from '../database/entities/user.entity';

@Injectable()
export class AuthService {
  private redisUserKey = 'user-token';
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRedisClient() private readonly redisClient: RedisClient,
    private readonly jwtService: JwtService,
  ) {}

  async signUpUser(data: UserDto): Promise<{ accessToken: string }> {
    const findUser = await this.userRepository.findOne({
      where: { email: data.email },
    });
    if (findUser) {
      throw new BadRequestException('User with this email already exist.');
    }
    const password = await bcrypt.hash(data.password, 10);
    const user: User = await this.userRepository.save(
      this.userRepository.create({ ...data, password }),
    );

    const token = await this.signIn(user.id, user.email);

    await this.redisClient.setEx(
      `${this.redisUserKey}-${user.id}`,
      24 * 60 * 60,
      token,
    );

    return { accessToken: token };
  }

  async validateUser(userId: string, userEmail: string): Promise<User> {
    if (!userId || !userEmail) {
      throw new UnauthorizedException();
    }
    const user = this.userRepository.findOne({
      where: {
        id: userId,
        email: userEmail,
      },
    });
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }

  async signIn(userId: string, userEmail: string): Promise<string> {
    return this.jwtService.sign({ id: userId, email: userEmail });
  }

  async compareHash(password: string, hash: string) {
    return bcrypt.compare(password, hash);
  }

  async login(data: any) {
    const findUser = await this.userRepository.findOne({
      where: { email: data.email },
    });

    if (!findUser) {
      throw new BadRequestException('Wrong email or password.');
    }

    if (!(await this.compareHash(data.password, findUser.password))) {
      throw new BadRequestException('Wrong email or password.');
    }

    const token = await this.signIn(findUser.id, findUser.email);

    await this.redisClient.setEx(
      `${this.redisUserKey}-${findUser.id}`,
      24 * 60 * 60,
      token,
    );

    return { accessToken: token };
  }

  async validate(token: string) {
    try {
      return this.jwtService.verifyAsync(token);
    } catch (e) {
      console.log(e);
      return null;
    }
  }

  create(data: ForgotPassword) {
    if (data.password !== data.repeatPassword) {
    }
    return 'This action adds a new auth';
  }
}
