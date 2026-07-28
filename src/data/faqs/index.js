/* ===========================================================================
   FAQs
   ---------------------------------------------------------------------------
   All six of these came off the previous site. They have been lightly edited
   for grammar — the original had "flexable" — but every commitment Michael made
   in them is intact and the voice is his, not rewritten into marketing copy.

   The exception is `how-to-book`, which had to change: it described the old
   Typeform scheduling link, which no longer exists.

   `homepage: true` promotes an answer out of this list into its own section on
   the home page.
   =========================================================================== */

export const faqs = [
  {
    id: 'how-many-photos',
    question: 'How many photos come with a standard session?',
    /* Promoted to a full homepage section. It is the question every customer
       asks, and his answer is genuinely good — burying it here wastes it. */
    homepage: true,
    category: 'The work',
    answer: [
      'There is no guaranteed number, and I will not pretend otherwise.',
      'Every project creates its own opportunities. A location opens up that I did not expect, the light does something worth chasing, a detail on the car turns into three frames. Committing to a number in advance means either padding the count with photos that are not worth delivering, or stopping when I hit it while there are still shots left on the table.',
      'What I will commit to is this: I show up looking for every possible shot, and everything I deliver is fully edited and worth having.',
    ],
  },
  {
    id: 'session-length',
    question: 'How long does a typical photo shoot last?',
    category: 'Logistics',
    answer: [
      'Each booking lists a time, and that is the honest estimate for what is planned.',
      'But I am flexible with it. If we are close to something good when the clock runs out, I would rather run over than leave with a worse set of photos. The time on the booking is a plan, not a limit.',
    ],
  },
  {
    id: 'multiple-cars',
    question: 'Can I book multiple cars in one session?',
    category: 'Logistics',
    answer: [
      'Yes.',
      'Every booking starts with a meeting anyway, and that is exactly where this gets worked out — how many cars, how many people, which locations, and how much time it will realistically take. Bring the whole group if you want; we will plan around it.',
    ],
  },
  {
    id: 'editing-only',
    question: 'Do you offer editing and retouching of photos you did not take?',
    category: 'The work',
    answer: [
      'Yes, and it is a real part of what I do rather than a favour.',
      'Everything I publish is edited — that work is a large part of why the photos look the way they do. If you have your own shots of your car, send them over and they get exactly the same treatment. You do not need to have booked a shoot with me.',
    ],
  },
  {
    id: 'how-to-book',
    question: 'How do I schedule my session?',
    category: 'Booking',
    /* Rewritten — the old answer pointed at a Typeform scheduling link that has
       been retired. Everything else on this page is his original substance. */
    answer: [
      'Start on the booking page. There are two ways through it.',
      'If you are not sure exactly what you want — multiple cars, an event, a wedding, or anything custom — book a consultation. It is free, there is no card involved, and it is how most bookings start. We talk it through, work out what the shoot actually needs, and I quote it after that.',
      'If you already know what you want, you can book the session directly and pay a deposit to hold the date. That is the faster path, and it is there for people who have done this before.',
    ],
  },
  {
    id: 'automotive-only',
    question: 'Do you only do automotive photography?',
    category: 'The work',
    answer: [
      'No. Automotive is the bulk of it, not the limit of it.',
      'I have portrait, wedding and event experience as well. That work is not all on this site yet — reach out and I will show you the relevant set.',
    ],
  },
];

export const getFaq = (id) => faqs.find((f) => f.id === id);

/** The one promoted to its own homepage section. */
export const homepageFaq = faqs.find((f) => f.homepage);

/** Everything except the promoted one — the FAQ page still shows all six. */
export const faqCategories = [...new Set(faqs.map((f) => f.category))];

export default faqs;
