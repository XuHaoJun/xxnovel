export interface IBookChunk {
  chapterName?: string;
  sectionName?: string;
  url?: string;
  createdAt?: Date;
  importedAt?: Date;
  contentLines?: Array<string>;
}

export interface IBook {
  title?: string;
  authorName?: string;
  chunks?: Array<IBookChunk>;
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
