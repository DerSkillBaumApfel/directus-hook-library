import type { HookExtensionContext, RegisterFunctions } from "@directus/extensions";
import type { EventContext } from "@directus/types";
import { buildIllegalDeleteError } from "./shared/helper-functions";
import { M2AConfig } from "./shared/types";

/**
 * Creates a filter hook on configured anyCollection.\
 * On delete of anyCollection item, looks up if a junctionCollection item exists which contains a relation to the anyCollection item to be deleted.\
 * If a referencing item is found in junctionCollection, the delete request on anyCollection item is prevented.\
 * Otherwise, the requested item delete operation is executed on anyCollection.
 *
 * @param {RegisterFunctions} { filter } Directus hook register functions
 * @param {HookExtensionContext} { services, getSchema } Directus extension context
 * @param {M2AConfig} config Filter configuration options (contains watched collections)
 */
export const preventItemDeleteFilterM2A = (
    { filter }: RegisterFunctions,
    { services, getSchema }: HookExtensionContext,
    config: M2AConfig
) => {
    const { ItemsService } = services;

    // ? Register filter hooks on configured anyCollections (items.delete / blocking)
    for (const watchedCollection of config.anyCollections)
        filter(`${watchedCollection.collectionName}.items.delete`, handler);

    async function handler(
        itemDeleteKeys: unknown[],
        meta: Record<string, unknown>,
        context: EventContext
    ) {
        // ? For all anyCollection items to be deleted do:
        for (const itemKey of itemDeleteKeys) {
            // ? create ItemsService for junctionCollection possibly referencing anyCollection item to be deleted
            const junctionCollectionItemService = new ItemsService(config.junctionCollection.collectionName, {
                ...context,
                schema: await getSchema(),
            });

            // ? try to verify existence of junctionCollection item containing a relation to an anyCollection item by querying it
            const relatedItems = await junctionCollectionItemService.readByQuery({
                limit: -1,
                filter: {
                    _and: [
                        {
                            [config.junctionCollection.foreignKeyFieldName]: {
                                _eq: itemKey,
                            },
                        },
                        {
                            [config.junctionCollection.itemDiscriminatorFieldName]: {
                                _eq: meta["collection"],
                            },
                        },
                    ],
                },
                fields: [],
            });

            // ? if no anyCollection item being related is found, continue checking remaining configured junctionCollections
            if (!relatedItems.length)
                continue;

            // ? if a relation to an anyCollection item exists, prevent deletion
            throw new (buildIllegalDeleteError(String(meta["collection"]), config.junctionCollection.collectionName));
        }

        // ? if no relation to an item is found, allow delete of items
        return itemDeleteKeys;
    };
}

/**
 * Creates a filter hook on configured junctionCollection.\
 * On delete of junctionCollection item, looks up if the related anyCollection item exists.\
 * If the related item is found in anyCollection, the anyCollection item is deleted too (cascade).\
 *
 * @param {RegisterFunctions} { action } Directus hook register functions
 * @param {HookExtensionContext} { services, getSchema } Directus extension context
 * @param {M2AConfig} config Action configuration options (contains watched collections)
 */
export const deleteUnusedItemFilterM2A = (
    { filter }: RegisterFunctions,
    { services, getSchema }: HookExtensionContext,
    config: M2AConfig
) => {
    const { ItemsService } = services;

    // ? Register filter hooks on configured junctionCollections (items.delete / blocking)
    // ? This needs to be a filter (compared to "deleteUnusedRelationActionM2A"),
    // ? because data of junctionCollection item is nod passed in action and needs to be read manually BEFORE deleting it
    filter(`${config.junctionCollection.collectionName}.items.delete`, handler);

    async function handler(
        junctionItemDeleteKeys: unknown[],
        meta: Record<string, unknown>,
        context: EventContext) {
        // ? Create ItemsService for configured junctionCollection
        const junctionItemsService = new ItemsService(
            config.junctionCollection.collectionName,
            {
                ...context,
                schema: await getSchema(),
            }
        );

        for (const junctionItemKey of junctionItemDeleteKeys) {
            const junctionItem = await junctionItemsService.readOne(junctionItemKey);
            const anyItemsService = new ItemsService(
                junctionItem[config.junctionCollection.itemDiscriminatorFieldName],
                {
                    ...context,
                    schema: await getSchema(),
                }
            );

            await anyItemsService.deleteOne(junctionItem[config.junctionCollection.foreignKeyFieldName]);
        }

        return junctionItemDeleteKeys;
    }
};
