import { getCollection, type CollectionEntry } from 'astro:content';

export type Post = CollectionEntry<'posts'>;

/**
 * Return only posts whose publication date has arrived, newest first.
 *
 * Keeping this rule in one place prevents scheduled stories from leaking into
 * post routes, archives, RSS, related links, or the generated sitemap before
 * they are meant to be public. A new production build publishes any stories
 * whose date has since arrived.
 */
export async function getAvailablePosts(now = new Date()): Promise<Post[]> {
  const cutoff = now.getTime();
  const posts = await getCollection('posts', ({ data }) => data.publishDate.getTime() <= cutoff);

  return posts.sort((a, b) => b.data.publishDate.getTime() - a.data.publishDate.getTime());
}

/** Indexable posts used in archives, feeds, internal links, and discovery. */
export async function getPublishedPosts(now = new Date()): Promise<Post[]> {
  return (await getAvailablePosts(now)).filter((post) => !post.data.noindex);
}
