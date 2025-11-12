import { OpenAIClient } from '../ai';
import { ImageProcessor } from '../imageProcessor';
import mysql from 'mysql2/promise';
import { OCRWaitingListRow } from '../types';

export class RecruitmentParsingService {
  private imageProcessor: ImageProcessor;
  private openAIClient: OpenAIClient;
  private pool: mysql.Pool;

  constructor(pool: mysql.Pool) {
    this.imageProcessor = new ImageProcessor();
    this.openAIClient = new OpenAIClient();
    this.pool = pool;
  }

  public async parseRecruitmentsFromWaitingList() {
    this.pool.execute<OCRWaitingListRow[]>('SELECT * FROM ocr_waiting_list').then(([rows]) => {
      rows.forEach((row) => {
        const { recruit_id, image_url } = row;
        this.imageProcessor.resizeImage(image_url).then((imagebase64) => {
          this.openAIClient.textDetectionFromAI(imagebase64).then((response) => {
            console.log(response.choices[0].message.content);
          });
        });
      });
    });
  }
}
