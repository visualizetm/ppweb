# FAQs

One array, one object per question. The FAQ page and the homepage both read from
here.

## Adding a question

Add an object to the `faqs` array in `index.js`:

```js
{
  id: 'do-you-travel',                  // unique, lowercase, hyphens
  question: 'Do you travel outside PA?',
  category: 'Logistics',                // groups it on the FAQ page
  answer: [
    'First paragraph.',
    'Second paragraph.',
  ],
}
```

`answer` is an **array of paragraphs**, not one long string. Each entry becomes
its own paragraph. This is why the answers on the site have breathing room
instead of arriving as a wall of text.

A new `category` value automatically becomes a new group on the FAQ page — you do
not need to register it anywhere.

## `homepage: true`

Setting `homepage: true` on a question pulls it out into its own full section on
the home page, with more room and bigger type.

**Only one question should have this flag at a time.** Right now it is on
"How many photos come with a standard session?" — that question gets asked more
than any other and the answer is worth reading, so it earns the space.

The question still appears in the full FAQ list as well.

## Order

Array order is display order within each category. The most-asked question should
be near the top.
