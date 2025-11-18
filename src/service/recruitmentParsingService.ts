import { OpenAIClient } from '../ai';
import { OCRWaitingListRow } from '../types';
import { createConnection } from '../utils/mysql';
import { ImageService } from './imageService';

export class RecruitmentParsingService {
  private imageService: ImageService;
  private openAIClient: OpenAIClient;

  constructor() {
    this.imageService = new ImageService();
    this.openAIClient = new OpenAIClient();
  }

  private async parseRecruitmentFromImage(imageUrl: string, imageId: string) {
    await this.imageService.fetchImage(imageUrl, imageId);
    const imagebase64 = await this.imageService.resizeImage(imageId);
    const text = await this.openAIClient.textDetectionFromAI(imagebase64);
    return text;
  }

  public async parseRecruitmentsFromWaitingList() {
    const connection = await createConnection();
    const [rows] = await connection.query<OCRWaitingListRow[]>('SELECT * FROM ocr_waiting_list');
    await connection.end();

    rows.forEach(async (row) => {
      const connection = await createConnection();
      const { recruit_id, image_url, id } = row;
      const text = await this.parseRecruitmentFromImage(image_url, recruit_id.toString());
      await connection.query('UPDATE recruit SET text = ? WHERE id = ?', [text, recruit_id]);
      await connection.query('DELETE FROM ocr_waiting_list WHERE id = ?', [id]);
      await connection.end();
    });
  }
}
