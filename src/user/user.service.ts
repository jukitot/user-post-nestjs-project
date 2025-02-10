import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UserDto, UserItemDto } from './dto/user.dto';
import { BaseQueryDto } from '../common/validator/base.query.validator';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../database/entities/user.entity';
import { Repository } from 'typeorm';
import { SocketGateway } from '../socket/socket.gatewy';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly socket: SocketGateway,
  ) {}
  private usersList = [];
  async create(createUserDto: UserDto) {
    const index = new Date().valueOf();
    this.usersList.push({
      ...createUserDto,
      id: index,
    });
    return this.usersList[0];
  }

  async findAll(query?: BaseQueryDto, user?: any): Promise<any> {
    const options = {
      page: +query?.page || 1,
      limit: +query?.limit || 10,
    };
    const [entities, total] = await this.userRepository.findAndCount({
      where: { isActive: false },
      select: {
        email: true,
        firstName: true,
        id: true,
      },
      relations: {
        posts: true,
      },
      skip: (options.page - 1) * options.limit,
      take: options.limit,
    });

    return {
      page: options.page,
      pages: Math.ceil(total / options.limit),
      countItems: total,
      entities: entities,
    };
  }

  async findUser(id: string): Promise<User> {
    console.log(`Searching for user with ID: ${id}`);
    const user = await this.userRepository.findOne({ where: { id: id } });
    if (!user) {
      console.log(`User with ID ${id} not found.`);
      return null;
    }
    return user;
  }

  async updateUser(
    userId: string,
    updateUserDto: UserDto,
    currentUserId: string,
  ): Promise<User> {
    if (userId !== currentUserId) {
      throw new ForbiddenException('You can only update your own profile');
    }
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }
    Object.assign(user, updateUserDto);
    return this.userRepository.save(user);
  }

  async deleteUser(userId: string, currentUserId: string): Promise<void> {
    if (userId !== currentUserId) {
      throw new ForbiddenException('You can only delete your own profile');
    }
    const result = await this.userRepository.delete(userId);
    if (result.affected === 0) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }
  }
}
