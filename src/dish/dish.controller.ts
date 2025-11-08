import { Controller, Post, Get, Body, Patch, Delete, Param } from "@nestjs/common";
import { DishService } from "./dish.service";
import { DishZ, DishPatchZ } from "libs/domain/src";
import type { PatchDishInput } from "libs/domain/src";
import { ZodValidationPipe } from "libs/application/src/pipes";
import { z } from "zod";
import { IDish } from "../../libs/domain/src/interfaces/dish/dish.interface";

@Controller('dishes')
export class DishController {
    constructor(private readonly dishService: DishService) {}

    @Post('')
    async create(
        @Body(new ZodValidationPipe(DishZ)) dish: z.infer<typeof DishZ>){
        return await this.dishService.create(dish);
    };

    @Get('')
    async findAll(): Promise<IDish[]> {
        return await this.dishService.findAll();
    };

    @Get(':id')
    async findById(
        @Param('id') id: string): Promise<IDish | null> {
        return await this.dishService.findById(id);
    };
    
    @Patch(':id')
    async update(
        @Param('id') id: string,
        @Body(new ZodValidationPipe(DishPatchZ)) dish: z.infer<typeof DishPatchZ>
    ){
        return await this.dishService.update(id, dish);
    };

    @Delete(':id')
    async delete(@Param('id') id: string){
        return await this.dishService.delete(id);
    };
}