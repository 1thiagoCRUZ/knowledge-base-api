import { Injectable } from "@nestjs/common";
import { UserRepository } from "../repositories/user.repository";
import { CreateUserDto } from "../DTOs/users/createUser.dto";
import { User } from "../entities/user.entity";
import * as bcrypt from 'bcrypt';
import { ConflictException, NotFoundException } from "@nestjs/common";
import { UpdateUserDto } from "../DTOs/users/updateUser.dto";

@Injectable()
export class UserService {
    constructor(private readonly userRepository: UserRepository) { }

    async create(createUserDto: CreateUserDto): Promise<User> {
        const userExists = await this.userRepository.findByEmail(createUserDto.email);
        if (userExists) {
            throw new ConflictException('Este e-mail já esta em uso.');
        }

        const salt = await bcrypt.genSalt();
        const passwordHash = await bcrypt.hash(createUserDto.password, salt);

        const userToSave = {
            ...createUserDto,
            password: passwordHash,
        };

        return this.userRepository.create(userToSave);
    }

    async findAll(): Promise<User[]> {
        return this.userRepository.findAll();
    }

    async findOne(id: number): Promise<User> {
        const user = await this.userRepository.findById(id);
        if (!user) {
            throw new NotFoundException(`Usuário com ID ${id} não encontrado.`);
        }
        return user;
    }

    async update(id: number, updateUserDto: UpdateUserDto): Promise<void> {
        const user = await this.findOne(id);

        if (updateUserDto.email && updateUserDto.email !== user.email) {
            const emailExists = await this.userRepository.findByEmail(updateUserDto.email);
            if (emailExists) {
                throw new ConflictException('Este e-mail já está em uso.')
            }
        }

        if (updateUserDto.password) {
            const salt = await bcrypt.genSalt();
            const passwordHash = await bcrypt.hash(updateUserDto.password, salt);
            updateUserDto.password = passwordHash;
        }
        return this.userRepository.update(id, updateUserDto);
    }

    async delete(id: number): Promise<void> {
        return this.userRepository.delete(id);
    }
    async findByEmailForAuth(email: string): Promise<User | null> {
        return this.userRepository.findByEmailWithPassword(email);
    }
}