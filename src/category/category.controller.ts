import { Controller, Post, Body, Get, Param, Patch, Delete } from '@nestjs/common';
import { CategoryService } from './category.service';
import { ZodValidationPipe } from 'libs/application/src/pipes';
import { CategoryZ, PatchCategoryZ } from 'libs/domain/src/schemas';
import { z } from 'zod';
import { ICategory } from 'libs/domain/src/interfaces/category/category.interface';


@Controller('category')
export class CategoryController {
    constructor(private readonly categoryService: CategoryService) {}

    @Post('')
    async create(
        @Body(new ZodValidationPipe(CategoryZ)) category: z.infer<typeof CategoryZ>){
        return await this.categoryService.create(category);
    };

    @Get('')
    async findAll(): Promise<ICategory[]> {
        return await this.categoryService.findAll();
    };

    @Get(':id')
    async findById(@Param('id') id: string): Promise<ICategory | null> {
        return await this.categoryService.findById(id);
    };

    @Patch(':id')
    async update(
        @Param('id') id: string,
        @Body(new ZodValidationPipe(PatchCategoryZ)) category: z.infer<typeof PatchCategoryZ>
    ){
        return await this.categoryService.update(id, category);
    };

    @Delete(':id')
    async delete(@Param('id') id: string): Promise<{ message: string }> {
        return await this.categoryService.delete(id);
    };
}
