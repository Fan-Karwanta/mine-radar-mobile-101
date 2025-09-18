/**
 * Script to fix SQLite table constraints to allow duplicate MongoDB IDs
 * This will drop and recreate tables without UNIQUE constraints on record_id
 */

import * as SQLite from 'expo-sqlite';

class ConstraintFixer {
  constructor() {
    this.db = null;
  }

  async init() {
    try {
      this.db = await SQLite.openDatabaseAsync('mining_app.db');
      console.log('Database connection established');
    } catch (error) {
      console.error('Error connecting to database:', error);
      throw error;
    }
  }

  async fixConstraints() {
    try {
      await this.init();
      
      console.log('🔧 Starting to fix table constraints...');
      
      // Get current record counts before dropping tables
      const beforeCounts = await this.getCurrentCounts();
      console.log('📊 Current record counts:', beforeCounts);
      
      // Backup existing data
      console.log('💾 Backing up existing data...');
      const backupData = await this.backupExistingData();
      
      // Drop existing tables
      console.log('🗑️ Dropping existing tables...');
      await this.dropExistingTables();
      
      // Recreate tables without UNIQUE constraints
      console.log('🏗️ Recreating tables without UNIQUE constraints...');
      await this.createNewTables();
      
      // Restore data
      console.log('📥 Restoring backed up data...');
      await this.restoreData(backupData);
      
      // Verify restoration
      const afterCounts = await this.getCurrentCounts();
      console.log('📊 After restoration counts:', afterCounts);
      
      console.log('✅ Successfully fixed table constraints!');
      console.log('🎉 Tables now allow duplicate MongoDB IDs');
      
      return {
        success: true,
        message: 'Table constraints fixed successfully',
        beforeCounts,
        afterCounts
      };
      
    } catch (error) {
      console.error('❌ Error fixing constraints:', error);
      throw error;
    }
  }

  async getCurrentCounts() {
    try {
      const national = await this.db.getFirstAsync('SELECT COUNT(*) as count FROM directory_national');
      const local = await this.db.getFirstAsync('SELECT COUNT(*) as count FROM directory_local');
      const hotspots = await this.db.getFirstAsync('SELECT COUNT(*) as count FROM directory_hotspots');
      
      return {
        national: national?.count || 0,
        local: local?.count || 0,
        hotspots: hotspots?.count || 0,
        total: (national?.count || 0) + (local?.count || 0) + (hotspots?.count || 0)
      };
    } catch (error) {
      console.log('Tables may not exist yet, returning zero counts');
      return { national: 0, local: 0, hotspots: 0, total: 0 };
    }
  }

  async backupExistingData() {
    try {
      const backup = {
        national: [],
        local: [],
        hotspots: []
      };

      // Backup national data
      try {
        backup.national = await this.db.getAllAsync('SELECT * FROM directory_national');
        console.log(`📦 Backed up ${backup.national.length} national records`);
      } catch (error) {
        console.log('No national data to backup');
      }

      // Backup local data
      try {
        backup.local = await this.db.getAllAsync('SELECT * FROM directory_local');
        console.log(`📦 Backed up ${backup.local.length} local records`);
      } catch (error) {
        console.log('No local data to backup');
      }

      // Backup hotspots data
      try {
        backup.hotspots = await this.db.getAllAsync('SELECT * FROM directory_hotspots');
        console.log(`📦 Backed up ${backup.hotspots.length} hotspots records`);
      } catch (error) {
        console.log('No hotspots data to backup');
      }

      return backup;
    } catch (error) {
      console.error('Error backing up data:', error);
      return { national: [], local: [], hotspots: [] };
    }
  }

  async dropExistingTables() {
    try {
      await this.db.execAsync(`
        DROP TABLE IF EXISTS directory_national;
        DROP TABLE IF EXISTS directory_local;
        DROP TABLE IF EXISTS directory_hotspots;
      `);
      console.log('🗑️ Existing tables dropped successfully');
    } catch (error) {
      console.error('Error dropping tables:', error);
      throw error;
    }
  }

  async createNewTables() {
    try {
      // Directory National table - WITHOUT UNIQUE constraint
      await this.db.execAsync(`
        CREATE TABLE IF NOT EXISTS directory_national (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          record_id TEXT,
          contract_number TEXT,
          contractor TEXT,
          commodity TEXT,
          area TEXT,
          barangay TEXT,
          municipality TEXT,
          province TEXT,
          status TEXT,
          classification TEXT,
          type TEXT,
          proponent TEXT,
          contact_number TEXT,
          operator TEXT,
          date_filed TEXT,
          approval_date TEXT,
          renewal_date TEXT,
          expiration_date TEXT,
          source_of_raw_materials TEXT,
          google_map_link TEXT,
          synced_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // Directory Local table - WITHOUT UNIQUE constraint
      await this.db.execAsync(`
        CREATE TABLE IF NOT EXISTS directory_local (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          record_id TEXT,
          permit_number TEXT,
          permit_holder TEXT,
          commodities TEXT,
          area TEXT,
          barangays TEXT,
          municipality TEXT,
          province TEXT,
          status TEXT,
          classification TEXT,
          type TEXT,
          date_filed TEXT,
          date_approved TEXT,
          date_of_expiry TEXT,
          number_of_renewal INTEGER,
          date_of_first_issuance TEXT,
          google_map_link TEXT,
          synced_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // Directory Hotspots table - WITHOUT UNIQUE constraint
      await this.db.execAsync(`
        CREATE TABLE IF NOT EXISTS directory_hotspots (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          record_id TEXT,
          complaint_number TEXT,
          subject TEXT,
          type_of_commodity TEXT,
          barangay TEXT,
          municipality TEXT,
          province TEXT,
          actions_taken TEXT,
          nature_of_reported_illegal_act TEXT,
          sitio TEXT,
          longitude TEXT,
          latitude TEXT,
          details TEXT,
          laws_violated TEXT,
          number_of_cdo_issued INTEGER,
          remarks TEXT,
          date_of_action_taken TEXT,
          date_issued TEXT,
          google_map_link TEXT,
          synced_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
      `);

      console.log('🏗️ New tables created successfully without UNIQUE constraints');
    } catch (error) {
      console.error('Error creating new tables:', error);
      throw error;
    }
  }

  async restoreData(backupData) {
    try {
      let restoredCount = 0;

      // Restore national data
      for (const record of backupData.national) {
        await this.db.runAsync(
          `INSERT INTO directory_national 
           (record_id, contract_number, contractor, commodity, area, barangay, municipality, 
            province, status, classification, type, proponent, contact_number, operator, 
            date_filed, approval_date, renewal_date, expiration_date, source_of_raw_materials, 
            google_map_link, synced_at) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            record.record_id, record.contract_number, record.contractor, record.commodity,
            record.area, record.barangay, record.municipality, record.province,
            record.status, record.classification, record.type, record.proponent,
            record.contact_number, record.operator, record.date_filed, record.approval_date,
            record.renewal_date, record.expiration_date, record.source_of_raw_materials,
            record.google_map_link, record.synced_at
          ]
        );
        restoredCount++;
      }

      // Restore local data
      for (const record of backupData.local) {
        await this.db.runAsync(
          `INSERT INTO directory_local 
           (record_id, permit_number, permit_holder, commodities, area, barangays, 
            municipality, province, status, classification, type, date_filed, 
            date_approved, date_of_expiry, number_of_renewal, date_of_first_issuance, 
            google_map_link, synced_at) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            record.record_id, record.permit_number, record.permit_holder, record.commodities,
            record.area, record.barangays, record.municipality, record.province,
            record.status, record.classification, record.type, record.date_filed,
            record.date_approved, record.date_of_expiry, record.number_of_renewal,
            record.date_of_first_issuance, record.google_map_link, record.synced_at
          ]
        );
        restoredCount++;
      }

      // Restore hotspots data
      for (const record of backupData.hotspots) {
        await this.db.runAsync(
          `INSERT INTO directory_hotspots 
           (record_id, complaint_number, subject, type_of_commodity, barangay, municipality, 
            province, actions_taken, nature_of_reported_illegal_act, sitio, longitude, 
            latitude, details, laws_violated, number_of_cdo_issued, remarks, 
            date_of_action_taken, date_issued, google_map_link, synced_at) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            record.record_id, record.complaint_number, record.subject, record.type_of_commodity,
            record.barangay, record.municipality, record.province, record.actions_taken,
            record.nature_of_reported_illegal_act, record.sitio, record.longitude,
            record.latitude, record.details, record.laws_violated, record.number_of_cdo_issued,
            record.remarks, record.date_of_action_taken, record.date_issued, record.google_map_link,
            record.synced_at
          ]
        );
        restoredCount++;
      }

      console.log(`📥 Restored ${restoredCount} records successfully`);
    } catch (error) {
      console.error('Error restoring data:', error);
      throw error;
    }
  }
}

// Export for use in the app
export default ConstraintFixer;

// If running as standalone script
if (require.main === module) {
  const fixer = new ConstraintFixer();
  fixer.fixConstraints()
    .then(result => {
      console.log('✅ Constraint fix completed:', result);
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Constraint fix failed:', error);
      process.exit(1);
    });
}
