export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '')
    .trim()
}

export function sanitizeEmail(email: string): string {
  return email
    .toLowerCase()
    .replace(/[^a-z0-9@._+-]/g, '')
    .trim()
}

export function sanitizePhoneNumber(phone: string): string {
  return phone.replace(/[^0-9+]/g, '').trim()
}

export function sanitizeHtml(html: string): string {
  const allowedTags = ['b', 'i', 'em', 'strong', 'p', 'br']
  let sanitized = html

  sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
  sanitized = sanitized.replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
  sanitized = sanitized.replace(/javascript:/gi, '')
  sanitized = sanitized.replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')

  return sanitized
}

export function validateAndSanitizeRegistrationData(data: any) {
  return {
    applicationType: data.applicationType,
    name: sanitizeInput(data.name),
    gender: data.gender,
    registrationNo: sanitizeInput(data.registrationNo),
    course: sanitizeInput(data.course),
    age: sanitizeInput(data.age),
    instagramId: data.instagramId ? sanitizeInput(data.instagramId) : undefined,
    mobileNo: sanitizePhoneNumber(data.mobileNo),
    whatsappNo: sanitizePhoneNumber(data.whatsappNo),
    emailId: sanitizeEmail(data.emailId),
    password: data.password, // Pass through without sanitization (will be hashed)
    confirmPassword: data.confirmPassword, // Only for validation, not stored
    religion: data.religion,
    address: sanitizeInput(data.address),
    skills: data.skills ? data.skills.map((s: string) => sanitizeInput(s)) : [],
    otherSkills: data.otherSkills ? sanitizeInput(data.otherSkills) : undefined,
    eventExperience: data.eventExperience ? sanitizeInput(data.eventExperience) : undefined,
    justSocietyDefinition: data.justSocietyDefinition ? sanitizeInput(data.justSocietyDefinition) : undefined,
    communicationExample: data.communicationExample ? sanitizeInput(data.communicationExample) : undefined,
    aicufVision: data.aicufVision ? sanitizeInput(data.aicufVision) : undefined,
    leadershipPosition: data.leadershipPosition ? sanitizeInput(data.leadershipPosition) : undefined,
    declaration: Boolean(data.declaration),
    additionalMessage: data.additionalMessage ? sanitizeInput(data.additionalMessage) : undefined,
  }
}
