import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  UseGuards,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
  Query,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiConsumes, ApiBody, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { MedicalRecordProcessor } from './medical-record.processor';
import { MedicalService } from './medical.service';
import { PatientRecord } from './types/medical.types';

@ApiTags('medical')
@Controller('medical')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
export class MedicalController {
  constructor(
    private readonly medicalRecordProcessor: MedicalRecordProcessor,
    private readonly medicalService: MedicalService,
  ) {}

  @Post('records')
  @ApiOperation({ summary: 'Process a medical record' })
  @ApiResponse({ status: 201, description: 'Record processed successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  async processRecord(@Body() record: PatientRecord) {
    try {
      return await this.medicalRecordProcessor.processRecord(record);
    } catch (error) {
      throw new BadRequestException(`Failed to process record: ${error.message}`);
    }
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
        patientId: { type: 'string' },
        type: { type: 'string', enum: ['CLINICAL_NOTE', 'LAB_RESULT', 'PRESCRIPTION', 'IMAGING', 'OTHER'] },
        source: { type: 'string' },
        recordedBy: { type: 'string' },
      },
    },
  })
  @ApiOperation({ summary: 'Upload and process a medical record file' })
  @ApiResponse({ status: 201, description: 'File uploaded and processed' })
  @ApiResponse({ status: 400, description: 'Invalid file or input' })
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body('patientId') patientId: string,
    @Body('type') type: string,
    @Body('source') source: string,
    @Body('recordedBy') recordedBy: string,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const record: PatientRecord = {
      patientId,
      type: type as any,
      content: file.buffer.toString('utf-8'),
      source,
      recordedBy,
      recordedDate: new Date(),
      metadata: {
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
      },
    };

    try {
      return await this.medicalRecordProcessor.processRecord(record);
    } catch (error) {
      throw new BadRequestException(`Failed to process file: ${error.message}`);
    }
  }

  @Get('patients/:id/records')
  @ApiOperation({ summary: 'Get all records for a patient' })
  @ApiResponse({ status: 200, description: 'List of patient records' })
  @ApiResponse({ status: 404, description: 'Patient not found' })
  async getPatientRecords(@Param('id') patientId: string) {
    return this.medicalService.getPatientRecords(patientId);
  }

  @Get('patients/:id/timeline')
  @ApiOperation({ summary: 'Get patient timeline' })
  @ApiResponse({ status: 200, description: 'Patient timeline events' })
  @ApiResponse({ status: 404, description: 'Patient not found' })
  async getPatientTimeline(@Param('id') patientId: string) {
    return this.medicalService.getPatientTimeline(patientId);
  }

  @Get('patients/:id/entities')
  @ApiOperation({ summary: 'Get all medical entities for a patient' })
  @ApiQuery({ name: 'type', required: false, description: 'Filter by entity type' })
  @ApiResponse({ status: 200, description: 'List of medical entities' })
  @ApiResponse({ status: 404, description: 'Patient not found' })
  async getPatientEntities(
    @Param('id') patientId: string,
    @Query('type') type?: string,
  ) {
    return this.medicalService.getPatientEntities(patientId, type);
  }

  @Get('patients/:id/summary')
  @ApiOperation({ summary: 'Get patient medical summary' })
  @ApiResponse({ status: 200, description: 'Patient medical summary' })
  @ApiResponse({ status: 404, description: 'Patient not found' })
  async getPatientSummary(@Param('id') patientId: string) {
    return this.medicalService.getPatientSummary(patientId);
  }
}
