// // @types/tableTypes/productsTable.ts

// import { Knex } from 'knex';
// import { Product } from '../product';

// declare module 'knex/types/tables' {
//   // declare module 'knex/types/tables.js' {
//   interface Tables {
//     products: Product;
//     products_composite: Knex.CompositeTableType<
//       Product,
//       Pick<Product, 'name' | 'program' | 'genre'> &
//         Partial<Pick<Product, 'created_at' | 'updated_at'>>,
//       Partial<Omit<Product, 'id'>>
//     >;
//   }
// }
