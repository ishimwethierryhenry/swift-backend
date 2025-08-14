import Joi from "joi";

const userSchema = Joi.object({
  fname: Joi.string()
    .required()
    .min(2)
    .label("Name")
    .regex(/^[A-Za-z]+$/)
    .messages({
      "string.pattern.base":
        "The name field can not include numbers and special characters",
      "string.empty": "The name field can not be empty",
    }),

  lname: Joi.string()
    .required()
    .min(2)
    .label("Name")
    .regex(/^[A-Za-z]+$/)
    .messages({
      "string.pattern.base":
        "The name field can not include numbers and special characters",
      "string.empty": "The name field can not be empty",
    }),

  email: Joi.string().required().email().messages({
    "string.email": "Invalid email",
    "string.empty": "The email field can not be empty",
  }),

  phone: Joi.string()
    .required()
    .regex(/^\+?[0-9]{7,15}$/)
    .messages({
      "string.pattern.base": "Invalid phone number",
      "string.empty": "The phone field can not be empty",
    }),

  gender: Joi.string().required().valid("Male", "Female", "Other").messages({
    "any.only": "Gender must be either 'Male', 'Female', or 'Other'",
    "string.empty": "The gender field can not be empty",
  }),

  location: Joi.string().required().messages({
    "string.empty": "The location field can not be empty",
  }),
});

export default userSchema;
