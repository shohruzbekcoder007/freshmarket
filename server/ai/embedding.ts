import { pipeline } from "@xenova/transformers";

class LocalEmbeddingFunction {
  private pipe: any;
  private modelRepo: string;

  constructor(modelRepo: string = "Xenova/bge-m3") {
    this.modelRepo = modelRepo;
  }

  async load() {
    if (!this.pipe) {
      this.pipe = await pipeline("feature-extraction", this.modelRepo);
    }
  }

  public async generate(texts: string[]): Promise<number[][]> {
    await this.load();
    const embeddings: number[][] = [];

    for (const text of texts) {
      const output = await this.pipe(text, { pooling: "mean", normalize: true });
      embeddings.push(Array.from(output.data));
    }

    return embeddings;
  }
}

export const localEmbedder = new LocalEmbeddingFunction();
