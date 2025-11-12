import OpenAI from 'openai';

export class OpenAIClient {
  private client: OpenAI;

  constructor() {
    this.client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  public async textDetectionFromAI(imagebase64: string) {
    return this.client.chat.completions.create({
      model: 'gpt-5-mini',
      reasoning_effort: 'low',
      verbosity: 'low',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: '주어진 이미지는 한 기업의 채용 공고를 캡쳐한 이미지입니다. 해당 이미지를 보고 채용공고에 해당하는 내용만을 정리해서 반환해주세요. 내용은 반드시 자체적으로 변형하지 않고 원본 내용을 그대로 반환해주세요.',
            },
            {
              type: 'image_url',
              image_url: {
                url: `data:image/png;base64,${imagebase64}`,
                detail: 'auto',
              },
            },
          ],
        },
      ],
    });
  }
}
