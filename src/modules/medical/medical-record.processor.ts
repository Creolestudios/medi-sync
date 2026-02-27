import { Injectable, Inject, Logger } from '@nestjs/common';
import { NEO4J_DRIVER } from '../database/neo4j.constants';
import { Driver, Session } from 'neo4j-driver';
import { MedicalEntityRecognizer } from './medical-entity.recognizer';
import { MedicalEntity, PatientRecord, PatientTimelineEvent, MedicalEntityType } from './types/medical.types';

@Injectable()
export class MedicalRecordProcessor {
  private readonly logger = new Logger(MedicalRecordProcessor.name);

  constructor(
    @Inject(NEO4J_DRIVER) private readonly neo4jDriver: Driver,
    private readonly entityRecognizer: MedicalEntityRecognizer,
  ) {}

  async processRecord(record: PatientRecord): Promise<{
    recordId: string;
    entities: MedicalEntity[];
    timelineEvents: PatientTimelineEvent[];
  }> {
    const session = this.neo4jDriver.session();
    const recordId = record.id || `rec_${Date.now()}`;
    const entities: MedicalEntity[] = [];
    const timelineEvents: PatientTimelineEvent[] = [];
    
    try {
      // 1. Extract medical entities
      const extractedEntities = await this.entityRecognizer.extractEntities(record.content);
      entities.push(...extractedEntities);

      // 2. Extract medication information
      const medications = await this.entityRecognizer.analyzeMedication(record.content);
      
      // 3. Save record to Neo4j
      await session.run(
        `MATCH (p:Patient {id: $patientId})
         CREATE (r:Record {
           id: $recordId,
           type: $type,
           content: $content,
           source: $source,
           recordedDate: datetime($recordedDate),
           recordedBy: $recordedBy,
           createdAt: datetime(),
           updatedAt: datetime(),
           metadata: $metadata
         })
         CREATE (p)-[:HAS_RECORD]->(r)
         RETURN r`,
        {
          patientId: record.patientId,
          recordId,
          type: record.type,
          content: record.content,
          source: record.source,
          recordedDate: record.recordedDate.toISOString(),
          recordedBy: record.recordedBy,
          metadata: record.metadata || {},
        },
      );

      // 4. Process and save entities
      for (const entity of entities) {
        await this.saveEntity(session, record.patientId, recordId, entity);
        
        // Create timeline event for the entity
        const event: PatientTimelineEvent = {
          id: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          type: 'MEDICAL_EVENT',
          title: `${entity.type}: ${entity.display}`,
          description: `Identified ${entity.type.toLowerCase()} in ${record.type}`,
          date: record.recordedDate,
          entityType: entity.type as MedicalEntityType,
          entityId: entity.id,
          source: record.source,
          metadata: {
            recordId,
            recordType: record.type,
            ...entity.metadata,
          },
        };
        
        timelineEvents.push(event);
        await this.saveTimelineEvent(session, record.patientId, event);
      }

      // 5. Process medications
      for (const med of medications) {
        const medId = `med_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        // Create medication entity
        const medEntity: MedicalEntity = {
          id: medId,
          type: MedicalEntityType.MEDICATION,
          name: med.name,
          code: med.name, // In a real app, this would be a proper code
          codeSystem: 'RxNorm', // Would be determined from a code lookup
          display: med.name,
          status: med.status,
          startDate: med.startDate ? new Date(med.startDate) : undefined,
          endDate: med.endDate ? new Date(med.endDate) : undefined,
          metadata: {
            dosage: med.dosage,
            frequency: med.frequency,
            route: med.route,
            reason: med.reason,
          },
        };
        
        entities.push(medEntity);
        await this.saveEntity(session, record.patientId, recordId, medEntity);
        
        // Create timeline event for medication
        const event: PatientTimelineEvent = {
          id: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          type: 'MEDICATION_EVENT',
          title: `Medication: ${med.name}`,
          description: med.status === 'active' 
            ? `Prescribed ${med.name}${med.dosage ? ` (${med.dosage})` : ''}`
            : `${med.status} ${med.name}${med.reason ? ` - ${med.reason}` : ''}`,
          date: med.startDate ? new Date(med.startDate) : record.recordedDate,
          entityType: MedicalEntityType.MEDICATION,
          entityId: medId,
          source: record.source,
          metadata: {
            recordId,
            recordType: record.type,
            ...med,
          },
        };
        
        timelineEvents.push(event);
        await this.saveTimelineEvent(session, record.patientId, event);
      }

      return { recordId, entities, timelineEvents };
    } catch (error) {
      this.logger.error(`Error processing record: ${error.message}`, error.stack);
      throw error;
    } finally {
      await session.close();
    }
  }

  private async saveEntity(
    session: Session,
    patientId: string,
    recordId: string,
    entity: MedicalEntity,
  ): Promise<void> {
    const label = this.getEntityLabel(entity.type);
    
    await session.run(
      `MATCH (p:Patient {id: $patientId})
       MERGE (e:${label} {code: $code, codeSystem: $codeSystem})
       ON CREATE SET 
         e.id = $id,
         e.name = $name,
         e.display = $display,
         e.type = $type,
         e.status = $status,
         e.startDate = $startDate,
         e.endDate = $endDate,
         e.confidence = $confidence,
         e.metadata = $metadata,
         e.createdAt = datetime()
       ON MATCH SET
         e.updatedAt = datetime()
       WITH p, e
       MATCH (r:Record {id: $recordId})
       MERGE (r)-[rel:CONTAINS_ENTITY]->(e)
       MERGE (p)-[pr:HAS_ENTITY]->(e)
       RETURN e, rel, pr`,
      {
        patientId,
        recordId,
        id: entity.id,
        name: entity.name,
        code: entity.code,
        codeSystem: entity.codeSystem,
        display: entity.display,
        type: entity.type,
        status: entity.status || 'active',
        startDate: entity.startDate?.toISOString() || null,
        endDate: entity.endDate?.toISOString() || null,
        confidence: entity.confidence || 0.9,
        metadata: entity.metadata || {},
      },
    );
  }

  private async saveTimelineEvent(
    session: Session,
    patientId: string,
    event: PatientTimelineEvent,
  ): Promise<void> {
    await session.run(
      `MATCH (p:Patient {id: $patientId})
       CREATE (e:TimelineEvent {
         id: $id,
         type: $type,
         title: $title,
         description: $description,
         date: datetime($date),
         entityType: $entityType,
         entityId: $entityId,
         source: $source,
         createdAt: datetime(),
         updatedAt: datetime(),
         metadata: $metadata
       })
       CREATE (p)-[:HAS_TIMELINE_EVENT]->(e)
       RETURN e`,
      {
        patientId,
        id: event.id,
        type: event.type,
        title: event.title,
        description: event.description,
        date: event.date.toISOString(),
        entityType: event.entityType,
        entityId: event.entityId,
        source: event.source,
        metadata: event.metadata || {},
      },
    );
  }

  private getEntityLabel(type: MedicalEntityType): string {
    switch (type) {
      case MedicalEntityType.CONDITION:
        return 'MedicalCondition';
      case MedicalEntityType.MEDICATION:
        return 'Medication';
      case MedicalEntityType.PROCEDURE:
        return 'Procedure';
      case MedicalEntityType.ALLERGY:
        return 'Allergy';
      case MedicalEntityType.LAB_RESULT:
        return 'LabResult';
      case MedicalEntityType.VITAL_SIGN:
        return 'VitalSign';
      default:
        return 'MedicalEntity';
    }
  }
}
