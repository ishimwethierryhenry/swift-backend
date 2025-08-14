import Joi from "joi";

const poolSchema = Joi.object({
  name: Joi.string().required().min(2).label("Name").messages({
    "string.empty": "The name field cannot be empty",
    "string.min": "The name field must be at least 2 characters long",
  }),

  depth: Joi.required().label("Depth").messages({
    "any.required": "The depth field is required",
    "string.empty": "The depth field cannot be empty",
  }),

  l: Joi.required().label("Length").messages({
    "any.required": "The length field is required",
    "string.empty": "The length field cannot be empty",
  }),

  w: Joi.required().label("Width").messages({
    "any.required": "The width field is required",
    "string.empty": "The width field cannot be empty",
  }),
  assigned_to: Joi.required().label("assigned_to").messages({
    "any.required": "The width field is required",
    "string.empty": "The width field cannot be empty",
  }),
  location: Joi.string().required().messages({
    "string.empty": "The location field cannot be empty",
    "string.empty": "The location field cannot be empty",
  }),
});

export default poolSchema;
