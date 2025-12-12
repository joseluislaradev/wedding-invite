// Minimal Configuration Example
// Use this if you want a simple wedding website with only essential features
// Copy relevant sections to your siteConfig.js file

export const minimalExample = {
  // Set wedding type to custom for minimal setup
  weddingType: "custom",

  // Minimal feature set - only essential features enabled
  features: {
    homepage: { enabled: true, label: "Home" },
    ourStory: { enabled: true, label: "Our Story" },
    events: { enabled: true, label: "Events & RSVP" },
    photoGallery: { enabled: false, label: "Photo Gallery" },
    uploadPhotos: { enabled: false, label: "Upload Photos" },
    blessings: { enabled: true, label: "Blessings" },
    weddingParty: { enabled: false, label: "Wedding Party" },
    registry: { enabled: false, label: "Registry" },
    travel: { enabled: false, label: "Travel & Accommodation" },
    faq: { enabled: false, label: "FAQ" },
    timeline: { enabled: false, label: "Timeline" },
  },

  // Minimal events - just ceremony and reception
  events: {
    title: "Join Us",
    subtitle: "We'd love to celebrate with you!",
    events: [
      {
        id: 1,
        name: "Wedding Ceremony",
        date: "2025-06-21",
        time: "3:00 PM",
        venue: "Venue Name, City",
        mapEmbed: "https://www.google.com/maps/embed?pb=YOUR_MAP_EMBED_URL",
        description: "Join us as we say 'I do'",
      },
      {
        id: 2,
        name: "Reception",
        date: "2025-06-21",
        time: "6:00 PM",
        venue: "Reception Venue, City",
        mapEmbed: "https://www.google.com/maps/embed?pb=YOUR_MAP_EMBED_URL",
        description: "Celebration with dinner and dancing",
      },
    ],
  },

  // Simplified homepage
  homepage: {
    title: "We're Getting Married!",
    subtitle: "Join us for our special day",
    ctaButton: "RSVP",
    showCountdown: true,
  },

  // Minimal story section
  ourStory: {
    partner1Story: {
      name: "Partner 1",
      image: "/images/partner1.svg",
      story: "Share your story here.",
    },
    partner2Story: {
      name: "Partner 2",
      image: "/images/partner2.svg",
      story: "Share your story here.",
    },
    howWeMet: {
      enabled: false,
    },
    proposal: {
      enabled: false,
    },
    memories: {
      intro: "A few special moments.",
      images: [],
    },
    milestones: [],
  },

  // Simple blessings
  blessings: {
    title: "Leave Us a Message",
    subtitle: "We'd love to hear from you!",
    showAllBlessings: false,
    enableSearch: false,
  },
};

