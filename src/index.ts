import dotenv from 'dotenv';
import mysql from 'mysql2/promise';
import { RecruitmentParsingService } from './service/recruitmentParsingService';

dotenv.config();

function main() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: parseInt(process.env.DB_PORT || '3306'),
  });
  const recruitmentParsingService = new RecruitmentParsingService(pool);
  recruitmentParsingService.parseRecruitmentsFromWaitingList();
}
main();
