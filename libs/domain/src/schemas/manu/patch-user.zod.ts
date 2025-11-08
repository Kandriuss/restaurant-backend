import z from "zod";
import { UserZ } from "./user.zod";

export const PatchUserZ = UserZ.omit({ 
    password: true, 
    roleCode:true })
    .partial();

export type PatchUserInput = z.infer<typeof PatchUserZ>