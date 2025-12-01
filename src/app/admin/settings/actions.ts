'use server'

import { revalidatePath } from "next/cache";

export async function clearCache() {
    // This revalidates all data associated with the root layout,
    // effectively clearing the cache for the entire site.
    revalidatePath('/', 'layout');
}
