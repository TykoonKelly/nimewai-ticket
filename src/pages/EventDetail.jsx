// src/constants/eventData.js
import WheezfitPoster from '../images/EventPosters/WheezfitPoster.JPG.jpeg';


export const ALL_EVENTS = [
  {
    id: 3,
    title: "Wheezfit Dance Fitness",
    category: "Fitness",
    date: "Every Saturday",
    time: "9:00-10:30AM",
    venue: "AV Fitness",
    city: "Mbaazi Rd",
    price: 1000,
    priceDisplay: "KES 1,000",
    tag: "Weekly",
    gradient: "from-green-400 via-emerald-500 to-teal-400",
    poster: WheezfitPoster
  },
  {
    id: 1,
    title: "Park & Chill 2026",
    category: "Entertainment",
    date: "July 25, 2026",
    time: "2:00 PM",
    venue: "AV Fitness",
    city: "Mbaazi Rd",
    price: 1500,
    priceDisplay: "KES 1,500",
    tag: "Trending",
    gradient: "from-purple-600 via-purple-500 to-pink-500",
    //poster: 
  },
  {
    id: 2,
    title: "Side Quest Picnic",
    category: "HangOut",
    date: "July 19, 2026",
    time: "1:00 PM",
    venue: "Tigoni",
    city: "Limuru",
    price: 400,
    priceDisplay: "KES 400",
    tag: "Almost Sold Out",
    gradient: "from-blue-500 via-cyan-500 to-teal-400",
    //poster: 
  },
];

export const CATEGORIES = ["All", "Entertainment", "HangOut", "Fitness", "Dance Classes", "Zumba Sessions", "Corporate Events"];
export const CITIES = ["All Cities", "Nairobi", "Eldoret", "Thika", "Kisumu", "Mbaazi Rd", "Limuru"];