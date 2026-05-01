import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

@Injectable()
export class ProjectsService {
  constructor(private prisma: PrismaService) {}

  // List all projects owned by the logged-in user, newest first
  list(userId: string) {
    return this.prisma.project.findMany({
      where: { ownerId: userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  create(userId: string, dto: CreateProjectDto) {
    return this.prisma.project.create({
      data: {
        name: dto.name,
        description: dto.description,
        ownerId: userId,
      },
    });
  }

  // Throws NotFound if it doesn't exist, Forbidden if it isn't yours.
  // Use this whenever a route needs to read or modify a single project.
  async findOwned(userId: string, projectId: string) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });
    if (!project) throw new NotFoundException('Project not found');
    if (project.ownerId !== userId) {
      throw new ForbiddenException('Not your project');
    }
    return project;
  }

  async update(userId: string, projectId: string, dto: UpdateProjectDto) {
    await this.findOwned(userId, projectId);
    return this.prisma.project.update({
      where: { id: projectId },
      data: dto,
    });
  }

  async remove(userId: string, projectId: string) {
    await this.findOwned(userId, projectId);
    await this.prisma.project.delete({ where: { id: projectId } });
    return { ok: true };
  }
}
