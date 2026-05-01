import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ProjectsService } from '../projects/projects.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@Injectable()
export class TasksService {
  constructor(
    private prisma: PrismaService,
    private projects: ProjectsService,
  ) {}

  // List all tasks in a project (only if the project belongs to the user)
  async listForProject(userId: string, projectId: string) {
    await this.projects.findOwned(userId, projectId);
    return this.prisma.task.findMany({
      where: { projectId },
      orderBy: [{ status: 'asc' }, { order: 'asc' }],
    });
  }

  async create(userId: string, projectId: string, dto: CreateTaskDto) {
    await this.projects.findOwned(userId, projectId);

    // Put the new task at the end of the TODO column
    const last = await this.prisma.task.findFirst({
      where: { projectId, status: 'TODO' },
      orderBy: { order: 'desc' },
    });
    const nextOrder = last ? last.order + 1 : 0;

    return this.prisma.task.create({
      data: {
        title: dto.title,
        description: dto.description,
        projectId,
        order: nextOrder,
      },
    });
  }

  // Look up a task and confirm the user owns its project.
  // Returns the task on success, throws on failure.
  private async findOwnedTask(userId: string, taskId: string) {
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
      include: { project: true },
    });
    if (!task) throw new NotFoundException('Task not found');
    if (task.project.ownerId !== userId) {
      throw new ForbiddenException('Not your task');
    }
    return task;
  }

  async update(userId: string, taskId: string, dto: UpdateTaskDto) {
    await this.findOwnedTask(userId, taskId);
    return this.prisma.task.update({
      where: { id: taskId },
      data: {
        title: dto.title,
        description: dto.description,
        status: dto.status,
        priority: dto.priority,
        order: dto.order,
      },
    });
  }

  async remove(userId: string, taskId: string) {
    await this.findOwnedTask(userId, taskId);
    await this.prisma.task.delete({ where: { id: taskId } });
    return { ok: true };
  }
}
