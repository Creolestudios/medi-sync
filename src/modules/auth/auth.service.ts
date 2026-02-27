import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async validateUser(username: string, password: string): Promise<any> {
    // In a real app, you would get the user from your database
    // This is a simplified example
    const user = await this.findUserByUsername(username);
    
    if (user && (await bcrypt.compare(password, user.password))) {
      const { password: _, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = { 
      username: user.username, 
      sub: user.userId,
      roles: user.roles || ['user'],
    };
    
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.userId,
        username: user.username,
        roles: user.roles,
      },
    };
  }

  private async findUserByUsername(username: string): Promise<any> {
    // In a real app, you would query your database here
    // This is a hardcoded example
    if (username === 'admin') {
      return {
        userId: '1',
        username: 'admin',
        password: await bcrypt.hash('admin123', 10),
        roles: ['admin'],
      };
    }
    return null;
  }
}
