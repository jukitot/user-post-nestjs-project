import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpStatus,
  Query,
  UseGuards,
  Req,
  UseInterceptors,
  NotFoundException,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UserDto, AccountResponseDto, UserItemDto } from './dto/user.dto';
import { ApiExtraModels, ApiResponse, ApiTags } from '@nestjs/swagger';
import { BaseQueryDto } from '../common/validator/base.query.validator';
import {
  ApiPaginatedResponse,
  PaginatedDto,
} from '../common/interface/response.interface';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../common/decorator/roles.decorator';
import { RoleGuard } from '../common/guards/role.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { editFileName, PATH_TO_IMAGE } from '../common/utils/upload.utils';
import { User } from '../database/entities/user.entity';

@ApiTags('User')
@ApiExtraModels(UserItemDto, PaginatedDto)
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiResponse({ status: HttpStatus.CREATED, type: AccountResponseDto })
  @Post('/create')
  async createUser(@Body() createUserDto: UserDto) {
    return this.userService.create(createUserDto);
  }

  @Roles('Admin', 'Manager')
  @UseGuards(AuthGuard(), RoleGuard)
  @ApiPaginatedResponse('entities', UserItemDto)
  @Get('/list')
  findAll(@Query() query: BaseQueryDto) {
    return this.userService.findAll(query);
  }

  @Patch('avatar')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: `.${PATH_TO_IMAGE}`,
        filename: editFileName,
      }),
    }),
  )
  //get user by id
  @Get(':id')
  async getUserById(@Param('id') id: string): Promise<User | null> {
    const user = await this.userService.findUser(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }
  //update user
  @Patch(':id')
  @UseGuards(AuthGuard())
  async updateUser(
    @Param('id') userId: string,
    @Body() updateUserDto: UserDto,
    @Req() req: Request & { user: any },
  ) {
    const currentUserId = req.user['id'];
    return this.userService.updateUser(userId, updateUserDto, currentUserId);
  }
  //delete user
  @Delete(':id')
  @UseGuards(AuthGuard())
  async deleteUser(
    @Param('id') userId: string,
    @Req() req: Request & { user: any },
  ) {
    const currentUserId = req.user['id'];
    return this.userService.deleteUser(userId, currentUserId);
  }
}
