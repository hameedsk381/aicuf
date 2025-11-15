export const siteConfig = {
  name: process.env.NEXT_PUBLIC_SITE_NAME || "APTSAICUF",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://aptsaicuf.com",
  description: "Empowering Catholic students in Andhra Pradesh and Telangana to be agents of social change through faith, justice, and leadership since 1924.",
  
  social: {
    instagram: process.env.NEXT_PUBLIC_SOCIAL_INSTAGRAM || "https://instagram.com/aptsaicuf",
    facebook: process.env.NEXT_PUBLIC_SOCIAL_FACEBOOK || "https://facebook.com/aptsaicuf",
  },
  
  contact: {
    email: process.env.NEXT_PUBLIC_CONTACT_EMAIL || "info@aptsaicuf.com",
    phone: process.env.NEXT_PUBLIC_CONTACT_PHONE || "+91 XXX XXX XXXX",
  },
  
  analytics: {
    googleId: process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID,
  },
  
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION_CODE,
  },
}
