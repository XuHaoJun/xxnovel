import fsPromise from "fs/promises";

import { Injectable } from "@nestjs/common";
import { ElasticsearchService as NestElasticsearchService } from "@nestjs/elasticsearch";

// const BASE_COMPONENT_INDEX = "base_component_index";
const BOOKINFO_INDEX_TEMPLATGE = "bookinfo_template";
// const BOOKCHUNK_INDEX_TEMPLATGE = "bookchunk_index_template";

@Injectable()
export class ElasticsearchUsecase {
  constructor(private readonly esClient: NestElasticsearchService) {}

  public async initIndices() {
    const bookinfoTemplate = this.getBookInfoTemplate();
    const indexName = "bookinfo-000001";
    const isExists = await this.esClient.indices.exists({ index: indexName });
    if (!isExists) {
      await this.esClient.indices.create({
        index: indexName,
        body: bookinfoTemplate.template,
      });
      await this.esClient.indices.putAlias({
        index: indexName,
        name: "bookinfo-write",
      });
    }
  }

  // elasticsearch cloud service(like bonsai) can't use index template
  public async initTemplates() {
    const body = {
      index_patterns: ["bookinfo-*"],
      template: this.getBookInfoTemplate(),
    };
    console.log(`${BOOKINFO_INDEX_TEMPLATGE} putIndexTemplate:`);
    console.log(JSON.stringify(body, null, 2));
    await this.esClient.indices.putIndexTemplate({
      name: BOOKINFO_INDEX_TEMPLATGE,
      body,
    });
  }

  private getBookInfoTemplate() {
    const baseComponentIndex = this.getBaseCompoentIndex();
    const bookInfoProperties = {
      category: {
        type: "keyword",
      },
      status: {
        type: "keyword",
      },
      title: {
        type: "text",
        analyzer: "text_analyzer",
        fielddata: true,
      },
      authorName: {
        type: "text",
        analyzer: "text_analyzer",
        fielddata: true,
      },
      description: {
        type: "text",
        analyzer: "text_analyzer",
        fielddata: true,
      },
      updatedAt: {
        type: "date",
      },
      numChar: {
        type: "integer",
      },
      thumbnailUrl: {
        type: "keyword",
      },
      crawleSource: {
        type: "keyword",
      },
    };
    return {
      index_patterns: ["bookinfo-*"],
      template: {
        ...baseComponentIndex.template,
        mappings: {
          ...baseComponentIndex.template.mappings,
          properties: bookInfoProperties,
        },
      },
    };
  }

  private getBaseCompoentIndex() {
    const zhTwSimpleStopwords = ElasticsearchUsecase.getZhTwSimpleStopwords();
    return {
      template: {
        settings: {
          number_of_shards: 1,
          number_of_replicas: 1,
          analysis: {
            analyzer: {
              text_analyzer: {
                type: "custom",
                tokenizer: "whitespace",
                filter: ["zh_tw_simple_stopwords_filter"],
              },
              hyphen_split_analyzer: {
                type: "custom",
                tokenizer: "hyphen_tokenizer",
              },
              underscore_split_analyzer: {
                type: "custom",
                tokenizer: "underscore_tokenizer",
              },
              colon_split_analyzer: {
                type: "custom",
                tokenizer: "colon_tokenizer",
              },
              semicolon_split_analyzer: {
                type: "custom",
                tokenizer: "semicolon_tokenizer",
              },
              comma_split_analyzer: {
                type: "custom",
                tokenizer: "comma_tokenizer",
              },
              slash_split_analyzer: {
                type: "custom",
                tokenizer: "slash_tokenizer",
              },
            },
            tokenizer: {
              hyphen_tokenizer: {
                type: "pattern",
                pattern: "-",
              },
              underscore_tokenizer: {
                type: "pattern",
                pattern: "_",
              },
              colon_tokenizer: {
                type: "pattern",
                pattern: ":",
              },
              semicolon_tokenizer: {
                type: "pattern",
                pattern: ";",
              },
              comma_tokenizer: {
                type: "pattern",
                pattern: ",",
              },
              slash_tokenizer: {
                type: "pattern",
                pattern: "/",
              },
            },
            filter: {
              zh_tw_simple_stopwords_filter: {
                type: "stop",
                ignore_case: true,
                stopwords: zhTwSimpleStopwords,
              },
            },
          },
        },
        mappings: {
          _source: {
            enabled: true,
          },
          dynamic_date_formats: [
            "YYYY-MM-dd hh:mm:ss",
            "strict_date_optional_time||epoch_millis",
          ],
          dynamic: true,
          dynamic_templates: [
            {
              keyword: {
                match_mapping_type: "string",
                match_pattern: "regex",
                match: "^.+_KEYWORD$",
                mapping: {
                  type: "keyword",
                },
              },
            },
            {
              text: {
                match_mapping_type: "string",
                match_pattern: "regex",
                match: "^.+_TEXT$",
                mapping: {
                  type: "text",
                  analyzer: "text_analyzer",
                  fielddata: true,
                },
              },
            },
            {
              float: {
                match_pattern: "regex",
                match: "^.+_FLOAT$",
                mapping: {
                  type: "float",
                },
              },
            },
            {
              integer: {
                match_mapping_type: "long",
                match_pattern: "regex",
                match: "^.+_INT$",
                mapping: {
                  type: "integer",
                },
              },
            },
            {
              date: {
                match_pattern: "regex",
                match: "^.+_DATE$",
                mapping: {
                  type: "date",
                },
              },
            },
            {
              boolean: {
                match_pattern: "regex",
                match: "^.+_BOOLEAN$",
                mapping: {
                  type: "boolean",
                },
              },
            },
            {
              binary: {
                match_pattern: "regex",
                match: "^.+_BINARY$",
                mapping: {
                  type: "binary",
                },
              },
            },
            {
              byte: {
                match_pattern: "regex",
                match: "^.+_BYTE$",
                mapping: {
                  type: "byte",
                },
              },
            },
            {
              double: {
                match_pattern: "regex",
                match: "^.+_DOUBLE$",
                mapping: {
                  type: "double",
                },
              },
            },
            {
              short: {
                match_pattern: "regex",
                match: "^.+_SHORT$",
                mapping: {
                  type: "short",
                },
              },
            },
            {
              long: {
                match_pattern: "regex",
                match: "^.+_LONG$",
                mapping: {
                  type: "long",
                },
              },
            },
            {
              ip: {
                match_pattern: "regex",
                match: "^.+_IP$",
                mapping: {
                  type: "ip",
                },
              },
            },
            {
              hyphen_split: {
                match_mapping_type: "string",
                match_pattern: "regex",
                match: "^.+_TEXT_HYPHEN$",
                mapping: {
                  type: "text",
                  analyzer: "hyphen_split_analyzer",
                  fielddata: true,
                },
              },
            },
            {
              underscore_split: {
                match_mapping_type: "string",
                match_pattern: "regex",
                match: "^.+_TEXT_UNDERSCORE$",
                mapping: {
                  type: "text",
                  analyzer: "underscore_split_analyzer",
                  fielddata: true,
                },
              },
            },
            {
              colon_split: {
                match_mapping_type: "string",
                match_pattern: "regex",
                match: "^.+_TEXT_COLON$",
                mapping: {
                  type: "text",
                  analyzer: "colon_split_analyzer",
                  fielddata: true,
                },
              },
            },
            {
              semicolon_split: {
                match_mapping_type: "string",
                match_pattern: "regex",
                match: "^.+_TEXT_SEMICOLON$",
                mapping: {
                  type: "text",
                  analyzer: "semicolon_split_analyzer",
                  fielddata: true,
                },
              },
            },
            {
              comma_split: {
                match_mapping_type: "string",
                match_pattern: "regex",
                match: "^.+_TEXT_COMMA$",
                mapping: {
                  type: "text",
                  analyzer: "comma_split_analyzer",
                  fielddata: true,
                },
              },
            },
            {
              slash_split: {
                match_mapping_type: "string",
                match_pattern: "regex",
                match: "^.+_TEXT_SLASH$",
                mapping: {
                  type: "text",
                  analyzer: "slash_split_analyzer",
                  fielddata: true,
                },
              },
            },
          ],
        },
      },
    };
  }

  public static async getZhTwSimpleStopwords(
    path = "data/zh_tw_stopwords.txt"
  ): Promise<Array<string>> {
    const text = await fsPromise.readFile(path, "utf-8");
    return text.split("\n");
  }
}
