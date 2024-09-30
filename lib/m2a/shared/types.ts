export type JunctionCollection = {
    collectionName: string;
    foreignKeyFieldName: string;
    itemDiscriminatorFieldName: string;
};

export type AnyCollection = {
    collectionName: string;
    primaryKeyFieldName: string;
};

export type PreventRelationDeleteConfig = {
    watchedAnyCollections: AnyCollection[];
    junctionCollection: JunctionCollection;
};

export type PreventItemDeleteConfig = {
    /** collections which items should not be deleted, if they are related to a junctionCollection */
    anyCollection: AnyCollection;
    /** collections to search in */
    watchedJunctionCollections: JunctionCollection[];
};

export type UnusedRelationDeleteConfig = {
    junctionCollection: JunctionCollection;
    watchedAnyCollections: AnyCollection[];
};

export type UnusedItemDeleteConfig = {
    /** collections to search in */
    watchedJunctionCollections: JunctionCollection[];
    /** collections that potentially have unused items */
    anyCollection: AnyCollection;
};