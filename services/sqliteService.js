import SQLite from 'react-native-sqlite-storage';

// Enable debugging
SQLite.DEBUG(true);
SQLite.enablePromise(true);

class SQLiteService {
  constructor() {
    this.db = null;
    this.isInitialized = false;
  }

  // Initialize the database
  async init() {
    if (this.isInitialized) return;

    try {
      this.db = await SQLite.openDatabase({
        name: 'mining_app.db',
        location: 'default',
      });
      await this.createTables();
      this.isInitialized = true;
      console.log('SQLite database initialized successfully');
    } catch (error) {
      console.error('Error initializing SQLite database:', error);
      throw error;
    }
  }

  // Create all necessary tables
  async createTables() {
    try {
      // First, drop existing tables to remove UNIQUE constraints
      console.log('🔧 Dropping existing tables to remove UNIQUE constraints...');
      await this.db.executeSql('DROP TABLE IF EXISTS directory_national');
      await this.db.executeSql('DROP TABLE IF EXISTS directory_local');
      await this.db.executeSql('DROP TABLE IF EXISTS directory_hotspots');
      console.log('🗑️ Old tables dropped successfully');
      
      // User authentication table
      await this.db.executeSql(`
        CREATE TABLE IF NOT EXISTS user_auth (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id TEXT UNIQUE,
          username TEXT,
          email TEXT,
          token TEXT,
          is_logged_in INTEGER DEFAULT 1,
          last_login DATETIME DEFAULT CURRENT_TIMESTAMP,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Directory National table - REMOVED UNIQUE constraint to allow duplicate MongoDB IDs
      await this.db.executeSql(`
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
        )
      `);

      // Directory Local table - REMOVED UNIQUE constraint to allow duplicate MongoDB IDs
      await this.db.executeSql(`
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
        )
      `);

      // Directory Hotspots table - REMOVED UNIQUE constraint to allow duplicate MongoDB IDs
      await this.db.executeSql(`
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
        )
      `);

      // Sync status table to track download progress
      await this.db.executeSql(`
        CREATE TABLE IF NOT EXISTS sync_status (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          table_name TEXT UNIQUE,
          total_records INTEGER DEFAULT 0,
          downloaded_records INTEGER DEFAULT 0,
          last_sync DATETIME,
          is_syncing INTEGER DEFAULT 0,
          sync_progress REAL DEFAULT 0.0
        )
      `);

      // Report drafts table for offline draft storage
      await this.db.executeSql(`
        CREATE TABLE IF NOT EXISTS report_drafts (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          draft_id TEXT UNIQUE,
          reporter_id TEXT,
          report_type TEXT,
          status TEXT DEFAULT 'draft',
          language TEXT DEFAULT 'english',
          gps_location TEXT,
          location TEXT,
          incident_date TEXT,
          incident_time TEXT,
          project_info TEXT,
          commodity TEXT,
          site_status TEXT,
          operator_info TEXT,
          additional_info TEXT,
          form_data TEXT,
          attachments TEXT,
          is_synced INTEGER DEFAULT 0,
          needs_sync INTEGER DEFAULT 1,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          synced_at DATETIME
        )
      `);

      // Initialize sync status for each table
      await this.db.executeSql(`
        INSERT OR IGNORE INTO sync_status (table_name) VALUES 
        ('directory_national')
      `);
      await this.db.executeSql(`
        INSERT OR IGNORE INTO sync_status (table_name) VALUES 
        ('directory_local')
      `);
      await this.db.executeSql(`
        INSERT OR IGNORE INTO sync_status (table_name) VALUES 
        ('directory_hotspots')
      `);

      console.log('✅ All SQLite tables created successfully WITHOUT UNIQUE constraints');
    } catch (error) {
      console.error('Error creating SQLite tables:', error);
      throw error;
    }
  }

  // Force recreate tables without UNIQUE constraints
  async forceRecreateTablesWithoutConstraints() {
    try {
      console.log('🔄 Force recreating tables without UNIQUE constraints...');
      
      // Drop all directory tables
      await this.db.executeSql('DROP TABLE IF EXISTS directory_national');
      await this.db.executeSql('DROP TABLE IF EXISTS directory_local');
      await this.db.executeSql('DROP TABLE IF EXISTS directory_hotspots');
      
      // Recreate tables without UNIQUE constraints
      await this.createDirectoryTables();
      
      console.log('✅ Tables successfully recreated without UNIQUE constraints');
      return true;
    } catch (error) {
      console.error('Error force recreating tables:', error);
      return false;
    }
  }

  // Create just the directory tables (separated for reuse)
  async createDirectoryTables() {
    // Directory National table - WITHOUT UNIQUE constraint
    await this.db.executeSql(`
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
      )
    `);

    // Directory Local table - WITHOUT UNIQUE constraint
    await this.db.executeSql(`
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
      )
    `);

    // Directory Hotspots table - WITHOUT UNIQUE constraint
    await this.db.executeSql(`
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
      )
    `);
  }

  // Save user authentication data
  async saveUserAuth(user, token) {
    try {
      await this.init();
      
      // Clear existing auth data
      await this.db.executeSql('DELETE FROM user_auth');
      
      // Insert new auth data
      await this.db.executeSql(
        `INSERT INTO user_auth (user_id, username, email, token, is_logged_in, last_login) 
         VALUES (?, ?, ?, ?, 1, datetime('now'))`,
        [user.id, user.username, user.email, token]
      );
      
      console.log('✅ User auth saved to SQLite');
    } catch (error) {
      console.error('❌ Error saving user auth:', error);
      throw error;
    }
  }

  // Get user authentication data
  async getUserAuth() {
    try {
      await this.init();
      
      const results = await this.db.executeSql(
        'SELECT * FROM user_auth WHERE is_logged_in = 1 ORDER BY last_login DESC LIMIT 1'
      );
      
      if (results[0].rows.length > 0) {
        return results[0].rows.item(0);
      }
      
      return null;
    } catch (error) {
      console.error('❌ Error getting user auth:', error);
      return null;
    }
  }

  // Clear user authentication data
  async clearUserAuth() {
    try {
      await this.init();
      await this.db.executeSql('UPDATE user_auth SET is_logged_in = 0');
      console.log('✅ User auth cleared from SQLite');
    } catch (error) {
      console.error('❌ Error clearing user auth:', error);
    }
  }

  // Insert directory record
  async insertDirectoryRecord(tableName, record) {
    try {
      await this.init();
      
      if (tableName === 'directory_national') {
        await this.db.executeSql(
          `INSERT INTO directory_national (
            record_id, contract_number, contractor, commodity, area, barangay,
            municipality, province, status, classification, type, proponent,
            contact_number, operator, date_filed, approval_date, renewal_date,
            expiration_date, source_of_raw_materials, google_map_link
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            record._id, record.contractNumber, record.contractor, record.commodity,
            record.area, record.barangay, record.municipality, record.province,
            record.status, record.classification, record.type, record.proponent,
            record.contactNumber, record.operator, record.dateFiled,
            record.approvalDate, record.renewalDate, record.expirationDate,
            record.sourceOfRawMaterials, record.googleMapLink
          ]
        );
      } else if (tableName === 'directory_local') {
        await this.db.executeSql(
          `INSERT INTO directory_local (
            record_id, permit_number, permit_holder, commodities, area, barangays,
            municipality, province, status, classification, type, date_filed,
            date_approved, date_of_expiry, number_of_renewal, date_of_first_issuance,
            google_map_link
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            record._id, record.permitNumber, record.permitHolder, record.commodities,
            record.area, record.barangays, record.municipality, record.province,
            record.status, record.classification, record.type, record.dateFiled,
            record.dateApproved, record.dateOfExpiry, record.numberOfRenewal,
            record.dateOfFirstIssuance, record.googleMapLink
          ]
        );
      } else if (tableName === 'directory_hotspots') {
        await this.db.executeSql(
          `INSERT INTO directory_hotspots (
            record_id, complaint_number, subject, type_of_commodity, barangay,
            municipality, province, actions_taken, nature_of_reported_illegal_act,
            sitio, longitude, latitude, details, laws_violated, number_of_cdo_issued,
            remarks, date_of_action_taken, date_issued, google_map_link
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            record._id, record.complaintNumber, record.subject, record.typeOfCommodity,
            record.barangay, record.municipality, record.province, record.actionsTaken,
            record.natureOfReportedIllegalAct, record.sitio, record.longitude,
            record.latitude, record.details, record.lawsViolated, record.numberOfCdoIssued,
            record.remarks, record.dateOfActionTaken, record.dateIssued, record.googleMapLink
          ]
        );
      }
    } catch (error) {
      console.error(`❌ Error inserting ${tableName} record:`, error);
      throw error;
    }
  }

  // Get directory records with pagination
  async getDirectoryRecords(tableName, params = {}) {
    try {
      await this.init();
      
      const { search = '', limit = 20, page = 1, forcePagination = false } = params;
      const offset = (page - 1) * limit;
      
      let whereClause = '';
      let queryParams = [];
      
      if (search) {
        if (tableName === 'directory_national') {
          whereClause = `WHERE contract_number LIKE ? OR contractor LIKE ? OR municipality LIKE ?`;
          queryParams = [`%${search}%`, `%${search}%`, `%${search}%`];
        } else if (tableName === 'directory_local') {
          whereClause = `WHERE permit_number LIKE ? OR permit_holder LIKE ? OR municipality LIKE ?`;
          queryParams = [`%${search}%`, `%${search}%`, `%${search}%`];
        } else if (tableName === 'directory_hotspots') {
          whereClause = `WHERE complaint_number LIKE ? OR subject LIKE ? OR municipality LIKE ?`;
          queryParams = [`%${search}%`, `%${search}%`, `%${search}%`];
        }
      }
      
      let query = `SELECT * FROM ${tableName} ${whereClause} ORDER BY id DESC`;
      
      if (forcePagination || limit) {
        query += ` LIMIT ${limit} OFFSET ${offset}`;
      }
      
      const results = await this.db.executeSql(query, queryParams);
      const records = [];
      
      for (let i = 0; i < results[0].rows.length; i++) {
        records.push(results[0].rows.item(i));
      }
      
      // Get total count for pagination
      const countQuery = `SELECT COUNT(*) as total FROM ${tableName} ${whereClause}`;
      const countResults = await this.db.executeSql(countQuery, queryParams);
      const total = countResults[0].rows.item(0).total;
      
      return {
        data: records,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalRecords: total,
          hasMore: offset + records.length < total
        }
      };
    } catch (error) {
      console.error(`❌ Error getting ${tableName} records:`, error);
      return { data: [], pagination: { currentPage: 1, totalPages: 0, totalRecords: 0, hasMore: false } };
    }
  }

  // Update sync status
  async updateSyncStatus(tableName, totalRecords, downloadedRecords) {
    try {
      await this.init();
      
      const progress = totalRecords > 0 ? (downloadedRecords / totalRecords) : 0;
      
      await this.db.executeSql(
        `UPDATE sync_status 
         SET total_records = ?, downloaded_records = ?, sync_progress = ?, last_sync = datetime('now')
         WHERE table_name = ?`,
        [totalRecords, downloadedRecords, progress, tableName]
      );
    } catch (error) {
      console.error('❌ Error updating sync status:', error);
    }
  }

  // Get sync status
  async getSyncStatus(tableName) {
    try {
      await this.init();
      
      const results = await this.db.executeSql(
        'SELECT * FROM sync_status WHERE table_name = ?',
        [tableName]
      );
      
      if (results[0].rows.length > 0) {
        return results[0].rows.item(0);
      }
      
      return null;
    } catch (error) {
      console.error('❌ Error getting sync status:', error);
      return null;
    }
  }

  // Save offline draft
  async saveOfflineDraft(draftData) {
    try {
      await this.init();
      
      await this.db.executeSql(
        `INSERT INTO report_drafts (
          draft_id, reporter_id, report_type, status, language, gps_location,
          location, incident_date, incident_time, project_info, commodity,
          site_status, operator_info, additional_info, form_data, attachments,
          is_synced, needs_sync
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          draftData.draft_id, draftData.reporter_id, draftData.report_type,
          draftData.status, draftData.language, draftData.gps_location,
          draftData.location, draftData.incident_date, draftData.incident_time,
          draftData.project_info, draftData.commodity, draftData.site_status,
          draftData.operator_info, draftData.additional_info,
          JSON.stringify(draftData.form_data), JSON.stringify(draftData.attachments),
          0, 1
        ]
      );
      
      console.log('✅ Draft saved to SQLite');
    } catch (error) {
      console.error('❌ Error saving offline draft:', error);
      throw error;
    }
  }

  // Get offline drafts
  async getOfflineDrafts(reporterId) {
    try {
      await this.init();
      
      const results = await this.db.executeSql(
        'SELECT * FROM report_drafts WHERE reporter_id = ? ORDER BY created_at DESC',
        [reporterId]
      );
      
      const drafts = [];
      for (let i = 0; i < results[0].rows.length; i++) {
        const draft = results[0].rows.item(i);
        draft.form_data = JSON.parse(draft.form_data || '{}');
        draft.attachments = JSON.parse(draft.attachments || '[]');
        drafts.push(draft);
      }
      
      return drafts;
    } catch (error) {
      console.error('❌ Error getting offline drafts:', error);
      return [];
    }
  }

  // Update offline draft
  async updateOfflineDraft(draftId, draftData) {
    try {
      await this.init();
      
      await this.db.executeSql(
        `UPDATE report_drafts SET
          report_type = ?, status = ?, language = ?, gps_location = ?,
          location = ?, incident_date = ?, incident_time = ?, project_info = ?,
          commodity = ?, site_status = ?, operator_info = ?, additional_info = ?,
          form_data = ?, attachments = ?, needs_sync = 1, updated_at = datetime('now')
         WHERE draft_id = ?`,
        [
          draftData.report_type, draftData.status, draftData.language,
          draftData.gps_location, draftData.location, draftData.incident_date,
          draftData.incident_time, draftData.project_info, draftData.commodity,
          draftData.site_status, draftData.operator_info, draftData.additional_info,
          JSON.stringify(draftData.form_data), JSON.stringify(draftData.attachments),
          draftId
        ]
      );
      
      console.log('✅ Draft updated in SQLite');
    } catch (error) {
      console.error('❌ Error updating offline draft:', error);
      throw error;
    }
  }

  // Delete offline draft
  async deleteOfflineDraft(draftId) {
    try {
      await this.init();
      
      await this.db.executeSql(
        'DELETE FROM report_drafts WHERE draft_id = ?',
        [draftId]
      );
      
      console.log('✅ Draft deleted from SQLite');
    } catch (error) {
      console.error('❌ Error deleting offline draft:', error);
      throw error;
    }
  }

  // Get unsynced drafts
  async getUnsyncedDrafts() {
    try {
      await this.init();
      
      const results = await this.db.executeSql(
        'SELECT * FROM report_drafts WHERE needs_sync = 1 AND is_synced = 0'
      );
      
      const drafts = [];
      for (let i = 0; i < results[0].rows.length; i++) {
        const draft = results[0].rows.item(i);
        draft.form_data = JSON.parse(draft.form_data || '{}');
        draft.attachments = JSON.parse(draft.attachments || '[]');
        drafts.push(draft);
      }
      
      return drafts;
    } catch (error) {
      console.error('❌ Error getting unsynced drafts:', error);
      return [];
    }
  }

  // Mark draft as synced
  async markDraftAsSynced(draftId) {
    try {
      await this.init();
      
      await this.db.executeSql(
        'UPDATE report_drafts SET is_synced = 1, needs_sync = 0, synced_at = datetime(\'now\') WHERE draft_id = ?',
        [draftId]
      );
      
      console.log('✅ Draft marked as synced');
    } catch (error) {
      console.error('❌ Error marking draft as synced:', error);
      throw error;
    }
  }

  // Clear all data
  async clearAllData() {
    try {
      await this.init();
      
      await this.db.executeSql('DELETE FROM directory_national');
      await this.db.executeSql('DELETE FROM directory_local');
      await this.db.executeSql('DELETE FROM directory_hotspots');
      await this.db.executeSql('DELETE FROM sync_status');
      
      // Re-initialize sync status
      await this.db.executeSql(`INSERT OR IGNORE INTO sync_status (table_name) VALUES ('directory_national')`);
      await this.db.executeSql(`INSERT OR IGNORE INTO sync_status (table_name) VALUES ('directory_local')`);
      await this.db.executeSql(`INSERT OR IGNORE INTO sync_status (table_name) VALUES ('directory_hotspots')`);
      
      console.log('✅ All directory data cleared from SQLite');
    } catch (error) {
      console.error('❌ Error clearing all data:', error);
      throw error;
    }
  }
}

// Export singleton instance
const sqliteService = new SQLiteService();
export default sqliteService;
