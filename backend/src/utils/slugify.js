import slugifyLib from 'slugify';
import { Post } from '../models/post.model.js';

export const generateUniqueSlug = async (title, currentPostId = null) => {
  const baseSlug = slugifyLib(title, {
    lower: true,
    strict: true,
    trim: true,
    remove: /[*+~.()'"!:@]/g
  }) || 'post';

  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const query = { slug };
    if (currentPostId) {
      query._id = { $ne: currentPostId };
    }

    const existing = await Post.findOne(query).select('_id').lean();
    if (!existing) {
      return slug;
    }

    slug = `${baseSlug}-${counter}`;
    counter += 1;
  }
};
