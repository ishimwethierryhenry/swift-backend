    // src/validations/passwordSchema.js
import Joi from "joi";

const passwordSchema = Joi.object({
  password: Joi.string()
    .min(8)
    .max(128)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .required()
    .messages({
      "string.min": "Password must be at least 8 characters long",
      "string.max": "Password cannot exceed 128 characters",
      "string.pattern.base": "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&)",
      "string.empty": "Password cannot be empty",
      "any.required": "Password is required"
    })
});

// Reset password schema
export const resetPasswordSchema = Joi.object({
  token: Joi.string()
    .pattern(/^[a-f0-9]{64}$/i)
    .required()
    .messages({
      "string.pattern.base": "Invalid reset token format",
      "any.required": "Reset token is required"
    }),

  newPassword: Joi.string()
    .min(8)
    .max(128)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .required()
    .messages({
      "string.min": "Password must be at least 8 characters long",
      "string.max": "Password cannot exceed 128 characters",
      "string.pattern.base": "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&)",
      "string.empty": "New password cannot be empty",
      "any.required": "New password is required"
    }),

  confirmPassword: Joi.string()
    .valid(Joi.ref('newPassword'))
    .required()
    .messages({
      "any.only": "Password confirmation does not match",
      "any.required": "Password confirmation is required"
    })
});

// Change password schema
export const changePasswordSchema = Joi.object({
  currentPassword: Joi.string()
    .required()
    .messages({
      "string.empty": "Current password cannot be empty",
      "any.required": "Current password is required"
    }),

  newPassword: Joi.string()
    .min(8)
    .max(128)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .required()
    .messages({
      "string.min": "Password must be at least 8 characters long",
      "string.max": "Password cannot exceed 128 characters",
      "string.pattern.base": "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&)",
      "string.empty": "New password cannot be empty",
      "any.required": "New password is required"
    }),

  confirmPassword: Joi.string()
    .valid(Joi.ref('newPassword'))
    .required()
    .messages({
      "any.only": "Password confirmation does not match",
      "any.required": "Password confirmation is required"
    })
});

// Forgot password request schema
export const forgotPasswordSchema = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .messages({
      "string.email": "Please enter a valid email address",
      "string.empty": "Email cannot be empty",
      "any.required": "Email is required"
    })
});

// Force password change schema (first login)
export const forcePasswordChangeSchema = Joi.object({
  newPassword: Joi.string()
    .min(8)
    .max(128)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .required()
    .messages({
      "string.min": "Password must be at least 8 characters long",
      "string.max": "Password cannot exceed 128 characters",
      "string.pattern.base": "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&)",
      "string.empty": "Password cannot be empty",
      "any.required": "Password is required"
    }),

  confirmPassword: Joi.string()
    .valid(Joi.ref('newPassword'))
    .required()
    .messages({
      "any.only": "Password confirmation does not match",
      "any.required": "Password confirmation is required"
    })
});

// Password strength checker
export const checkPasswordStrength = (password) => {
  if (!password) return { score: 0, feedback: "Password is required" };

  let score = 0;
  const feedback = [];

  // Length check
  if (password.length >= 8) score += 1;
  else feedback.push("At least 8 characters");

  if (password.length >= 12) score += 1;
  else feedback.push("12+ characters for better security");

  // Character variety checks
  if (/[a-z]/.test(password)) score += 1;
  else feedback.push("Include lowercase letters");

  if (/[A-Z]/.test(password)) score += 1;
  else feedback.push("Include uppercase letters");

  if (/\d/.test(password)) score += 1;
  else feedback.push("Include numbers");

  if (/[@$!%*?&]/.test(password)) score += 1;
  else feedback.push("Include special characters (@$!%*?&)");

  // Additional complexity checks
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\?]/.test(password)) score += 1;

  // No common patterns
  if (!/(.)\1{2,}/.test(password)) score += 1; // No repeating characters
  else feedback.push("Avoid repeating characters");

  if (!/123|abc|qwe|password|admin/i.test(password)) score += 1;
  else feedback.push("Avoid common patterns");

  // Determine strength level
  let strength = "Very Weak";
  let color = "#ff4444";

  if (score >= 8) {
    strength = "Very Strong";
    color = "#00aa00";
  } else if (score >= 6) {
    strength = "Strong";
    color = "#66aa00";
  } else if (score >= 4) {
    strength = "Moderate";
    color = "#aaaa00";
  } else if (score >= 2) {
    strength = "Weak";
    color = "#aa6600";
  }

  return {
    score: Math.min(score, 8),
    maxScore: 8,
    percentage: Math.min((score / 8) * 100, 100),
    strength,
    color,
    feedback: feedback.length > 0 ? feedback : ["Password meets security requirements"],
    isValid: score >= 6 // Require at least "Strong" for acceptance
  };
};

export default { 
  passwordSchema,
  resetPasswordSchema,
  changePasswordSchema,
  forgotPasswordSchema,
  forcePasswordChangeSchema,
  checkPasswordStrength
};