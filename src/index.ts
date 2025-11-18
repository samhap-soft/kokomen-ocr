import dotenv from 'dotenv';
import { RecruitmentParsingService } from './service/recruitmentParsingService';

dotenv.config();

function main() {
  try {
    const recruitmentParsingService = new RecruitmentParsingService();
    recruitmentParsingService.parseRecruitmentsFromWaitingList();
    console.log('Recruitments parsed successfully');
  } catch (error) {
    console.error('Error in main function', error);
  }
}
main();
