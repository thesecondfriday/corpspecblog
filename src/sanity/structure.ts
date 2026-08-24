import { DocumentTextIcon } from "@sanity/icons/DocumentText";
import { EditIcon } from "@sanity/icons/Edit";
import { PackageIcon } from "@sanity/icons/Package";
import { StarIcon } from "@sanity/icons/Star";
import { TagIcon } from "@sanity/icons/Tag";
import { TagsIcon } from "@sanity/icons/Tags";
import { UserIcon } from "@sanity/icons/User";
import { BookIcon } from "@sanity/icons/Book";
import type { StructureResolver } from "sanity/structure";

/*
 * Desk structure.
 *
 * The default document list would give five flat type lists and nothing else.
 * This groups the work the way an editor thinks about it: writing is the
 * default view, the shelves an editor rarely touches sit below a divider, and
 * the two lists that drive homepage placement (hero-eligible, guides) are
 * surfaced rather than buried behind a filter someone has to remember.
 *
 * There are no singletons in this dataset — every type is ordinary content —
 * so nothing needs excluding from the generic lists.
 */
export const structure: StructureResolver = (S) =>
  S.list()
    .title("The Swag Desk")
    .items([
      /* ---- Writing ------------------------------------------------------ */
      S.listItem()
        .title("Posts")
        .icon(DocumentTextIcon)
        .child(
          S.list()
            .title("Posts")
            .items([
              S.listItem()
                .title("All posts")
                .icon(DocumentTextIcon)
                .child(
                  S.documentTypeList("post")
                    .title("All posts")
                    .defaultOrdering([{ field: "publishedAt", direction: "desc" }]),
                ),

              // Anything with an unpublished draft, so work in progress is one
              // click away rather than something you scroll for.
              S.listItem()
                .title("Drafts")
                .icon(EditIcon)
                .child(
                  S.documentTypeList("post")
                    .title("Drafts")
                    .filter('_type == "post" && _id in path("drafts.**")')
                    .defaultOrdering([{ field: "_updatedAt", direction: "desc" }]),
                ),

              S.divider(),

              // The two flags that decide homepage placement.
              S.listItem()
                .title("Can headline the homepage")
                .icon(StarIcon)
                .child(
                  S.documentTypeList("post")
                    .title("Hero-eligible")
                    .filter('_type == "post" && featured == true')
                    .defaultOrdering([{ field: "publishedAt", direction: "desc" }]),
                ),

              S.listItem()
                .title("Evergreen guides")
                .icon(BookIcon)
                .child(
                  S.documentTypeList("post")
                    .title("Evergreen guides")
                    .filter('_type == "post" && isGuide == true')
                    .defaultOrdering([{ field: "updatedAt", direction: "desc" }]),
                ),

              S.divider(),

              // Browsing by category mirrors how the site itself is organised.
              S.listItem()
                .title("By category")
                .icon(TagsIcon)
                .child(
                  S.documentTypeList("category")
                    .title("By category")
                    .defaultOrdering([{ field: "order", direction: "asc" }])
                    .child((categoryId) =>
                      S.documentTypeList("post")
                        .title("Posts")
                        .filter('_type == "post" && category._ref == $categoryId')
                        .params({ categoryId })
                        .defaultOrdering([{ field: "publishedAt", direction: "desc" }])
                        // A post created from inside a category should already
                        // belong to it.
                        .initialValueTemplates([
                          S.initialValueTemplateItem("post-by-category", { categoryId }),
                        ]),
                    ),
                ),

              S.listItem()
                .title("By author")
                .icon(UserIcon)
                .child(
                  S.documentTypeList("author")
                    .title("By author")
                    .child((authorId) =>
                      S.documentTypeList("post")
                        .title("Posts")
                        .filter('_type == "post" && author._ref == $authorId')
                        .params({ authorId })
                        .defaultOrdering([{ field: "publishedAt", direction: "desc" }]),
                    ),
                ),
            ]),
        ),

      S.divider(),

      /* ---- The shelves -------------------------------------------------- */
      S.documentTypeListItem("author").title("Authors").icon(UserIcon),

      S.listItem()
        .title("Categories")
        .icon(TagsIcon)
        .child(
          S.documentTypeList("category")
            .title("Categories")
            // Menu order, not alphabetical — this list *is* the site nav.
            .defaultOrdering([{ field: "order", direction: "asc" }]),
        ),

      S.documentTypeListItem("tag").title("Tags").icon(TagIcon),
      S.documentTypeListItem("product").title("Products").icon(PackageIcon),
    ]);
