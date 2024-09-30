import { createError } from "@directus/errors";
import { AnyCollection, JunctionCollection } from "./types";

/** Maps collection names to to objects of type JunctionCollection.\
 * Uses default directus settings:\
 *  `foreignKeyFieldName` = `"item"`\
 *  `foreignCollection` =`"collection"`  */
export const toJunctionCollectionM2A = (collectionName: string): JunctionCollection => ({
    collectionName,
    foreignKeyFieldName: "item",
    itemDiscriminatorFieldName: "collection",
});

/** Maps collection names to to objects of type AnyCollection.\
 * Uses default directus settings:\
 *  `primaryKeyFieldName` =`"id"`  */
export const toAnyCollectionM2A = (collectionName: string): AnyCollection => ({
    collectionName,
    primaryKeyFieldName: "id",
});

export const buildIllegalDeleteError = (watchedItemName: string, relatedItemName: string) => createError(
    "ILLEGAL_DELETE",
    `This “${watchedItemName}” item is related to existing “${relatedItemName}” and therefore cannot be deleted!`
);