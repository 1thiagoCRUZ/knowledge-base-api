import {
  ConflictException,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

const BCRYPT_ROUNDS = 12;

export function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly usersRepository: Repository<User>,
  ) {}

  /**
   * Dono da base (o primeiro usuário cadastrado). Usado como autor do que
   * chega por integrações, já que elas não têm um usuário logado.
   */
  async findOwner(): Promise<User> {
    const [owner] = await this.usersRepository.find({
      order: { id: 'ASC' },
      take: 1,
    });
    if (!owner) {
      throw new ServiceUnavailableException(
        'Nenhum usuário cadastrado. Rode `npm run seed:admin`.',
      );
    }
    return owner;
  }

  async findById(id: number): Promise<User> {
    const user = await this.usersRepository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException(`Usuário ${id} não encontrado.`);
    }
    return user;
  }

  /** Única consulta que traz o hash da senha (a coluna tem `select: false`). */
  findByEmailWithPassword(email: string): Promise<User | null> {
    return this.usersRepository
      .createQueryBuilder('user')
      .addSelect('user.password')
      .where('user.email = :email', { email: normalizeEmail(email) })
      .getOne();
  }

  async updateProfile(id: number, dto: UpdateProfileDto): Promise<User> {
    const user = await this.findById(id);

    if (dto.email !== undefined) {
      const email = normalizeEmail(dto.email);
      if (email !== user.email) {
        const taken = await this.usersRepository.existsBy({ email });
        if (taken) {
          throw new ConflictException('Este e-mail já está em uso.');
        }
      }
      user.email = email;
    }
    if (dto.name !== undefined) {
      user.name = dto.name;
    }

    return this.usersRepository.save(user);
  }

  async changePassword(id: number, dto: ChangePasswordDto): Promise<void> {
    const user = await this.usersRepository
      .createQueryBuilder('user')
      .addSelect('user.password')
      .where('user.id = :id', { id })
      .getOne();
    if (!user) {
      throw new NotFoundException(`Usuário ${id} não encontrado.`);
    }

    const matches = await bcrypt.compare(dto.currentPassword, user.password);
    if (!matches) {
      throw new UnauthorizedException('Senha atual incorreta.');
    }

    await this.usersRepository.update(id, {
      password: await hashPassword(dto.newPassword),
    });
  }
}
