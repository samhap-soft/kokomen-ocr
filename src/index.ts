import dotenv from 'dotenv';
import { RecruitmentParsingService } from './service/recruitmentParsingService';

dotenv.config();

function main() {
  const recruitmentParsingService = new RecruitmentParsingService();
  recruitmentParsingService.parseRecruitmentsFromWaitingList();
}
main();
