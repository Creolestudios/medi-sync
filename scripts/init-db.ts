import neo4j, { Driver, Session } from 'neo4j-driver';
import { config } from 'dotenv';
import { join } from 'path';

// Load environment variables
config({ path: join(__dirname, '../.env') });

async function initializeDatabase() {
  const driver: Driver = neo4j.driver(
    process.env.NEO4J_URI || 'bolt://localhost:7687',
    neo4j.auth.basic(
      process.env.NEO4J_USER || 'neo4j',
      process.env.NEO4J_PASSWORD || 'password',
    ),
  );

  const session: Session = driver.session();

  try {
    console.log('Initializing MediSync database...');

    // Create constraints
    await session.run(`
      CREATE CONSTRAINT patient_id IF NOT EXISTS
      FOR (p:Patient) REQUIRE p.id IS UNIQUE
    `);

    await session.run(`
      CREATE CONSTRAINT record_id IF NOT EXISTS
      FOR (r:Record) REQUIRE r.id IS UNIQUE
    `);

    await session.run(`
      CREATE CONSTRAINT timeline_event_id IF NOT EXISTS
      FOR (e:TimelineEvent) REQUIRE e.id IS UNIQUE
    `);

    // Create indexes for better query performance
    await session.run(`
      CREATE INDEX patient_email IF NOT EXISTS
      FOR (p:Patient) ON (p.email)
    `).catch(() => {}); // Ignore if index already exists

    await session.run(`
      CREATE INDEX record_type IF NOT EXISTS
      FOR (r:Record) ON (r.type)
    `).catch(() => {});

    await session.run(`
      CREATE INDEX timeline_event_date IF NOT EXISTS
      FOR (e:TimelineEvent) ON (e.date)
    `).catch(() => {});

    // Create full-text search index for medical entities
    await session.run(`
      CALL db.index.fulltext.createNodeIndex(
        "medicalEntities",
        ["MedicalCondition", "Medication", "Procedure", "Allergy", "LabResult", "VitalSign"],
        ["name", "code", "display"]
      )
    `).catch((error: any) => {
      if (error.code !== 'Neo.ClientError.Schema.EquivalentSchemaRuleAlreadyExists') {
        console.warn('Full-text index creation warning:', error.message);
      }
    });

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  } finally {
    await session.close();
    await driver.close();
  }
}

initializeDatabase().catch(error => {
  console.error('Failed to initialize database:', error);
  process.exit(1);
});
