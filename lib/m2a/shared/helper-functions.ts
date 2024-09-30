import { createError } from "@directus/errors";

/** maps the array elements to objects of type JunctionCollection with a default `foreignKey` field of `“item”` and a default `foreignCollection` field of `“collection”`  */
export const toJunctionCollectionM2A = (collectionName: string): JunctionCollection => ({
    collectionName,
    foreignKeyFieldName: "item",
    itemDiscriminatorFieldName: "collection",
});

/** maps the array elements to objects of type AnyCollection with a default `key` field of `“id”`  */
export const toAnyCollectionM2A = (collectionName: string): AnyCollection => ({
    collectionName,
    primaryKeyFieldName: "id",
});

export const buildIllegalDeleteError = (watchedItemName: string, relatedItemName: string) => createError(
    "ILLEGAL_DELETE",
    `This “${watchedItemName}” item is related to existing “${relatedItemName}” and therefore cannot be deleted!`
);