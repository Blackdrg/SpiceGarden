import { describe, expect, it, beforeEach } from '@jest/globals';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AuthController } from '../src/services/auth/auth.controller';
import { AuthService } from '../src/services/auth/auth.service';
import { UserEntity } from '../src/db/entities/user.entity';

function createController(userRepo: any, authService: any) {
  return {
    controller: new AuthController(authService, userRepo),
    userRepo,
    authService,
  };
}

describe('AuthController account edge cases', () => {
  let userRepo: any;
  let authService: any;
  let controller: AuthController;

  beforeEach(() => {
    userRepo = { findOne: jest.fn(), create: jest.fn(), save: jest.fn() };
    authService = {
      hashPassword: jest.fn(),
      login: jest.fn(),
      validateUser: jest.fn(),
      refreshAccessToken: jest.fn(),
      revokeSession: jest.fn(),
    };
    controller = createController(userRepo, authService).controller;
  });

  it('rejects duplicate email registration with a conflict response', async () => {
    userRepo.findOne.mockResolvedValue({ id: 'existing-user', email: 'test@example.com' });

    await expect(controller.register({
      email: 'test@example.com',
      password: 'secret',
      phone: '+15555555555',
      fullName: 'Test User',
    }, { ip: '127.0.0.1' } as any)).rejects.toThrow(ConflictException);

    expect(authService.hashPassword).not.toHaveBeenCalled();
    expect(userRepo.create).not.toHaveBeenCalled();
    expect(userRepo.save).not.toHaveBeenCalled();
    expect(authService.login).not.toHaveBeenCalled();
  });

  it('registers a new user and returns login tokens', async () => {
    userRepo.findOne.mockResolvedValue(null);
    userRepo.create.mockReturnValue({ id: 'new-user', email: 'test@example.com', phone: '+15555555555', fullName: 'Test User', passwordHash: 'hash' });
    userRepo.save.mockResolvedValue({ id: 'new-user', email: 'test@example.com', role: 'customer', status: 'active' });
    authService.hashPassword.mockResolvedValue('hash');
    authService.login.mockResolvedValue({ access_token: 'access', refresh_token: 'refresh' });

    const result = await controller.register({
      email: 'test@example.com',
      password: 'secret',
      phone: '+15555555555',
      fullName: 'Test User',
    }, { ip: '127.0.0.1' } as any);

    expect(result).toEqual({ access_token: 'access', refresh_token: 'refresh' });
    expect(authService.login).toHaveBeenCalledWith(
      { id: 'new-user', email: 'test@example.com', role: 'customer', status: 'active' },
      { name: 'any Device', type: 'any Type', ip: '127.0.0.1' },
    );
  });

  it('uses AuthService validation for login failures', async () => {
    authService.validateUser.mockRejectedValue(new UnauthorizedException('Invalid email or password'));

    await expect(controller.login({ email: 'test@example.com', password: 'wrong' }, { ip: '127.0.0.1' } as any))
      .rejects.toThrow(UnauthorizedException);

    expect(authService.login).not.toHaveBeenCalled();
  });
});
