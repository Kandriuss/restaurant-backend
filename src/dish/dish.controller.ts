import { Controller, Post, Body } from "@nestjs/common";
import { DishService } from "./dish.service";
import { DishZ } from "libs/domain/src";
import { ZodValidationPipe } from "libs/application/src/pipes";
import { z } from "zod";

@Controller('dishes')
export class DishController {
    constructor(private readonly dishService: DishService) {}

    @Post('')
    async create(@Body(new ZodValidationPipe(DishZ)) dish: z.infer<typeof DishZ>){
        return await this.dishService.create(dish);
    }
}