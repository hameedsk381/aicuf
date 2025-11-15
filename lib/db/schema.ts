import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core"
import { sql } from "drizzle-orm"

export const registrations = sqliteTable("registrations", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  registrationId: text("registration_id").notNull().unique(),
  applicationType: text("application_type").notNull(),
  name: text("name").notNull(),
  gender: text("gender").notNull(),
  registrationNo: text("registration_no").notNull(),
  course: text("course").notNull(),
  age: text("age").notNull(),
  instagramId: text("instagram_id"),
  mobileNo: text("mobile_no").notNull(),
  whatsappNo: text("whatsapp_no").notNull(),
  emailId: text("email_id").notNull(),
  religion: text("religion").notNull(),
  address: text("address").notNull(),
  skills: text("skills"), // JSON string
  otherSkills: text("other_skills"),
  eventExperience: text("event_experience"),
  justSocietyDefinition: text("just_society_definition"),
  communicationExample: text("communication_example"),
  aicufVision: text("aicuf_vision"),
  leadershipPosition: text("leadership_position"),
  additionalMessage: text("additional_message"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
})

export const nominations = sqliteTable("nominations", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  unitName: text("unit_name").notNull(),
  contestingFor: text("contesting_for").notNull(),
  educationQualification: text("education_qualification").notNull(),
  nocFilePath: text("noc_file_path").notNull(),
  nocFileName: text("noc_file_name").notNull(),
  status: text("status").notNull().default("pending"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
})

export const contacts = sqliteTable("contacts", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  email: text("email").notNull(),
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  status: text("status").notNull().default("unread"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
})

export const newsletters = sqliteTable("newsletters", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  email: text("email").notNull().unique(),
  subscribedAt: integer("subscribed_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`),
})
