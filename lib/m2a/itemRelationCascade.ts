import { HookExtensionContext, RegisterFunctions } from "@directus/extensions";
import { EventContext } from "@directus/types";
import { buildIllegalDeleteError } from "./shared/helper-functions";
import { M2AConfig } from "./shared/types";

/**
 * Creates a filter hook on configured junctionCollection.\
 * On delete of junctionCollection item, looks up if related item still exist in any of the configured anyCollections.\
 * If an existing item is found in anyCollections, delete operation is prevented.\
 * Otherwise, the requested item delete operation is executed on junctionCollection.
 *
 * @param {RegisterFunctions} { filter } Directus hook register functions
 * @param {HookExtensionContext} { services, getSchema } Directus extension context
 * @param {M2AConfig} config Filter configuration options (contains watched collections)
 */
export const preventRelationDeleteFilterM2A = (
    { filter }: RegisterFunctions,
    { services, getSchema }: HookExtensionContext,
    config: M2AConfig
) => {
    const { ItemsService } = services;

    // ? Register filter hook on configured junctionCollection (items.delete / blocking)
    filter(`${config.junctionCollection.collectionName}.items.delete`, handler);

    async function handler(
        junctionDeleteKeys: unknown[],
        meta: Record<string, unknown>,
        context: EventContext
    ) {
        // ? For all junctionCollection items to be deleted do:
        for (const junctionTableKey of junctionDeleteKeys) {

            // ? create ItemsService for watched junctionCollection
            const junctionItemService = new ItemsService(meta["collection"], {
                ...context,
                schema: await getSchema(),
            });

            // ? read content of junctionCollection item that triggered delete event
            const junctionItemContent = await junctionItemService.readOne(junctionTableKey);

            // ? search in configuration if prevention of related anyCollection deletes is configured
            const relatedCollection = config.anyCollections.find(
                collectionConfig => collectionConfig.collectionName === junctionItemContent[config.junctionCollection.itemDiscriminatorFieldName]
            );

            // ? if prevention is not configured for related anyCollection,
            // ? allow deletion of junctionCollection item without further checks
            if (!relatedCollection)
                continue;

            // ? create ItemsService for related anyCollection
            const relatedItemService = new ItemsService(relatedCollection.collectionName, {
                ...context,
                schema: await getSchema(),
            });

            // ? try to verify existence of related anyCollection item by reading it
            const relatedItems = await relatedItemService.readByQuery({
                limit: -1,
                filter: {
                    [relatedCollection.primaryKeyFieldName]: {
                        _eq: junctionItemContent[config.junctionCollection.foreignKeyFieldName],
                    },
                }
            });

            // ? if related anyCollection item does not exist, allow deletion of junctionCollection item
            if (!relatedItems.length)
                continue;

            // ? if junctionCollection item is configured for delete prevention and related anyCollection item exists,
            // ? prevent deletion by throwing an error
            throw new (buildIllegalDeleteError(config.junctionCollection.collectionName, relatedCollection.collectionName));
        }

        return junctionDeleteKeys;
    }
};

/**
 * Creates an action hook on configured anyCollections.\
 * On delete of anyCollection item, looks up if a junctionCollection item exists which contains a relation to the deleted anyCollection item.\
 * If a referencing item is found in junctionCollection, the junctionCollection item is deleted too (cascade).\
 *
 * @param {RegisterFunctions} { action } Directus hook register functions
 * @param {HookExtensionContext} { services, getSchema } Directus extension context
 * @param {M2AConfig} config Action configuration options (contains watched collections)
 */
export const deleteUnusedRelationActionM2A = (
    { action }: RegisterFunctions,
    { services, getSchema }: HookExtensionContext,
    config: M2AConfig
) => {
    const { ItemsService } = services;

    // ? Register action hooks on configured anyCollections (items.delete / non-blocking)
    for (const watchedCollection of config.anyCollections)
        action(`${watchedCollection.collectionName}.items.delete`, handler);

    async function handler(
        meta: Record<string, unknown>,
        context: EventContext
    ) {
        // ? Create ItemsService for configured junctionCollection
        const junctionItemsService = new ItemsService(
            config.junctionCollection.collectionName,
            {
                ...context,
                schema: await getSchema(),
            }
        );

        // ? Delete junctionCollection items, filtered by anyCollection discriminator provided by action trigger
        await junctionItemsService.deleteByQuery({
            limit: -1,
            filter: {
                _and: [
                    {
                        [config.junctionCollection.itemDiscriminatorFieldName]: {
                            _eq: meta["collection"],
                        },
                    },
                    {
                        [config.junctionCollection.foreignKeyFieldName]: {
                            _in: meta["keys"],
                        },
                    },
                ],
            }
        });
    }
};