# Add-ons

Optional extras offered at step 3 of the booking wizard, and listed on the
Services page under each package.

## Prices are in cents

`priceCents: 9500` means **$95.00**. Whole numbers only. See the note in
`../packages/README.md` for why.

## Every price here is a PLACEHOLDER

Same convention as packages: a `// PLACEHOLDER` comment on the line, plus
`priceIsPlaceholder: true` on the add-on. While that flag is `true` the site
shows a visible marker next to the price. Set it to `false` once the number is
real and the marker goes away.

## Which packages show which add-on

That is controlled **from the package, not from here.** Each package file has an
`addonIds` array:

```js
// in packages/solo.js
addonIds: ['extra-hour', 'extra-vehicle', 'rolling-shots', 'second-location', 'rush', 'drone'],
```

So an add-on can exist in this file and appear on only some packages. Editing is
free — nothing breaks if an id is listed on one package and not another.

## Adding an add-on

1. Add an object to the `addons` array in `index.js`.
2. Give it a unique `id`.
3. Add that `id` to the `addonIds` array of every package that should offer it.

```js
{
  id: 'print-set',
  name: 'Print set',
  icon: 'Image03',              // any name from @untitled-ui/icons-react
  priceCents: 15000,
  priceIsPlaceholder: false,
  unit: 'flat',                 // shown after the price
  description: 'Six 12x18 prints of your picks, on matte stock.',
}
```

## Quantity add-ons

Add a `quantity` object and the client can pick how many, with the price
multiplying:

```js
quantity: { min: 1, max: 4, default: 1 },
```

"Extra hour" and "Additional vehicle" use this. Without a `quantity` block, the
add-on is a simple on/off toggle.

## Turning one off temporarily

Set `available: false`. It stays in the file and keeps its settings, but stops
appearing anywhere on the site. Cleaner than deleting it and retyping it later.

## The drone add-on — needs a decision

`drone` is currently `available: true`, but I do not know whether you actually
fly one, or whether you hold a Part 107 certificate. Commercial drone work in the
US requires it, and a lot of the airspace around Philadelphia is restricted.

**If you do not offer this, set `available: false`** and it disappears from the
site immediately. If you do, the `requiresConfirmation: true` flag on it means
the booking summary tells the client it is subject to airspace at the location
rather than promising it outright.
