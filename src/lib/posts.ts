import { getCollection, type CollectionEntry } from 'astro:content';
import { canPublish } from './contentPolicy.mjs';

export type Post = CollectionEntry<'posts'>;

/** Return every draft and published post, newest first. For editorial use only. */
export async function getAvailablePosts(): Promise<Post[]> {
  const posts = await getCollection('posts');
  return posts.sort((a, b) => b.data.publishDate.getTime() - a.data.publishDate.getTime());
}

/** Only reviewed posts whose publication date has arrived may be public. */
export async function getPublishedPosts(now = new Date()): Promise<Post[]> {
  const cutoff = now.getTime();
  return (await getAvailablePosts()).filter(
    (post) => canPublish(post.id) && !post.data.noindex && post.data.publishDate.getTime() <= cutoff
  );
}

export const getIndexablePosts = getPublishedPosts;
