import deleteUnusedM2OItems from "./lib/deleteUnusedM2OItems";
import replaceDeletedUserReferences from "./lib/replaceDeletedUserReferences";
import resetFieldsHiddenByOption from "./lib/resetFieldsHiddenByOption";
import setProjectSettingsFromEnvVars from "./lib/setProjectSettingsFromEnvVars";

export {
    //// M2O HOOKS //////////////////////////////////
    deleteUnusedM2OItems,

    //// UTIL HOOKS //////////////////////////////////
    replaceDeletedUserReferences,
    resetFieldsHiddenByOption,
    setProjectSettingsFromEnvVars,
};

//// M2A OPERATION TYPES //////////////////////////////////
export * from './lib/m2a/shared/types';

//// M2A HOOKS //////////////////////////////////
export * from "./lib/m2a/itemRelationCascade";
export * from "./lib/m2a/relationItemCascade";

    //// HELPERS //////////////////////////////////
export { toAnyCollectionM2A, toJunctionCollectionM2A } from "./lib/m2a/shared/helper-functions";
