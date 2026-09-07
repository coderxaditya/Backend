import { z } from "zod";


export const createUserSchema = z.object({
    name: z
    .string()
    .min(2,{
        error: "Minimum 2 characters required"
    }),

    email: z.email(),

    age: z
    .number({
        error: "Number expected"
    })
    .int()
    .positive()
})

export const userParamsSchema = z.object({
    id: z.coerce
    .number({
        error: "Number expected"
    })
    .int()
    .positive()
})

export const userQuerySchema = z.object({
    page: z.coerce
    .number({
        error: "Number expected"
    })
    .int()
    .positive()
    .default(1),


    limit: z.coerce
    .number({
        error: "Number expected"
    })
    .int()
    .positive()
    .default(10)
})