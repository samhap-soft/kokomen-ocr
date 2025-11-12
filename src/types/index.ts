import mysql from 'mysql2/promise';

interface OCRWaitingListRow extends mysql.RowDataPacket {
  recruit_id: number;
  image_url: string;
}

export type { OCRWaitingListRow };
