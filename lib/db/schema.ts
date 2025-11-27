import { pgTable, serial, text, timestamp, varchar, integer } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const registrations = pgTable("registrations", {
  id: serial("id").primaryKey(),
  registrationId: varchar("registration_id", { length: 255 }).notNull().unique(),
  applicationType: varchar("application_type", { length: 50 }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  gender: varchar("gender", { length: 20 }).notNull(),
  registrationNo: varchar("registration_no", { length: 100 }).notNull(),
  course: varchar("course", { length: 255 }).notNull(),
  age: varchar("age", { length: 10 }).notNull(),
  instagramId: varchar("instagram_id", { length: 100 }),
  mobileNo: varchar("mobile_no", { length: 20 }).notNull(),
  whatsappNo: varchar("whatsapp_no", { length: 20 }).notNull(),
  emailId: varchar("email_id", { length: 255 }).notNull(),
  religion: varchar("religion", { length: 100 }).notNull(),
  address: text("address").notNull(),
  skills: text("skills"), // JSON string
  otherSkills: text("other_skills"),
  eventExperience: text("event_experience"),
  justSocietyDefinition: text("just_society_definition"),
  communicationExample: text("communication_example"),
  aicufVision: text("aicuf_vision"),
  leadershipPosition: text("leadership_position"),
  additionalMessage: text("additional_message"),
  password: varchar("password", { length: 255 }),
  role: varchar("role", { length: 20 }).notNull().default("member"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
})

export const passkeyCredentials = pgTable('passkey_credentials', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => registrations.id),
  credentialId: varchar('credential_id', { length: 255 }).notNull(),
  publicKey: varchar('public_key', { length: 1024 }).notNull(),
  counter: integer('counter').notNull().default(0),
  transports: varchar('transports', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const nominations = pgTable("nominations", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  unitName: varchar("unit_name", { length: 255 }).notNull(),
  contestingFor: varchar("contesting_for", { length: 100 }).notNull(),
  educationQualification: text("education_qualification").notNull(),
  nocFilePath: varchar("noc_file_path", { length: 500 }).notNull(),
  nocFileName: varchar("noc_file_name", { length: 255 }).notNull(),
  status: varchar("status", { length: 20 }).notNull().default("pending"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
})

export const contacts = pgTable("contacts", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  subject: varchar("subject", { length: 500 }).notNull(),
  message: text("message").notNull(),
  status: varchar("status", { length: 20 }).notNull().default("unread"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
})

export const newsletters = pgTable("newsletters", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  subscribedAt: timestamp("subscribed_at").notNull().defaultNow(),
})

export const voters = pgTable("voters", {
  id: serial("id").primaryKey(),
  voterId: varchar("voter_id", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  designation: varchar("designation", { length: 255 }).notNull(),
  unitName: varchar("unit_name", { length: 255 }).notNull(),
  mobileNo: varchar("mobile_no", { length: 20 }).notNull(),
  passkey: varchar("passkey", { length: 255 }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
})

export const voterPasskeyCredentials = pgTable('voter_passkey_credentials', {
  id: serial('id').primaryKey(),
  voterId: integer('voter_id').references(() => voters.id),
  credentialId: varchar('credential_id', { length: 255 }).notNull(),
  publicKey: varchar('public_key', { length: 1024 }).notNull(),
  counter: integer('counter').notNull().default(0),
  transports: varchar('transports', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const votes = pgTable('votes', {
  id: serial('id').primaryKey(),
  voterId: integer('voter_id').references(() => voters.id),
  choice: text('choice').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})
