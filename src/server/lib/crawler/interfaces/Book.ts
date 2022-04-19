export interface IBookChunk {
  chapterName?: string;
  sectionName?: string;
  url?: string;
  createdAt?: Date;
  lines?: Array<string>;
}

export interface IBook {
  title?: string;
  authorName?: string;
  chunks?: Array<IBookChunk> | null;
  numBookChunks?: number;
  url?: string;
  createdAt?: Date;
  updatedAt?: Date;
  status?: string;
  importedAt?: Date;
  category?: string;
  numChar?: number;
  thumbnailUrl?: string;
  descriptionLines?: Array<string>;
  crawleSource?: string;
  bookChunkInfosUrl?: string;
}
