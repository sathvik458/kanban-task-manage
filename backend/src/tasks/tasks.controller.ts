import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../common/current-user.decorator';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@UseGuards(JwtAuthGuard)
@Controller()
export class TasksController {
  constructor(private tasks: TasksService) {}

  // List + create are nested under a project: /projects/:projectId/tasks
  @Get('projects/:projectId/tasks')
  list(
    @CurrentUser() user: { id: string },
    @Param('projectId') projectId: string,
  ) {
    return this.tasks.listForProject(user.id, projectId);
  }

  @Post('projects/:projectId/tasks')
  create(
    @CurrentUser() user: { id: string },
    @Param('projectId') projectId: string,
    @Body() dto: CreateTaskDto,
  ) {
    return this.tasks.create(user.id, projectId, dto);
  }

  // Update + delete operate on a single task by id: /tasks/:id
  // Used for editing AND for drag-drop (status/order changes)
  @Patch('tasks/:id')
  update(
    @CurrentUser() user: { id: string },
    @Param('id') id: string,
    @Body() dto: UpdateTaskDto,
  ) {
    return this.tasks.update(user.id, id, dto);
  }

  @Delete('tasks/:id')
  remove(
    @CurrentUser() user: { id: string },
    @Param('id') id: string,
  ) {
    return this.tasks.remove(user.id, id);
  }
}
