import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CategoryService {
    constructor(private prisma: PrismaService) { }

    async create(data: { name: string; description: string }) {
        const nameLower = data.name.toLowerCase();
        try {
            return await this.prisma.category.create({
                data: {
                    name: nameLower,
                    description: data.description,
                },
            });
        } catch (error) {
            if (error.code === 'P2002') {
                throw new BadRequestException('Categoria já existe');
            }
            throw error;
        }
    }

    async findAll() {
        return this.prisma.category.findMany();
    }

    async remove(id: number) {
        return this.prisma.category.delete({ where: { id } });
    }

}
