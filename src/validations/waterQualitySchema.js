// // =================== VALIDATION SCHEMA ===================
// // src/validations/waterQualitySchema.js
// import Joi from "joi";

// const waterQualitySchema = Joi.object({
//   poolId: Joi.string().uuid().required().messages({
//     "string.empty": "Pool ID cannot be empty",
//     "string.guid": "Pool ID must be a valid UUID",
//     "any.required": "Pool ID is required"
//   }),

//   pH: Joi.number().min(0).max(14).precision(2).required().messages({
//     "number.min": "pH must be between 0 and 14",
//     "number.max": "pH must be between 0 and 14",
//     "any.required": "pH is required"
//   }),

//   turbidity: Joi.number().min(0).precision(2).required().messages({
//     "number.min": "Turbidity must be a positive number",
//     "any.required": "Turbidity is required"
//   }),

//   conductivity: Joi.number().min(0).precision(2).required().messages({
//     "number.min": "Conductivity must be a positive number",
//     "any.required": "Conductivity is required"
//   }),

//   temperature: Joi.number().min(-10).max(100).precision(2).optional().messages({
//     "number.min": "Temperature must be above -10°C",
//     "number.max": "Temperature must be below 100°C"
//   }),

//   dissolvedOxygen: Joi.number().min(0).precision(2).optional().messages({
//     "number.min": "Dissolved oxygen must be a positive number"
//   }),

//   notes: Joi.string().max(1000).optional().messages({
//     "string.max": "Notes cannot exceed 1000 characters"
//   })
// });




// src/validations/waterQualitySchema.js - Fixed export
import Joi from "joi";

const waterQualitySchema = Joi.object({
  poolId: Joi.string().uuid().required().messages({
    "string.empty": "Pool ID cannot be empty",
    "string.guid": "Pool ID must be a valid UUID",
    "any.required": "Pool ID is required"
  }),

  pH: Joi.number().min(0).max(14).precision(2).required().messages({
    "number.min": "pH must be between 0 and 14",
    "number.max": "pH must be between 0 and 14",
    "any.required": "pH is required"
  }),

  turbidity: Joi.number().min(0).precision(2).required().messages({
    "number.min": "Turbidity must be a positive number",
    "any.required": "Turbidity is required"
  }),

  conductivity: Joi.number().min(0).precision(2).required().messages({
    "number.min": "Conductivity must be a positive number",
    "any.required": "Conductivity is required"
  }),

  temperature: Joi.number().min(-10).max(100).precision(2).optional().messages({
    "number.min": "Temperature must be above -10°C",
    "number.max": "Temperature must be below 100°C"
  }),

  dissolvedOxygen: Joi.number().min(0).precision(2).optional().messages({
    "number.min": "Dissolved oxygen must be a positive number"
  }),

  notes: Joi.string().max(1000).optional().messages({
    "string.max": "Notes cannot exceed 1000 characters"
  })
});

export default waterQualitySchema;