export enum MedicalEntityType {
  CONDITION = 'CONDITION',
  MEDICATION = 'MEDICATION',
  PROCEDURE = 'PROCEDURE',
  ALLERGY = 'ALLERGY',
  LAB_RESULT = 'LAB_RESULT',
  VITAL_SIGN = 'VITAL_SIGN',
}

export interface MedicalEntity {
  id: string;
  type: MedicalEntityType;
  name: string;
  code: string;
  codeSystem: string;
  display: string;
  confidence?: number;
  startDate?: Date;
  endDate?: Date;
  status?: string;
  metadata?: Record<string, any>;
}

export interface PatientRecord {
  id?: string;
  patientId: string;
  type: 'CLINICAL_NOTE' | 'LAB_RESULT' | 'PRESCRIPTION' | 'IMAGING' | 'OTHER';
  content: string;
  source: string;
  recordedDate: Date;
  recordedBy: string;
  metadata?: Record<string, any>;
}

export interface PatientTimelineEvent {
  id: string;
  type: string;
  title: string;
  description: string;
  date: Date;
  entityType: MedicalEntityType;
  entityId: string;
  source: string;
  metadata?: Record<string, any>;
}
