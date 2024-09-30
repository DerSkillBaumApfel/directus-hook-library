type JunctionCollection = {
    collectionName: string;
    foreignKeyFieldName: string;
    itemDiscriminatorFieldName: string;
};

type AnyCollection = {
    collectionName: string;
    primaryKeyFieldName: string;
};

type PreventRelationDeleteConfig = {
    watchedAnyCollections: AnyCollection[];
    junctionCollection: JunctionCollection;
};

type PreventItemDeleteConfig = {
    /** collections which items should not be deleted, if they are related to a junctionCollection */
    anyCollection: AnyCollection;
    /** collections to search in */
    watchedJunctionCollections: JunctionCollection[];
};

type UnusedRelationDeleteConfig = {
    junctionCollection: JunctionCollection;
    watchedAnyCollections: AnyCollection[];
};

type UnusedItemDeleteConfig = {
    /** collections to search in */
    watchedJunctionCollections: JunctionCollection[];
    /** collections that potentially have unused items */
    anyCollection: AnyCollection;
};