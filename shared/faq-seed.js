/* ===========================================================================
   FAQ seed.
   ---------------------------------------------------------------------------
   The six answers as they existed in src/data/faqs before the admin took
   ownership of them. Written into siteContent on first boot. Frozen after
   that: the database is the source of truth from then on.
   =========================================================================== */

export const FAQ_SEED = [
  {
    "question": "How many photos come with a standard session?",
    "answer": [
      "There is no guaranteed number, and I will not pretend otherwise.",
      "Every project creates its own opportunities. A location opens up that I did not expect, the light does something worth chasing, a detail on the car turns into three frames. Committing to a number in advance means either padding the count with photos that are not worth delivering, or stopping when I hit it while there are still shots left on the table.",
      "What I will commit to is this: I show up looking for every possible shot, and everything I deliver is fully edited and worth having."
    ],
    "category": "The work",
    "homepage": true
  },
  {
    "question": "How long does a typical photo shoot last?",
    "answer": [
      "Each booking lists a time, and that is the honest estimate for what is planned.",
      "But I am flexible with it. If we are close to something good when the clock runs out, I would rather run over than leave with a worse set of photos. The time on the booking is a plan, not a limit."
    ],
    "category": "Logistics",
    "homepage": false
  },
  {
    "question": "Can I book multiple cars in one session?",
    "answer": [
      "Yes.",
      "Every booking starts with a meeting anyway, and that is exactly where this gets worked out — how many cars, how many people, which locations, and how much time it will realistically take. Bring the whole group if you want; we will plan around it."
    ],
    "category": "Logistics",
    "homepage": false
  },
  {
    "question": "Do you offer editing and retouching of photos you did not take?",
    "answer": [
      "Yes, and it is a real part of what I do rather than a favour.",
      "Everything I publish is edited — that work is a large part of why the photos look the way they do. If you have your own shots of your car, send them over and they get exactly the same treatment. You do not need to have booked a shoot with me."
    ],
    "category": "The work",
    "homepage": false
  },
  {
    "question": "How do I schedule my session?",
    "answer": [
      "Start on the booking page. There are two ways through it.",
      "If you are not sure exactly what you want — multiple cars, an event, a wedding, or anything custom — book a consultation. It is free, there is no card involved, and it is how most bookings start. We talk it through, work out what the shoot actually needs, and I quote it after that.",
      "If you already know what you want, you can book the session directly and pay a deposit to hold the date. That is the faster path, and it is there for people who have done this before."
    ],
    "category": "Booking",
    "homepage": false
  },
  {
    "question": "Do you only do automotive photography?",
    "answer": [
      "No. Automotive is the bulk of it, not the limit of it.",
      "I have portrait, wedding and event experience as well. That work is not all on this site yet — reach out and I will show you the relevant set."
    ],
    "category": "The work",
    "homepage": false
  }
];

export default FAQ_SEED;
