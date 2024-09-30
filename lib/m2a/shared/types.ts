type JunctionCollection = {
    name: string;
    foreignKey: string;
    foreignCollection: string;
};

type AnyCollection = {
    name: string;
    key: string;
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