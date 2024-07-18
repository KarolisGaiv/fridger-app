// import type {database} from "@server/database"
// import { fridgeContentRepository } from '@server/repositories/fridgeContentRepository';
// import {groceryListKeysAll, groceryListKeysPublic, type groceryListKeysPublic} from "@server/entities/groceryList"
// import { TRPCError } from '@trpc/server';

// export function fridgeContentService(db: Database) {
//     const frideContentRepo = fridgeContentRepository(db)

//     return {
//         async placeItemsIntoFridge(groceryListItems: [], user): Promise<void> {
//             try {
//                 await Promise.all(groceryListItems.map(async (item) => {
//                     // check if item already exist in the fridge
//                     const existingItem = await frideContentRepo.findByUserAndProduct(user, item.product)

//                     if (existingItem) {
//                         await frideContentRepo.updateQuantity(existingItem.id, existingItem.quantity + item.quantity)
//                     } else {
//                         await frideContentRepo.create({
//                             ingredientId: item.product,
//                             existingQuantity: item.quantity
//                         })
//                     }
//                 }))
//             } catch (error) {
//               throw new TRPCError({
//                 code: 'INTERNAL_ERROR',
//                 message: 'Failed to place items into fridge.',
//               });
//             }
//           },
//     }

// };
