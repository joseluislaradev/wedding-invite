// Example Configuration for Christian Wedding
// Copy relevant sections to your siteConfig.js file

export const christianWeddingExample = {
  // Set wedding type to Christian
  weddingType: "christian",

  // Christian wedding events - customize dates, times, and venues
  events: {
    title: "Join Us in Celebration",
    subtitle: "We invite you to share in our joy as we begin our journey together!",
    events: [
      {
        id: 1,
        name: "Rehearsal Dinner",
        date: "2025-06-20",
        time: "6:00 PM",
        venue: "Restaurant Name, City",
        mapEmbed: "https://www.google.com/maps/embed?pb=YOUR_MAP_EMBED_URL",
        dressCode: "Semi-formal",
        description: "Pre-wedding dinner with close family and friends",
        category: "pre-wedding",
      },
      {
        id: 2,
        name: "Wedding Ceremony",
        date: "2025-06-21",
        time: "3:00 PM",
        venue: "Church Name, City",
        mapEmbed: "https://www.google.com/maps/embed?pb=YOUR_MAP_EMBED_URL",
        dressCode: "Formal (church appropriate)",
        description: "Join us as we say 'I do' in the presence of God and our loved ones",
        category: "wedding",
      },
      {
        id: 3,
        name: "Cocktail Hour",
        date: "2025-06-21",
        time: "4:30 PM",
        venue: "Reception Venue, City",
        mapEmbed: "https://www.google.com/maps/embed?pb=YOUR_MAP_EMBED_URL",
        dressCode: "Semi-formal",
        description: "Post-ceremony cocktails and mingling",
        category: "wedding",
      },
      {
        id: 4,
        name: "Reception",
        date: "2025-06-21",
        time: "6:00 PM",
        venue: "Reception Venue, City",
        mapEmbed: "https://www.google.com/maps/embed?pb=YOUR_MAP_EMBED_URL",
        dressCode: "Formal",
        description: "Wedding reception with dinner and dancing",
        category: "post-wedding",
      },
      {
        id: 5,
        name: "After Party",
        date: "2025-06-21",
        time: "11:00 PM",
        venue: "Bar/Lounge Name, City",
        mapEmbed: "https://www.google.com/maps/embed?pb=YOUR_MAP_EMBED_URL",
        dressCode: "Casual",
        description: "Late night celebration for those who want to keep the party going!",
        category: "post-wedding",
      },
    ],
  },

  // Christian wedding milestones for timeline
  timeline: {
    title: "Our Journey",
    subtitle: "God's plan for our love story",
    items: [
      {
        date: "2020-01-15",
        title: "First Date",
        description: "Our first date at the coffee shop downtown",
      },
      {
        date: "2020-06-20",
        title: "Official",
        description: "We made it official!",
      },
      {
        date: "2021-06-20",
        title: "Moved In Together",
        description: "Started our life together in our first apartment",
      },
      {
        date: "2023-12-25",
        title: "Engagement",
        description: "He proposed on Christmas morning!",
      },
    ],
  },

  // FAQ tailored for Christian weddings
  faq: {
    title: "Frequently Asked Questions",
    subtitle: "Everything you need to know",
    questions: [
      {
        title: "What should I wear?",
        content: "Formal attire is requested for the ceremony and reception. Please avoid white. Church-appropriate attire is required for the ceremony.",
      },
      {
        title: "Can I bring a plus one?",
        content: "Please check your invitation for plus one details. If you have questions, feel free to reach out to us.",
      },
      {
        title: "Will there be parking?",
        content: "Yes, free parking is available at both the church and reception venue.",
      },
      {
        title: "What time should I arrive?",
        content: "Please arrive 15-30 minutes before the ceremony begins. The ceremony will start promptly at 3:00 PM.",
      },
      {
        title: "Are children welcome?",
        content: "While we love your little ones, this will be an adults-only celebration. We appreciate your understanding.",
      },
      {
        title: "Will there be a bar?",
        content: "Yes, there will be an open bar at the reception. Please drink responsibly.",
      },
      {
        title: "What about dietary restrictions?",
        content: "Please let us know about any dietary restrictions when you RSVP. We'll make sure there are options for everyone.",
      },
    ],
  },

  // Registry suggestions for Christian weddings
  registry: {
    title: "Wedding Registry",
    subtitle: "Your presence is the greatest gift, but if you'd like to honor us...",
    registries: [
      {
        name: "Amazon",
        url: "https://www.amazon.com/wedding-registry",
        description: "Our Amazon registry",
      },
      {
        name: "Bed Bath & Beyond",
        url: "https://www.bedbathandbeyond.com/wedding-registry",
        description: "Home essentials registry",
      },
    ],
    cashFunds: [
      {
        name: "Honeymoon Fund",
        description: "Help us create unforgettable memories on our honeymoon",
        url: "https://example.com/honeymoon-fund",
      },
      {
        name: "Home Fund",
        description: "Help us start our new home together",
        url: "https://example.com/home-fund",
      },
    ],
    thankYouMessage: "Thank you for your generous gifts and for celebrating with us!",
  },
};

