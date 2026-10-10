import { getCollection, type CollectionEntry } from 'astro:content';

export type Post = CollectionEntry<'posts'>;

/** Return every post, newest first. */
export async function getAvailablePosts(): Promise<Post[]> {
  const posts = await getCollection('posts');
  return posts.sort((a, b) => b.data.publishDate.getTime() - a.data.publishDate.getTime());
}

/** All posts used in archives, feeds, internal links, and discovery. */
export async function getPublishedPosts(): Promise<Post[]> {
  return getAvailablePosts();
}

/** Posts that search engines and syndication feeds may safely discover. */
export async function getIndexablePosts(now = new Date()): Promise<Post[]> {
  const cutoff = now.getTime();
  return (await getAvailablePosts()).filter(
    (post) => !post.data.noindex && post.data.publishDate.getTime() <= cutoff
  );
}
