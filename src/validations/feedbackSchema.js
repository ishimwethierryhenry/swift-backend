// =================== VALIDATION SCHEMA ===================
// src/validations/feedbackSchema.js
import Joi from "joi";

const feedbackSchema = Joi.object({
  poolId: Joi.string().uuid().optional().allow(null).messages({
    "string.guid": "Pool ID must be a valid UUID"
  }),

  feedbackType: Joi.string().valid('suggestion', 'issue', 'compliment', 'general', 'feature_request').required().messages({
    "any.only": "Feedback type must be one of: suggestion, issue, compliment, general, feature_request",
    "any.required": "Feedback type is required"
  }),

  priority: Joi.string().valid('low', 'medium', 'high', 'urgent').optional().default('medium').messages({
    "any.only": "Priority must be one of: low, medium, high, urgent"
  }),

  title: Joi.string().min(5).max(200).required().messages({
    "string.min": "Title must be at least 5 characters long",
    "string.max": "Title cannot exceed 200 characters",
    "string.empty": "Title cannot be empty",
    "any.required": "Title is required"
  }),

  description: Joi.string().min(10).max(2000).required().messages({
    "string.min": "Description must be at least 10 characters long",
    "string.max": "Description cannot exceed 2000 characters",
    "string.empty": "Description cannot be empty",
    "any.required": "Description is required"
  }),

  rating: Joi.number().integer().min(1).max(5).optional().messages({
    "number.min": "Rating must be between 1 and 5",
    "number.max": "Rating must be between 1 and 5"
  }),

  isAnonymous: Joi.boolean().optional().default(false)
});

export default feedbackSchema;