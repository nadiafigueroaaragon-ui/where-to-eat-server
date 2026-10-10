export type Option = { value: string; label: string }

export type Filters = {
  search: string
  rating: string
  walkMinutes: string
  priceLevel: string
  sort: string
  cuisine: string
  diningType: string
}

export const emptyFilters: Filters = {
  search: '',
  rating: '',
  walkMinutes: '',
  priceLevel: '',
  sort: '',
  cuisine: '',
  diningType: '',
}

const same = (list: string[]): Option[] => list.map((v) => ({ value: v, label: v }))

// Same order as the Figma design. Values must match config/constants.js on the server.
export const CHIPS: { key: keyof Filters; label: string; options: Option[] }[] = [
  {
    key: 'rating',
    label: 'Ratings',
    options: [
      { value: '4', label: '4.0 and up' },
      { value: '4.5', label: '4.5 and up' },
    ],
  },
  {
    key: 'walkMinutes',
    label: 'Distance',
    options: [
      { value: '5', label: '5 min walk' },
      { value: '10', label: '10 min walk' },
      { value: '15', label: '15 min walk' },
    ],
  },
  { key: 'priceLevel', label: 'Prices', options: same(['cheap', 'moderate', 'expensive']) },
  {
    key: 'sort',
    label: 'Reviews',
    options: [
      { value: 'reviews', label: 'Most reviewed' },
      { value: 'rating', label: 'Top rated' },
    ],
  },
  {
    key: 'cuisine',
    label: 'Cuisines',
    options: same(['Kapampangan/Filipino', 'Asian', 'Western/Italian', 'Mexican', 'Mediterranean', 'Cafe/Bakery']),
  },
  {
    key: 'diningType',
    label: 'Dining style',
    options: same(['fine dining', 'casual dining', 'buffet', 'cafe/bakery', 'resto bar']),
  },
]