// src/data/events.js
export const ALL_EVENTS = [
  {
    id: 0,
    title: "Sauti Sol Live",
    category: "Entertainment",
    date: "July 25, 2026",
    time: "7:00 PM",
    venue: "KICC",
    city: "Nairobi",
    tag: "Trending",
    gradient: "from-purple-600 via-purple-500 to-pink-500",
    ticketLevels: [
      {
        name: "Regular",
        tiers: [
          { 
            name: "Early Bird", 
            price: 1500, 
            quantity: 200, 
            sold: 200,
            salesStart: "2026-09-01", 
            salesEnd: "2026-10-15"
          },
          { 
            name: "Advance", 
            price: 2000, 
            quantity: 300, 
            sold: 187,
            salesStart: "2026-10-15", 
            salesEnd: "2026-12-14"
          },
          { 
            name: "Gate", 
            price: 3000, 
            quantity: 500, 
            sold: 0,
            salesStart: "2026-12-15", 
            salesEnd: "2026-12-15"
          }
        ]
      },
      {
        name: "VIP",
        tiers: [
          { 
            name: "Early Bird", 
            price: 3000, 
            quantity: 50, 
            sold: 45,
            salesStart: "2026-09-01", 
            salesEnd: "2026-10-15"
          },
          { 
            name: "Advance", 
            price: 4000, 
            quantity: 100, 
            sold: 20,
            salesStart: "2026-10-15", 
            salesEnd: "2026-12-14"
          },
          { 
            name: "Gate", 
            price: 5000, 
            quantity: 150, 
            sold: 0,
            salesStart: "2026-12-15", 
            salesEnd: "2026-12-15"
          }
        ]
      },
      {
        name: "VVIP",
        tiers: [
          { 
            name: "Early Bird", 
            price: 5000, 
            quantity: 20, 
            sold: 20,
            salesStart: "2026-09-01", 
            salesEnd: "2026-10-15"
          },
          { 
            name: "Advance", 
            price: 7000, 
            quantity: 30, 
            sold: 0,
            salesStart: "2026-10-15", 
            salesEnd: "2026-12-14"
          }
        ]
      }
    ]
  },
  {
    id: 1,
    title: "Park & Chill 2026",
    category: "Entertainment",
    date: "August 8th, 2026",
    time: "9:00 AM",
    venue: "AV Fitness",
    city: "Mbaazi Rd",
    tag: "Upcoming",
    gradient: "from-blue-500 via-cyan-500 to-teal-400",
     description: "Join us for the ultimate park experience with live music, food trucks, and entertainment for the whole family. Park & Chill 2026 brings together the best of Nairobi's entertainment scene in a beautiful outdoor setting.",
    organizer: {
      name: "AV Entertainment",
      email: "info@aventertainment.com",
      phone: "+254 700 000 000",
      website: "https://aventertainment.com"
    },
    venueDetails: "Main entrance on Mbaazi Road, ample parking available",
    additionalInfo: "• Gates open at 1:00 PM\n• No outside food or drinks allowed\n• Children under 12 get free entry\n• Parking available for KES 200",
    ticketLevels: [
      {
        name: "General",
        tiers: [
          { 
            name: "Early Bird", 
            price: 1000, 
            quantity: 100, 
            sold: 100,
            salesStart: "2026-07-01", 
            salesEnd: "2026-07-20"
          },
          { 
            name: "Regular", 
            price: 1500, 
            quantity: 200, 
            sold: 120,
            salesStart: "2026-07-21", 
            salesEnd: "2026-07-29"
          }
        ]
      }
    ]
  },
  {
    id: 2,
    title: "Wheezfit Dance Fitness",
    category: "Fitness",
    date: "Every Saturday",
    time: "9:00-10:30AM",
    venue: "AV Fitness",
    city: "Mbaazi Rd",
    tag: "Weekly",
    gradient: "from-green-400 via-emerald-500 to-teal-400",
    ticketLevels: [
      {
        name: "Standard",
        tiers: [
          { 
            name: "Drop-in", 
            price: 1000, 
            quantity: 50, 
            sold: 0,
            salesStart: "2026-07-01", 
            salesEnd: "2026-12-31"
          },
          { 
            name: "Monthly", 
            price: 3000, 
            quantity: 100, 
            sold: 0,
            salesStart: "2026-07-01", 
            salesEnd: "2026-12-31"
          }
        ]
      }
    ]
  },
  {
    id: 3,
    title: "Side Quest Picnic",
    category: "HangOut",
    date: "July 19, 2026",
    time: "1:00 PM",
    venue: "Tigoni",
    city: "Limuru",
    tag: "Hot",
    gradient: "from-orange-500 via-red-500 to-pink-500",
    ticketLevels: [
      {
        name: "General",
        tiers: [
          { 
            name: "Early Bird", 
            price: 400, 
            quantity: 100, 
            sold: 100,
            salesStart: "2026-07-01", 
            salesEnd: "2026-07-10"
          },
          { 
            name: "Regular", 
            price: 600, 
            quantity: 150, 
            sold: 130,
            salesStart: "2026-07-11", 
            salesEnd: "2026-07-19"
          }
        ]
      }
    ]
  }
];