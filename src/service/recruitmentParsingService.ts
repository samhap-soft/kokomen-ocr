import { OpenAIClient } from '../ai';
import { ImageProcessor } from '../imageProcessor';
import { OCRWaitingListRow } from '../types';
import { createConnection } from '../utils/mysql';

export class RecruitmentParsingService {
  private imageProcessor: ImageProcessor;
  private openAIClient: OpenAIClient;

  constructor() {
    this.imageProcessor = new ImageProcessor();
    this.openAIClient = new OpenAIClient();
  }

  private async parseRecruitmentFromImage(imageUrl: string, imageId: string) {
    await this.imageProcessor.fetchImage(imageUrl, imageId);
    console.log('imageUrl', imageUrl);
    const imagebase64 = await this.imageProcessor.resizeImage(imageId);
    console.log('imagebase64');
    const text = await this.openAIClient.textDetectionFromAI(imagebase64);
    console.log('text', text.choices[0].message.content);
    return text.choices[0].message.content;
  }

  public async parseRecruitmentsFromWaitingList() {
    const connection = await createConnection();
    try {
      const [rows] = await connection.query<OCRWaitingListRow[]>('SELECT * FROM ocr_waiting_list');
      console.log(`Found ${rows.length} recruitments to parse`);

      let limit = 3;
      for (const row of rows) {
        console.log('ㅅㅂ', row);
        limit--;
        if (limit <= 0) {
          console.log('limit reached');
          return;
        }
        const { recruit_id, image_url, id } = row;
        const imageUrl = JSON.parse(image_url)[0];
        const text = await this.parseRecruitmentFromImage(imageUrl, recruit_id.toString());
        console.log(`Parsed recruitment ${recruit_id} with text : ${text}`);
        await connection.beginTransaction();
        console.log('beginTransaction');
        await connection.query('UPDATE recruit SET content = ? WHERE id = ?', [
          text?.toString(),
          recruit_id,
        ]);
        console.log('update recruit');
        await connection.query('DELETE FROM ocr_waiting_list WHERE id = ?', [id]);
        console.log('delete ocr_waiting_list');
        await connection.commit();
        console.log('commit');
      }
    } catch (error) {
      console.error('Error parsing recruitments from waiting list', error);
    } finally {
      await connection.end();
      console.log('connection end');
    }
  }
}
