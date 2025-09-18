import * as SQLite from 'expo-sqlite';

class SQLiteService {
  constructor() {
    this.db = null;
    this.isInitialized = false;
  }

  // Initialize the database
  async init() {
    if (this.isInitialized) return;

    try {
      this.db = await SQLite.openDatabaseAsync('mining_app.db');
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
      await this.db.execAsync(`
        DROP TABLE IF EXISTS directory_national;
        DROP TABLE IF EXISTS directory_local;
        DROP TABLE IF EXISTS directory_hotspots;
      `);
      console.log('🗑️ Old tables dropped successfully');
      // User authentication table
      await this.db.execAsync(`
        CREATE TABLE IF NOT EXISTS user_auth (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id TEXT UNIQUE,
          username TEXT,
          email TEXT,
          token TEXT,
          is_logged_in INTEGER DEFAULT 1,
          last_login DATETIME DEFAULT CURRENT_TIMESTAMP,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // Directory National table - REMOVED UNIQUE constraint to allow duplicate MongoDB IDs
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

      // Directory Local table - REMOVED UNIQUE constraint to allow duplicate MongoDB IDs
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

      // Directory Hotspots table - REMOVED UNIQUE constraint to allow duplicate MongoDB IDs
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

      // Sync status table to track download progress
      await this.db.execAsync(`
        CREATE TABLE IF NOT EXISTS sync_status (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          table_name TEXT UNIQUE,
          total_records INTEGER DEFAULT 0,
          downloaded_records INTEGER DEFAULT 0,
          last_sync DATETIME,
          is_syncing INTEGER DEFAULT 0,
          sync_progress REAL DEFAULT 0.0
        );
      `);

      // Initialize sync status for each table
      await this.db.execAsync(`
        INSERT OR IGNORE INTO sync_status (table_name) VALUES 
        ('directory_national'),
        ('directory_local'),
        ('directory_hotspots');
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
      await this.db.execAsync(`
        DROP TABLE IF EXISTS directory_national;
        DROP TABLE IF EXISTS directory_local;
        DROP TABLE IF EXISTS directory_hotspots;
      `);
      
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
  }

  // User Authentication Methods
  async saveUserAuth(user, token) {
    try {
      await this.init();
      
      await this.db.runAsync(
        `INSERT OR REPLACE INTO user_auth 
         (user_id, username, email, token, is_logged_in, last_login) 
         VALUES (?, ?, ?, ?, 1, CURRENT_TIMESTAMP)`,
        [user.id || user._id, user.username, user.email, token]
      );
      
      console.log('User authentication saved to SQLite');
      return true;
    } catch (error) {
      console.error('Error saving user auth to SQLite:', error);
      return false;
    }
  }

  async getUserAuth() {
    try {
      await this.init();
      
      const result = await this.db.getFirstAsync(
        'SELECT * FROM user_auth WHERE is_logged_in = 1 ORDER BY last_login DESC LIMIT 1'
      );
      
      return result;
    } catch (error) {
      console.error('Error getting user auth from SQLite:', error);
      return null;
    }
  }

  async clearUserAuth() {
    try {
      await this.init();
      
      await this.db.runAsync('UPDATE user_auth SET is_logged_in = 0');
      console.log('User authentication cleared from SQLite');
      return true;
    } catch (error) {
      console.error('Error clearing user auth from SQLite:', error);
      return false;
    }
  }

  // Directory Data Methods
  async saveDirectoryData(tableName, records) {
    try {
      await this.init();
      
      const tableMap = {
        'national': 'directory_national',
        'local': 'directory_local',
        'hotspots': 'directory_hotspots'
      };
      
      const sqliteTableName = tableMap[tableName];
      if (!sqliteTableName) {
        throw new Error(`Invalid table name: ${tableName}`);
      }

      // Force recreate tables to ensure no UNIQUE constraints exist
      console.log(`🔧 Ensuring ${sqliteTableName} has no UNIQUE constraints...`);
      await this.forceRecreateTablesWithoutConstraints();

      // Clear existing data
      await this.db.runAsync(`DELETE FROM ${sqliteTableName}`);
      
      console.log(`📝 Starting to save ALL ${records.length} records to ${sqliteTableName} (including duplicates)`);
      
      // Insert ALL records - no duplicate filtering, save everything from MongoDB
      let successCount = 0;
      let errorCount = 0;
      let duplicateCount = 0;
      const seenIds = new Set();
      
      for (const record of records) {
        try {
          // Validate record before inserting
          if (!record || !record._id) {
            console.warn(`⚠️ Skipping invalid record (no ID):`, record);
            errorCount++;
            continue;
          }

          // Track duplicate IDs for reporting purposes only (still save them all)
          if (seenIds.has(record._id)) {
            duplicateCount++;
            console.log(`🔄 Duplicate MongoDB ID detected: ${record._id} (saving as separate record #${duplicateCount})`);
          } else {
            seenIds.add(record._id);
          }

          // Save ALL records including duplicates
          await this.insertDirectoryRecord(sqliteTableName, record);
          successCount++;
          
          // Log progress every 50 records
          if (successCount % 50 === 0) {
            console.log(`📊 Progress: ${successCount}/${records.length} records saved to ${sqliteTableName}`);
          }
        } catch (insertError) {
          errorCount++;
          console.error(`❌ Failed to insert record ${record._id}:`, insertError.message);
          console.error('📋 Record data sample:', {
            id: record._id,
            hasRequiredFields: !!(record.contractNumber || record.permitNumber || record.complaintNumber),
            fieldCount: Object.keys(record).length,
            nullFields: Object.keys(record).filter(key => record[key] === null || record[key] === undefined)
          });
        }
      }
      
      // Log duplicate information (for reporting only - we saved them all)
      if (duplicateCount > 0) {
        console.log(`🔄 Found ${duplicateCount} duplicate MongoDB IDs in ${sqliteTableName} batch`);
        console.log(`📊 Unique MongoDB IDs: ${seenIds.size}, Total MongoDB records: ${records.length}, Duplicate IDs: ${duplicateCount}`);
        console.log(`💾 ALL ${records.length} records saved to SQLite (including ${duplicateCount} with duplicate MongoDB IDs)`);
      }
      
      // Update sync status with actual saved count
      await this.updateSyncStatus(sqliteTableName, records.length, successCount);
      
      // Verify actual SQLite count matches total MongoDB records (not unique count)
      const actualCount = await this.db.getFirstAsync(`SELECT COUNT(*) as count FROM ${sqliteTableName}`);
      const expectedTotalCount = records.length;
      
      console.log(`✅ Saved ${successCount}/${records.length} records to ${sqliteTableName}`);
      console.log(`📊 SQLite verification: Expected ${expectedTotalCount} total records, Found ${actualCount.count} in database`);
      
      if (actualCount.count !== expectedTotalCount) {
        console.warn(`⚠️ SQLite count mismatch! Expected: ${expectedTotalCount}, Actual: ${actualCount.count}`);
      } else {
        console.log(`🎉 Perfect match! All ${expectedTotalCount} MongoDB records saved to SQLite`);
      }
      
      if (errorCount > 0) {
        console.warn(`⚠️ Failed to save ${errorCount} records to ${sqliteTableName}`);
      }
      
      if (duplicateCount > 0) {
        console.log(`🔄 Summary: ${duplicateCount} duplicate MongoDB IDs found, but ALL ${records.length} records saved to SQLite`);
      }
      
      return {
        success: successCount === records.length,
        totalProcessed: records.length,
        successCount: successCount,
        errorCount: errorCount,
        duplicateCount: duplicateCount,
        uniqueMongoIds: seenIds.size,
        totalSavedToSQLite: successCount
      };
    } catch (error) {
      console.error(`Error saving directory data to SQLite:`, error);
      return false;
    }
  }

  async insertDirectoryRecord(tableName, record) {
    try {
      switch (tableName) {
        case 'directory_national':
          await this.db.runAsync(
            `INSERT INTO directory_national 
             (record_id, contract_number, contractor, commodity, area, barangay, municipality, 
              province, status, classification, type, proponent, contact_number, operator, 
              date_filed, approval_date, renewal_date, expiration_date, source_of_raw_materials, 
              google_map_link) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              record._id, record.contractNumber, record.contractor, record.commodity,
              record.area, record.barangay, record.municipality, record.province,
              record.status, record.classification, record.type, record.proponent,
              record.contactNumber, record.operator, record.dateFiled, record.approvalDate,
              record.renewalDate, record.expirationDate, record.sourceOfRawMaterials,
              record.googleMapLink
            ]
          );
          break;

        case 'directory_local':
          await this.db.runAsync(
            `INSERT INTO directory_local 
             (record_id, permit_number, permit_holder, commodities, area, barangays, 
              municipality, province, status, classification, type, date_filed, 
              date_approved, date_of_expiry, number_of_renewal, date_of_first_issuance, 
              google_map_link) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              record._id, record.permitNumber, record.permitHolder, record.commodities,
              record.area, record.barangays, record.municipality, record.province,
              record.status, record.classification, record.type, record.dateFiled,
              record.dateApproved, record.dateOfExpiry, record.numberOfRenewal,
              record.dateOfFirstIssuance, record.googleMapLink
            ]
          );
          break;

        case 'directory_hotspots':
          await this.db.runAsync(
            `INSERT INTO directory_hotspots 
             (record_id, complaint_number, subject, type_of_commodity, barangay, municipality, 
              province, actions_taken, nature_of_reported_illegal_act, sitio, longitude, 
              latitude, details, laws_violated, number_of_cdo_issued, remarks, 
              date_of_action_taken, date_issued, google_map_link) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              record._id, record.complaintNumber, record.subject, record.typeOfCommodity,
              record.barangay, record.municipality, record.province, record.actionsTaken,
              record.natureOfReportedIllegalAct, record.sitio, record.longitude,
              record.latitude, record.details, record.lawsViolated, record.numberOfCDOIssued,
              record.remarks, record.dateOfActionTaken, record.dateIssued, record.googleMapLink
            ]
          );
          break;
      }
    } catch (error) {
      console.error(`Error inserting record into ${tableName}:`, error);
      throw error;
    }
  }

  async getDirectoryData(tableName, params = {}) {
    try {
      await this.init();
      
      const tableMap = {
        'national': 'directory_national',
        'local': 'directory_local',
        'hotspots': 'directory_hotspots'
      };
      
      const sqliteTableName = tableMap[tableName];
      if (!sqliteTableName) {
        throw new Error(`Invalid table name: ${tableName}`);
      }

      let query = `SELECT * FROM ${sqliteTableName}`;
      const queryParams = [];
      const conditions = [];

      // Add search condition
      if (params.search) {
        const searchFields = this.getSearchFields(tableName);
        const searchConditions = searchFields.map(field => `${field} LIKE ?`).join(' OR ');
        conditions.push(`(${searchConditions})`);
        searchFields.forEach(() => queryParams.push(`%${params.search}%`));
      }

      // Add filter conditions
      if (params.province && params.province !== 'all') {
        conditions.push('province = ?');
        queryParams.push(params.province);
      }

      if (params.status && params.status !== 'all') {
        const statusField = tableName === 'hotspots' ? 'actions_taken' : 'status';
        conditions.push(`${statusField} = ?`);
        queryParams.push(params.status);
      }

      if (params.classification && params.classification !== 'all') {
        const classField = tableName === 'hotspots' ? 'nature_of_reported_illegal_act' : 'classification';
        conditions.push(`${classField} = ?`);
        queryParams.push(params.classification);
      }

      if (params.type && params.type !== 'all') {
        const typeField = tableName === 'hotspots' ? 'type_of_commodity' : 'type';
        conditions.push(`${typeField} = ?`);
        queryParams.push(params.type);
      }

      if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
      }

      query += ' ORDER BY id DESC';

      // For offline data, we don't need pagination limits - show all matching records
      // Only apply pagination if specifically requested for large datasets
      const shouldPaginate = params.forcePagination && params.limit;
      
      if (shouldPaginate) {
        query += ' LIMIT ?';
        queryParams.push(params.limit);
        
        if (params.page && params.page > 1) {
          query += ' OFFSET ?';
          queryParams.push((params.page - 1) * params.limit);
        }
      }

      const records = await this.db.getAllAsync(query, queryParams);
      
      // Get total count for pagination info
      let totalCount = records.length;
      if (shouldPaginate) {
        // Get total count without pagination
        const countQuery = query.replace(/ORDER BY.*$/, '').replace(/LIMIT.*$/, '');
        const countResult = await this.db.getFirstAsync(
          `SELECT COUNT(*) as count FROM (${countQuery})`,
          queryParams.slice(0, queryParams.length - (params.page > 1 ? 2 : 1))
        );
        totalCount = countResult.count;
      }
      
      // Transform SQLite records back to original format
      const transformedRecords = records.map(record => this.transformSQLiteRecord(tableName, record));
      
      return {
        success: true,
        data: transformedRecords,
        pagination: {
          currentPage: params.page || 1,
          totalRecords: totalCount,
          hasNext: shouldPaginate ? (params.page * params.limit < totalCount) : false,
          hasPrev: shouldPaginate ? (params.page > 1) : false
        }
      };
    } catch (error) {
      console.error(`Error getting directory data from SQLite:`, error);
      return { success: false, data: [] };
    }
  }

  getSearchFields(tableName) {
    const searchFieldsMap = {
      'national': ['contract_number', 'contractor', 'commodity', 'municipality', 'province'],
      'local': ['permit_number', 'permit_holder', 'commodities', 'municipality', 'province'],
      'hotspots': ['complaint_number', 'subject', 'type_of_commodity', 'municipality', 'province']
    };
    
    return searchFieldsMap[tableName] || [];
  }

  transformSQLiteRecord(tableName, record) {
    switch (tableName) {
      case 'national':
        return {
          _id: record.record_id,
          contractNumber: record.contract_number,
          contractor: record.contractor,
          commodity: record.commodity,
          area: record.area,
          barangay: record.barangay,
          municipality: record.municipality,
          province: record.province,
          status: record.status,
          classification: record.classification,
          type: record.type,
          proponent: record.proponent,
          contactNumber: record.contact_number,
          operator: record.operator,
          dateFiled: record.date_filed,
          approvalDate: record.approval_date,
          renewalDate: record.renewal_date,
          expirationDate: record.expiration_date,
          sourceOfRawMaterials: record.source_of_raw_materials,
          googleMapLink: record.google_map_link
        };

      case 'local':
        return {
          _id: record.record_id,
          permitNumber: record.permit_number,
          permitHolder: record.permit_holder,
          commodities: record.commodities,
          area: record.area,
          barangays: record.barangays,
          municipality: record.municipality,
          province: record.province,
          status: record.status,
          classification: record.classification,
          type: record.type,
          dateFiled: record.date_filed,
          dateApproved: record.date_approved,
          dateOfExpiry: record.date_of_expiry,
          numberOfRenewal: record.number_of_renewal,
          dateOfFirstIssuance: record.date_of_first_issuance,
          googleMapLink: record.google_map_link
        };

      case 'hotspots':
        return {
          _id: record.record_id,
          complaintNumber: record.complaint_number,
          subject: record.subject,
          typeOfCommodity: record.type_of_commodity,
          barangay: record.barangay,
          municipality: record.municipality,
          province: record.province,
          actionsTaken: record.actions_taken,
          natureOfReportedIllegalAct: record.nature_of_reported_illegal_act,
          sitio: record.sitio,
          longitude: record.longitude,
          latitude: record.latitude,
          details: record.details,
          lawsViolated: record.laws_violated,
          numberOfCDOIssued: record.number_of_cdo_issued,
          remarks: record.remarks,
          dateOfActionTaken: record.date_of_action_taken,
          dateIssued: record.date_issued,
          googleMapLink: record.google_map_link
        };

      default:
        return record;
    }
  }

  // Sync Status Methods
  async updateSyncStatus(tableName, totalRecords, downloadedRecords) {
    try {
      await this.init();
      
      const progress = totalRecords > 0 ? (downloadedRecords / totalRecords) * 100 : 0;
      
      await this.db.runAsync(
        `UPDATE sync_status 
         SET total_records = ?, downloaded_records = ?, sync_progress = ?, 
             last_sync = CURRENT_TIMESTAMP, is_syncing = ?
         WHERE table_name = ?`,
        [totalRecords, downloadedRecords, progress, downloadedRecords < totalRecords ? 1 : 0, tableName]
      );
      
      return true;
    } catch (error) {
      console.error('Error updating sync status:', error);
      return false;
    }
  }

  async getSyncStatus(tableName = null) {
    try {
      await this.init();
      
      let query = 'SELECT * FROM sync_status';
      const params = [];
      
      if (tableName) {
        query += ' WHERE table_name = ?';
        params.push(tableName);
      }
      
      const result = tableName 
        ? await this.db.getFirstAsync(query, params)
        : await this.db.getAllAsync(query);
      
      return result;
    } catch (error) {
      console.error('Error getting sync status:', error);
      return null;
    }
  }

  async isDataDownloaded(tableName) {
    try {
      const status = await this.getSyncStatus(tableName);
      return status && status.downloaded_records > 0;
    } catch (error) {
      console.error('Error checking if data is downloaded:', error);
      return false;
    }
  }

  // Utility Methods
  async clearAllData() {
    try {
      await this.init();
      
      await this.db.execAsync(`
        DELETE FROM directory_national;
        DELETE FROM directory_local;
        DELETE FROM directory_hotspots;
        UPDATE sync_status SET total_records = 0, downloaded_records = 0, sync_progress = 0.0, is_syncing = 0;
      `);
      
      console.log('All directory data cleared from SQLite');
      return true;
    } catch (error) {
      console.error('Error clearing all data:', error);
      return false;
    }
  }

  async getStorageInfo() {
    try {
      await this.init();
      
      const nationalCount = await this.db.getFirstAsync('SELECT COUNT(*) as count FROM directory_national');
      const localCount = await this.db.getFirstAsync('SELECT COUNT(*) as count FROM directory_local');
      const hotspotsCount = await this.db.getFirstAsync('SELECT COUNT(*) as count FROM directory_hotspots');
      
      return {
        national: nationalCount.count,
        local: localCount.count,
        hotspots: hotspotsCount.count,
        total: nationalCount.count + localCount.count + hotspotsCount.count
      };
    } catch (error) {
      console.error('Error getting storage info:', error);
      return { national: 0, local: 0, hotspots: 0, total: 0 };
    }
  }
}

export default new SQLiteService();
