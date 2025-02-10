import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  UseGuards,
  Req,
} from '@nestjs/common';
import { PostService } from './post.service';
import { PostDto } from './dto/post.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('posts')
export class PostController {
  constructor(private readonly postsService: PostService) {}

  @Post()
  @UseGuards(AuthGuard())
  async createPost(@Body() createPostDto: PostDto, @Req() req) {
    const userId = req.user.userId;
    return this.postsService.createPost(
      createPostDto.title,
      createPostDto.body,
      userId,
    );
  }

  @Get(':userId')
  async getPostsByUser(@Param('userId') userId: string) {
    return this.postsService.getPostsByUser(userId);
  }

  @Put(':id')
  @UseGuards(AuthGuard())
  async updatePost(@Param('id') id: string, @Body() updatePostDto: PostDto) {
    return this.postsService.updatePost(id, updatePostDto.body);
  }

  @Delete(':id')
  @UseGuards(AuthGuard())
  async deletePost(@Param('id') id: string) {
    return this.postsService.deletePost(id);
  }
}
