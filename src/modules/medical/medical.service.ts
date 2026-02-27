import { Injectable, Inject, Logger } from '@nestjs/common';
import { NEO4J_DRIVER } from '../database/neo4j.constants';
import { Driver, Session } from 'neo4j-driver';
import { MedicalEntity, PatientRecord, PatientTimelineEvent, MedicalEntityType } from './types/medical.types';

@Injectable()
export class MedicalService {
  private readonly logger = new Logger(MedicalService.name);

  constructor(@Inject(NEO4J_DRIVER) private readonly neo4jDriver: Driver) {}

  async getPatientRecords(patientId: string): Promise<PatientRecord[]> {
    const session = this.neo4jDriver.session();
    
    try {
      const result = await session.run(
        `MATCH (p:Patient {id: $patientId})-[:HAS_RECORD]->(r:Record)
         RETURN r
         ORDER BY r.recordedDate DESC`,
        { patientId },
      );

      return result.records.map(record => {
        const r = record.get('r').properties;
        return {
          id: r.id,
          patientId,
          type: r.type,
          content: r.content,
          source: r.source,
          recordedDate: new Date(r.recordedDate.toString()),
          recordedBy: r.recordedBy,
          metadata: r.metadata || {},
        };
      });
    } catch (error) {
      this.logger.error(`Error getting patient records: ${error.message}`, error.stack);
      throw error;
    } finally {
      await session.close();
    }
  }

  async getPatientTimeline(patientId: string): Promise<PatientTimelineEvent[]> {
    const session = this.neo4jDriver.session();
    
    try {
      const result = await session.run(
        `MATCH (p:Patient {id: $patientId})-[:HAS_TIMELINE_EVENT]->(e:TimelineEvent)
         RETURN e
         ORDER BY e.date DESC`,
        { patientId },
      );

      return result.records.map(record => {
        const e = record.get('e').properties;
        return {
          id: e.id,
          type: e.type,
          title: e.title,
          description: e.description,
          date: new Date(e.date.toString()),
          entityType: e.entityType,
          entityId: e.entityId,
          source: e.source,
          metadata: e.metadata || {},
        };
      });
    } catch (error) {
      this.logger.error(`Error getting patient timeline: ${error.message}`, error.stack);
      throw error;
    } finally {
      await session.close();
    }
  }

  async getPatientEntities(
    patientId: string,
    entityType?: string,
  ): Promise<MedicalEntity[]> {
    const session = this.neo4jDriver.session();
    
    try {
      let query = `
        MATCH (p:Patient {id: $patientId})-[:HAS_ENTITY]->(e)
        WHERE e.type = $entityType OR $entityType IS NULL
        RETURN DISTINCT e
        ORDER BY e.name
      `;
      
      const result = await session.run(query, { patientId, entityType: entityType || null });

      return result.records.map(record => {
        const e = record.get('e').properties;
        return {
          id: e.id,
          type: e.type as MedicalEntityType,
          name: e.name,
          code: e.code,
          codeSystem: e.codeSystem,
          display: e.display,
          status: e.status,
          startDate: e.startDate ? new Date(e.startDate.toString()) : undefined,
          endDate: e.endDate ? new Date(e.endDate.toString()) : undefined,
          confidence: e.confidence,
          metadata: e.metadata || {},
        };
      });
    } catch (error) {
      this.logger.error(`Error getting patient entities: ${error.message}`, error.stack);
      throw error;
    } finally {
      await session.close();
    }
  }

  async getPatientSummary(patientId: string): Promise<{
    conditions: any[];
    medications: any[];
    procedures: any[];
    allergies: any[];
    labResults: any[];
    vitalSigns: any[];
  }> {
    try {
      const conditions = await this.getPatientEntities(patientId, 'CONDITION');
      const medications = await this.getPatientEntities(patientId, 'MEDICATION');
      const procedures = await this.getPatientEntities(patientId, 'PROCEDURE');
      const allergies = await this.getPatientEntities(patientId, 'ALLERGY');
      const labResults = await this.getPatientEntities(patientId, 'LAB_RESULT');
      const vitalSigns = await this.getPatientEntities(patientId, 'VITAL_SIGN');

      return {
        conditions,
        medications,
        procedures,
        allergies,
        labResults,
        vitalSigns,
      };
    } catch (error) {
      this.logger.error(`Error getting patient summary: ${error.message}`, error.stack);
      throw error;
    }
  }
}
