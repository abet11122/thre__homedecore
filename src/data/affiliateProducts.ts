export interface AffiliateProduct {
  asin: string;
  brand: string;
  name: string;
  variant: string;
  details: string;
  href: string;
}

const products = {
  bathroomUnderSink: {
    asin: 'B0CDZTJ1PW',
    brand: 'Delamu',
    name: '2 Sets of 3-Tier Bathroom Under Sink Organizers',
    variant: 'Clear · 2 sets',
    details: 'Stackable pull-out organizers with movable dividers for working around plumbing and separating small essentials.',
    href: 'https://amzn.to/4yTJMfE',
  },
  bakersRackRustic: {
    asin: 'B0GCNMGPBL',
    brand: '3IngSeagulls',
    name: '4-Tier Bakers Rack with Storage',
    variant: 'Rustic brown · 4-tier',
    details: 'A microwave stand and coffee station with an adjustable shelf and six hooks for spices, pans, and everyday kitchen tools.',
    href: 'https://amzn.to/4AyEvMb',
  },
  bakersRackCompact: {
    asin: 'B0FLX9BL7B',
    brand: 'Huuger',
    name: '4-Tier Bakers Rack with Reversible Power Outlet',
    variant: 'Rustic brown · 23.6 in',
    details: 'A compact four-tier microwave stand and coffee bar with a reversible outlet, top shelf, and six hooks.',
    href: 'https://amzn.to/4xM4Kfq',
  },
  bakersRackWide: {
    asin: 'B0FQNFF679',
    brand: 'Huuger',
    name: '4-Tier Bakers Rack with Reversible Power Outlet',
    variant: 'Rustic brown · 31.5 in',
    details: 'A wider four-tier microwave stand and coffee bar with a reversible outlet, top shelf, and six hooks.',
    href: 'https://amzn.to/4ydcyI9',
  },
  bakersRackGrey: {
    asin: 'B0FQN6NZVR',
    brand: 'Huuger',
    name: '4-Tier Bakers Rack with Reversible Power Outlet',
    variant: 'Grey · 31.5 in',
    details: 'A wider grey four-tier microwave stand and coffee bar with a reversible outlet, top shelf, and six hooks.',
    href: 'https://amzn.to/4AzKLmL',
  },
  sinkCaddy: {
    asin: 'B0CJ4WZXQF',
    brand: 'Cisily',
    name: 'Sink Caddy Sponge Holder with Self-Drain Tray',
    variant: 'Stainless steel',
    details: 'A rust-resistant sink organizer with a brush holder and draining tray for sponges, soap, and cleaning accessories.',
    href: 'https://amzn.to/46NCQoo',
  },
  kitchenRunner: {
    asin: 'B0F7M345L2',
    brand: 'DUIDY',
    name: 'Washable Kitchen Runner Rug',
    variant: 'Boho dark green · 2 × 6 ft',
    details: 'A low-pile, non-slip, stain-resistant runner sized for a kitchen walkway, with a vintage-inspired finish.',
    href: 'https://amzn.to/4z3tQHW',
  },
  daisyDecals: {
    asin: 'B0CRL2FWLH',
    brand: 'TaoBary',
    name: '12 Sheet Daisy Wall Sticker Decals',
    variant: 'Pink and white · 12 sheets',
    details: 'Large removable peel-and-stick floral decals for a nursery, bedroom, or an easy-to-change accent wall.',
    href: 'https://amzn.to/4z0kX1N',
  },
  sageWallpaper: {
    asin: 'B0FXXM8MBV',
    brand: 'Akodm',
    name: 'Sage Green Floral Peel and Stick Wallpaper',
    variant: '17.7 × 70.8 in',
    details: 'Thick removable watercolor-floral wallpaper for a sage-green accent on a smooth wall or other smooth surface.',
    href: 'https://amzn.to/4rzHhgd',
  },
  vintageWallpaper: {
    asin: 'B0CX1DCVPN',
    brand: 'Laatse',
    name: 'Vintage Floral Peel and Stick Wallpaper',
    variant: 'Gold and black · 17.5 × 393 in',
    details: 'Waterproof removable vinyl contact paper with a vintage floral pattern for bathroom cabinets, shelves, drawers, or walls.',
    href: 'https://amzn.to/4heMq9U',
  },
  slatWall: {
    asin: 'B0FDLCG4H8',
    brand: 'YU LI 3DH',
    name: 'Peel and Stick PVC Slat Wall Panel',
    variant: 'Faux oak wood grain · 236 × 15.75 in',
    details: 'A self-adhesive faux-wood slat panel for building a warm oak-style feature wall or ceiling detail.',
    href: 'https://amzn.to/4z4e2EU',
  },
} satisfies Record<string, AffiliateProduct>;

export const productRecommendations: Record<string, AffiliateProduct[]> = {
  'under-bathroom-sink-organization-ideas': [products.bathroomUnderSink],
  'small-kitchen-storage-ideas': [
    products.bakersRackRustic,
    products.bakersRackCompact,
    products.bakersRackWide,
    products.bakersRackGrey,
  ],
  'under-kitchen-sink-organization-ideas': [products.sinkCaddy],
  'kitchen-flooring-ideas-with-oak-cabinets': [products.kitchenRunner],
  'little-girls-bedroom-ideas': [products.daisyDecals],
  'green-bathroom-ideas': [products.sageWallpaper],
  'renter-friendly-bathroom-ideas': [products.vintageWallpaper],
  'how-to-decorate-around-a-tv': [products.slatWall],
};

/*
 * Every post in a matching category receives a small, useful shopping edit.
 * A post-specific match above wins when its topic calls for a tighter choice.
 */
const categoryRecommendations: Record<string, AffiliateProduct[]> = {
  bathroom: [products.bathroomUnderSink, products.vintageWallpaper],
  kitchen: [products.bakersRackCompact, products.sinkCaddy],
  bedroom: [products.daisyDecals, products.sageWallpaper],
  'living-room': [products.slatWall],
  renter: [products.sageWallpaper, products.vintageWallpaper],
  'diy-decor': [products.daisyDecals, products.slatWall],
  'small-spaces': [products.bakersRackCompact, products.bathroomUnderSink],
  'organization-storage': [products.bathroomUnderSink, products.bakersRackCompact, products.sinkCaddy],
  entryway: [products.kitchenRunner],
  'laundry-mudroom': [products.kitchenRunner],
  'dorm-college': [products.daisyDecals, products.bakersRackCompact],
};

export function recommendationsForPost(postId: string, category: string): AffiliateProduct[] {
  return (
    productRecommendations[postId.replace(/\.md$/, '')] ??
    categoryRecommendations[category] ??
    []
  );
}
