import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MedicalRecordProcessor } from './medical-record.processor';
import { MedicalEntityRecognizer } from './medical-entity.recognizer';
import { MedicalController } from './medical.controller';
import { MedicalService } from './medical.service';

@Module({
  imports: [ConfigModule],
  controllers: [MedicalController],
  providers: [MedicalRecordProcessor, MedicalEntityRecognizer, MedicalService],
  exports: [MedicalRecordProcessor, MedicalEntityRecognizer, MedicalService],
})
export class MedicalModule {}
