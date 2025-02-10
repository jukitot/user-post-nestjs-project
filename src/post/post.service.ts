import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../database/entities/user.entity';
import { Post } from '../database/entities/post.entity';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(Post)
    private postsRepository: Repository<Post>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async createPost(title: string, body: string, userId: string): Promise<Post> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new Error('User not found');
    }
    const post = this.postsRepository.create({ title, body, user_id: userId });
    return this.postsRepository.save(post);
  }

  async getPostsByUser(userId: string): Promise<Post[]> {
    return this.postsRepository.find({ where: { user: { id: userId } } });
  }

  async updatePost(postId: string, body: string): Promise<Post> {
    const post = await this.postsRepository.findOne({ where: { id: postId } });
    if (!post) {
      throw new Error('Post not found');
    }
    post.body = body;
    post.updatedAt = new Date();
    return this.postsRepository.save(post);
  }

  async deletePost(postId: string): Promise<void> {
    await this.postsRepository.delete(postId);
  }
}
