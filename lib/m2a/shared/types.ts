export type JunctionCollection = {
    collectionName: string;
    foreignKeyFieldName: string;
    itemDiscriminatorFieldName: string;
};

export type AnyCollection = {
    collectionName: string;
    primaryKeyFieldName: string;
};

export type M2AConfig = {
    anyCollections: AnyCollection[];
    junctionCollection: JunctionCollection;
};

// export type PreventItemDeleteConfig = {
//     /** collections which items should not be deleted, if they are related to a junctionCollection */
//     anyCollection: AnyCollection;
//     /** collections to search in */
//     watchedJunctionCollections: JunctionCollection[];
// };

// export type DeleteUnusedConfig = {
//     junctionCollection: JunctionCollection;
//     anyCollections: AnyCollection[];
// };

// export type DeleteUnusedConfig = {
//     /** collections to search in */
//     watchedJunctionCollections: JunctionCollection[];
//     /** collections that potentially have unused items */
//     anyCollection: AnyCollection;
// };