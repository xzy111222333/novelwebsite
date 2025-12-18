import { db } from './db'

/**
 * Recalculate and persist the aggregate statistics for a novel.
 * This ensures word count and chapter count stay accurate after
 * any chapter create/update/delete operation.
 */
export async function recalculateNovelStats(novelId: string) {
  const chapters = await db.chapter.findMany({
    where: { novelId },
    select: { wordCount: true },
  })

  const wordCount = chapters.reduce((total, chapter) => total + chapter.wordCount, 0)

  await db.novel.update({
    where: { id: novelId },
    data: {
      wordCount,
      chapterCount: chapters.length,
    },
  })
}

export function normaliseWordCount(content: string) {
  return content.replace(/\s+/g, '').length
}


