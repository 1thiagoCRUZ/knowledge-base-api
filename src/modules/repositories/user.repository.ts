import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "../entities/user.entity";
import { Repository } from "typeorm";
import { CreateUserDto } from "../DTOs/users/createUser.dto";

@Injectable()
export class UserRepository {
    constructor(@InjectRepository(User) private readonly repository: Repository<User>) { }

    async create(createUserDto: CreateUserDto): Promise<User> {
        return this.repository.save(createUserDto);
    }

    async findAll(): Promise<User[]> {
        return this.repository.find();
    }
    async findByEmail(email: string): Promise<User | null> {
        return this.repository.findOne({
            where: { email }
        });
    }
    async findByEmailWithPassword(email: string): Promise<User | null> {
        return this.repository.createQueryBuilder('user')
            .where('user.email = :email', { email })
            .addSelect('user.password')
            .getOne();
    }
    async findById(id: number): Promise<User | null> {
        return this.repository.findOneBy({ id });
    }
    async update(id: number, userUpdateDto: Partial<User>): Promise<void> {
        await this.repository.update(id, userUpdateDto);
    }

    async delete(id: number): Promise<void> {
        await this.repository.delete(id);
    }
}