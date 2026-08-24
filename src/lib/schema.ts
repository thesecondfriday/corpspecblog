/*
 * JSON-LD builders — the "Structured data map" from the prototype's spec tab.
 * Inline microdata lives on the components themselves; these are the matching
 * head blocks.
 *
 *   Post page          BlogPosting     headline, description, datePublished,
 *                                      dateModified, timeRequired, wordCount,
 *                                      articleSection, keywords, author,
 *                                      publisher, mainEntityOfPage
 *   FAQ                FAQPage · Question · Answer
 *   Breadcrumb         BreadcrumbList
 *   TOC                SiteNavigationElement (inline, see TableOfContents)
 */

import type { FaqItem, Post } from "./types";
import { SITE, absolute, authorHref, categoryHref, postHref } from "./site";
import { countWords, getReadTime } from "./derive";

export function blogPostingSchema(post: Post) {
  const readTime = getReadTime(post);
  const url = absolute(postHref(post.category.slug, post.slug));

  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.seo?.metaDescription ?? post.dek,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt ?? post.publishedAt,
    wordCount: countWords(post.body),
    ...(readTime ? { timeRequired: `PT${readTime}M` } : {}),
    articleSection: post.category.title,
    ...(post.tags?.length ? { keywords: post.tags.map((t) => t.title).join(", ") } : {}),
    ...(post.heroImage
      ? {
          image: {
            "@type": "ImageObject",
            contentUrl: absolute(post.heroImage.src),
            ...(post.heroImage.caption ? { caption: post.heroImage.caption } : {}),
          },
        }
      : {}),
    author: {
      "@type": "Person",
      name: post.author.name,
      ...(post.author.role ? { jobTitle: post.author.role } : {}),
      url: absolute(authorHref(post.author.slug)),
    },
    publisher: {
      "@type": "Organization",
      name: SITE.organisation,
      url: SITE.origin,
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
  };
}

export function faqPageSchema(items: FaqItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer.join(" ") },
    })),
  };
}

export function breadcrumbSchema(post: Post) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Blog", item: absolute(SITE.blogBase) },
      {
        "@type": "ListItem",
        position: 2,
        name: post.category.title,
        item: absolute(categoryHref(post.category.slug)),
      },
      { "@type": "ListItem", position: 3, name: post.title },
    ],
  };
}
