import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { MedicalEntity, MedicalEntityType } from './types/medical.types';

@Injectable()
export class MedicalEntityRecognizer {
  private readonly logger = new Logger(MedicalEntityRecognizer.name);
  private genAI: GoogleGenerativeAI;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('GOOGLE_API_KEY');
    if (!apiKey) {
      throw new Error('GOOGLE_API_KEY is not configured');
    }
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  async extractEntities(text: string): Promise<MedicalEntity[]> {
    const model = this.genAI.getGenerativeModel({ model: "gemini-pro" });
    
    const prompt = `Analyze the following clinical text and extract medical entities in JSON format.
For each entity, include:
- type: One of ${Object.values(MedicalEntityType).join(', ')}
- name: The name of the entity
- code: Standard medical code (e.g., SNOMED CT, RxNorm, LOINC)
- codeSystem: The coding system (e.g., "SNOMED_CT", "RxNorm", "LOINC")
- display: Human-readable display text
- confidence: Confidence score (0-1)
- status: Clinical status if applicable
- startDate: When the condition/medication started (if mentioned)
- endDate: When the condition/medication ended (if mentioned)

Return only a JSON array of entities, no other text.

Clinical Text:
${text.substring(0, 10000)}`; // Limit text length

    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const entities: MedicalEntity[] = JSON.parse(response.text());
      
      // Add IDs and validate entities
      return entities.map(entity => ({
        ...entity,
        id: `ent_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        confidence: entity.confidence || 0.9,
        metadata: entity.metadata || {},
      }));
    } catch (error) {
      this.logger.error('Error extracting medical entities:', error);
      throw new Error(`Failed to extract medical entities: ${error.message}`);
    }
  }

  async analyzeMedication(text: string): Promise<{
    name: string;
    dosage?: string;
    frequency?: string;
    route?: string;
    startDate?: string;
    endDate?: string;
    status?: 'active' | 'completed' | 'stopped';
    reason?: string;
  }[]> {
    const model = this.genAI.getGenerativeModel({ model: "gemini-pro" });
    
    const prompt = `Extract medication information from the following clinical text.
For each medication, include:
- name: Medication name
- dosage: Dosage information
- frequency: How often it's taken
- route: Route of administration (oral, IV, etc.)
- startDate: When it was started (if mentioned)
- endDate: When it was stopped (if mentioned)
- status: active, completed, or stopped
- reason: Reason for taking or stopping

Return only a JSON array of medications, no other text.

Clinical Text:
${text.substring(0, 10000)}`;

    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return JSON.parse(response.text());
    } catch (error) {
      this.logger.error('Error analyzing medication:', error);
      throw new Error(`Failed to analyze medication: ${error.message}`);
    }
  }
}
