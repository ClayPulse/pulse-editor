export class BaseTTS {
  model: any;
  constructor(model: any) {
    this.model = model;
  }

  async generate(text: string): Promise<Blob> {
    return await this.model.invoke(text);
  }
}
